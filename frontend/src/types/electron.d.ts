export interface ElectronAPI {
  renameFile: (originalPath: string, newName: string) => Promise<{
    success: boolean;
    message: string;
    newPath?: string;
    originalPath?: string;
    error?: string;
  }>;

  renamePath: (originalPath: string, newName: string) => Promise<{
    success: boolean;
    message: string;
    newPath?: string;
    originalPath?: string;
    error?: string;
  }>;

  validateFilename: (filename: string) => Promise<{
    valid: boolean;
    message: string;
  }>;

  showOpenDialog: (options: {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'>;
  }) => Promise<{
    canceled: boolean;
    filePaths: string[];
  }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}