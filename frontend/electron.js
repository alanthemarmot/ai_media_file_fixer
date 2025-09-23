const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

async function createWindow() {
  // Try multiple icon paths
  const iconPaths = [
    path.join(__dirname, 'assets/icon.icns'),
    path.join(__dirname, 'assets/icon.png'),
    path.join(__dirname, 'public/mfr_icon.png'),
    path.join(__dirname, 'dist/mfr_icon.png'),
    // Fallback to repo images directory (useful in dev)
    path.join(__dirname, 'images/mfr_icon.png')
  ];

  let iconPath = null;
  for (const testPath of iconPaths) {
    if (fs.existsSync(testPath)) {
      iconPath = testPath;
      console.log(`Found icon at: ${iconPath}`);
      break;
    } else {
      console.log(`Icon not found at: ${testPath}`);
    }
  }

  const mainWindow = new BrowserWindow({
    width: 1500,
    height:1200,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: iconPath,
    show: false, // Don't show until ready
    titleBarStyle: 'default'
  });

  // Load the app
  if (isDev) {
    // Try different ports for dev server
    const devPorts = [5173, 5174, 5175];
    let loaded = false;

    for (const port of devPorts) {
      try {
        await mainWindow.loadURL(`http://localhost:${port}`);
        console.log(`Loaded dev server on port ${port}`);
        loaded = true;
        break;
      } catch (error) {
        console.log(`Port ${port} not available, trying next...`);
      }
    }

    if (!loaded) {
      console.error('Could not connect to dev server on any port');
      mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }

    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationUrl) => {
    navigationEvent.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// IPC handlers for file operations
ipcMain.handle('rename-file', async (_, originalPath, newName) => {
  try {
    // Validate inputs
    if (!originalPath || !newName) {
      return {
        success: false,
        message: 'Original path and new name are required',
        error: 'INVALID_INPUT'
      };
    }

    // Check if the original file exists
    if (!fs.existsSync(originalPath)) {
      return {
        success: false,
        message: `File not found: ${originalPath}`,
        error: 'FILE_NOT_FOUND'
      };
    }

    // Check if it's actually a file (not a directory)
    const stats = fs.statSync(originalPath);
    if (!stats.isFile()) {
      return {
        success: false,
        message: `Path is not a file: ${originalPath}`,
        error: 'NOT_A_FILE'
      };
    }

    // Create the new path by combining the parent directory with the new name
    const originalFile = path.parse(originalPath);
    const newFilePath = path.join(originalFile.dir, newName);

    // Check if a file with the new name already exists
    if (fs.existsSync(newFilePath)) {
      return {
        success: false,
        message: `A file with the name '${newName}' already exists in the same directory`,
        error: 'FILE_EXISTS'
      };
    }

    // Validate filename for the current operating system
    const invalidChars = ['<', '>', ':', '"', '|', '?', '*'];
    if (process.platform === 'win32') {
      invalidChars.push('/', '\\');
    } else {
      invalidChars.push('\0'); // null character for Unix-like systems
    }

    for (const char of invalidChars) {
      if (newName.includes(char)) {
        return {
          success: false,
          message: `Filename contains invalid character: '${char}'`,
          error: 'INVALID_FILENAME'
        };
      }
    }

    // Check filename length (255 bytes is common limit)
    if (Buffer.byteLength(newName, 'utf8') > 255) {
      return {
        success: false,
        message: 'Filename is too long (maximum 255 bytes)',
        error: 'FILENAME_TOO_LONG'
      };
    }

    // Perform the rename
    fs.renameSync(originalPath, newFilePath);

    return {
      success: true,
      message: `File successfully renamed from '${originalFile.base}' to '${newName}'`,
      newPath: newFilePath,
      originalPath: originalPath
    };

  } catch (error) {
    console.error('Error renaming file:', error);

    if (error.code === 'EACCES' || error.code === 'EPERM') {
      return {
        success: false,
        message: 'Permission denied. Unable to rename the file. Check file permissions.',
        error: 'PERMISSION_DENIED'
      };
    }

    return {
      success: false,
      message: `Unexpected error occurred: ${error.message}`,
      error: 'UNKNOWN_ERROR'
    };
  }
});

ipcMain.handle('validate-filename', async (_, filename) => {
  try {
    // Check for empty filename
    if (!filename || !filename.trim()) {
      return {
        valid: false,
        message: 'Filename cannot be empty'
      };
    }

    // Check for invalid characters
    const invalidChars = ['<', '>', ':', '"', '|', '?', '*'];
    if (process.platform === 'win32') {
      invalidChars.push('/', '\\');
    } else {
      invalidChars.push('\0'); // null character for Unix-like systems
    }

    for (const char of invalidChars) {
      if (filename.includes(char)) {
        return {
          valid: false,
          message: `Filename contains invalid character: '${char}'`
        };
      }
    }

    // Check for reserved names (Windows)
    if (process.platform === 'win32') {
      const reservedNames = [
        'CON', 'PRN', 'AUX', 'NUL',
        'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
        'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
      ];
      const nameWithoutExt = filename.split('.')[0].toUpperCase();
      if (reservedNames.includes(nameWithoutExt)) {
        return {
          valid: false,
          message: `Filename uses a reserved name: '${nameWithoutExt}'`
        };
      }
    }

    // Check filename length (255 bytes is common limit)
    if (Buffer.byteLength(filename, 'utf8') > 255) {
      return {
        valid: false,
        message: 'Filename is too long (maximum 255 bytes)'
      };
    }

    return {
      valid: true,
      message: 'Filename is valid'
    };

  } catch (error) {
    console.error('Error validating filename:', error);
    return {
      valid: false,
      message: `Error validating filename: ${error.message}`
    };
  }
});

// File dialog handler
ipcMain.handle('show-open-dialog', async (_, options) => {
  try {
    const result = await dialog.showOpenDialog(options);
    return result;
  } catch (error) {
    console.error('Error showing open dialog:', error);
    return {
      canceled: true,
      filePaths: []
    };
  }
});