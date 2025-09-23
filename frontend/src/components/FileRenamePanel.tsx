import { useState, useEffect } from 'react';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { SelectedFileInfo } from '../hooks/useFileRename';

interface FileRenamePanelProps {
  selectedFile: SelectedFileInfo;
  isRenaming: boolean;
  onRename: (newName: string) => Promise<boolean>;
  onCancel: () => void;
}

export default function FileRenamePanel({
  selectedFile,
  isRenaming,
  onRename,
  onCancel,
}: FileRenamePanelProps) {
  const [newBaseName, setNewBaseName] = useState(selectedFile.suggestedBaseName);

  useEffect(() => {
    setNewBaseName(selectedFile.suggestedBaseName);
  }, [selectedFile.suggestedBaseName]);

  const handleRename = async () => {
    if (newBaseName.trim()) {
      // Combine the base name with the original extension
      const fullNewName = newBaseName.trim() + selectedFile.originalExtension;

      const success = await onRename(fullNewName);
      if (success) {
        // Show success message based on whether we had a path or not
        const message = selectedFile.detectedPath
          ? `File renamed successfully!\n\n` +
            `File: ${selectedFile.detectedPath}\n` +
            `Original: ${selectedFile.originalName}\n` +
            `New name: ${fullNewName}\n\n` +
            `File extension "${selectedFile.originalExtension}" was preserved automatically.`
          : `Rename demonstration completed!\n\n` +
            `Original: ${selectedFile.originalName}\n` +
            `New name: ${fullNewName}\n\n` +
            `File extension "${selectedFile.originalExtension}" was preserved automatically.\n\n` +
            `Note: For actual file renaming, this would need to be run as a desktop application ` +
            `or use drag-and-drop from your file manager.`;

        alert(message);
        onCancel(); // Clear the selection
      } else {
        alert('Failed to rename file. Please try again.');
      }
    }
  };

  const getContextDescription = () => {
    switch (selectedFile.context) {
      case 'episode':
        return 'TV Episode';
      case 'movie':
        return 'Movie';
      case 'directory':
        return 'Folder';
      default:
        return 'Media File';
    }
  };

  return (
    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Rename {selectedFile.context === 'directory' ? 'Folder' : 'File'} for {getContextDescription()}
        </h4>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          disabled={isRenaming}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Selected {selectedFile.context === 'directory' ? 'Folder' : 'File'}:
          </label>
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {selectedFile.originalName}
          </div>
          {selectedFile.detectedPath && (
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              ✓ Path detected: {selectedFile.detectedPath}
            </div>
          )}
          {!selectedFile.detectedPath && (
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              ℹ️ Demonstration mode - actual renaming requires desktop app or drag-and-drop
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {selectedFile.context === 'directory' ? 'New Folder Name' : 'New File Name (without extension)'}:
          </label>
          <div className="flex items-center">
            <input
              type="text"
              value={newBaseName}
              onChange={(e) => setNewBaseName(e.target.value)}
              disabled={isRenaming}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
              placeholder="Enter new file name"
            />
            {selectedFile.context !== 'directory' && (
              <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md text-gray-700 dark:text-gray-300 font-mono text-sm">
                {selectedFile.originalExtension}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {selectedFile.context !== 'directory' ? (
              <>File extension "{selectedFile.originalExtension}" will be preserved automatically</>
            ) : (
              <>Folder will be renamed in place</>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={handleRename}
            disabled={!newBaseName.trim() || isRenaming}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRenaming ? 'animate-spin' : ''}`} />
            <span>{isRenaming ? 'Renaming...' : selectedFile.context === 'directory' ? 'Update Folder Name' : 'Update File Name'}</span>
          </button>

          <button
            onClick={onCancel}
            disabled={isRenaming}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          <strong>Note:</strong> This will rename the actual {selectedFile.context === 'directory' ? 'folder' : 'file'} on your file system.
        </div>
      </div>
    </div>
  );
}