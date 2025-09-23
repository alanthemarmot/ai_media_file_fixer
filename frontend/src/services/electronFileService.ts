// Check if we're running in Electron
const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!window.electronAPI;
};

export interface RenameFileResponse {
  success: boolean;
  message: string;
  newPath?: string;
  originalPath?: string;
  error?: string;
}

export const electronFileService = {
  /**
   * Check if Electron file operations are available
   */
  isAvailable: (): boolean => {
    return isElectron();
  },

  /**
   * Rename a file using Electron's native file system
   */
  renameFile: async (originalPath: string, newName: string): Promise<RenameFileResponse> => {
    if (!isElectron()) {
      throw new Error('Electron file operations are not available');
    }

    try {
      const result = await window.electronAPI.renameFile(originalPath, newName);
      return result;
    } catch (error) {
      throw new Error(`Failed to rename file: ${String(error)}`);
    }
  },

  /**
   * Rename a path (file or directory) using Electron's native file system
   */
  renamePath: async (originalPath: string, newName: string): Promise<RenameFileResponse> => {
    if (!isElectron()) {
      throw new Error('Electron file operations are not available');
    }

    try {
      const result = await window.electronAPI.renamePath(originalPath, newName);
      return result;
    } catch (error) {
      throw new Error(`Failed to rename path: ${String(error)}`);
    }
  },

  /**
   * Validate a filename using Electron's validation
   */
  validateFilename: async (filename: string): Promise<{ valid: boolean; message: string }> => {
    if (!isElectron()) {
      throw new Error('Electron file operations are not available');
    }

    try {
      const result = await window.electronAPI.validateFilename(filename);
      return result;
    } catch (error) {
      throw new Error(`Failed to validate filename: ${String(error)}`);
    }
  },

  /**
   * Show native file dialog to select a file
   */
  showOpenDialog: async (mode: 'file' | 'directory' = 'file'): Promise<string | null> => {
    if (!isElectron()) {
      throw new Error('Electron file operations are not available');
    }

    try {
      const isDir = mode === 'directory';
      const result = await window.electronAPI.showOpenDialog({
        title: isDir ? 'Select Folder to Rename' : 'Select File to Rename',
        properties: isDir ? ['openDirectory'] : ['openFile'],
        filters: isDir
          ? undefined
          : [
              { name: 'Video Files', extensions: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'm4v'] },
              { name: 'Audio Files', extensions: ['mp3', 'flac', 'wav', 'aac', 'm4a', 'ogg'] },
              { name: 'All Files', extensions: ['*'] }
            ]
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      return result.filePaths[0];
    } catch (error) {
      throw new Error(`Failed to show file dialog: ${String(error)}`);
    }
  }
};