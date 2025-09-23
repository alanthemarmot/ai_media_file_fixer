import { useState } from 'react';
import { ArrowPathIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { SelectedFileInfo } from '../hooks/useFileRename';

interface BulkRenamePanelProps {
  files: SelectedFileInfo[];
  isRenaming: boolean;
  onRenameAll: () => Promise<{ success: number; failed: number; errors: string[] }>;
  onRemoveFile: (originalName: string) => void;
  onClearAll: () => void;
  onUpdateFileName: (originalName: string, newBaseName: string) => void;
}

export default function BulkRenamePanel({
  files,
  isRenaming,
  onRenameAll,
  onRemoveFile,
  onClearAll,
  onUpdateFileName,
}: BulkRenamePanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (files.length === 0) {
    return null;
  }

  const handleRename = async () => {
    const results = await onRenameAll();

    if (results.success > 0 || results.failed > 0) {
      let message = `Bulk rename completed!\n\n`;
      message += `✅ Successfully renamed: ${results.success} files\n`;

      if (results.failed > 0) {
        message += `❌ Failed to rename: ${results.failed} files\n\n`;
        message += `Errors:\n${results.errors.join('\n')}`;
      }

      alert(message);

      // Clear the queue if all were successful
      if (results.failed === 0) {
        onClearAll();
      }
    }
  };

  const hasPathDetected = files.some(f => f.detectedPath);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-2xl border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {isExpanded ? '▼' : '▲'}
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Bulk File Rename Queue ({files.length} files)
            </h3>
            {!hasPathDetected && (
              <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                Demo Mode
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRename}
              disabled={isRenaming || files.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRenaming ? 'animate-spin' : ''}`} />
              <span>{isRenaming ? 'Renaming...' : `Rename All (${files.length})`}</span>
            </button>

            <button
              onClick={onClearAll}
              disabled={isRenaming}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-md transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* File List */}
        {isExpanded && (
          <div className="max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={`${file.originalName}-${index}`}
                className="flex items-center space-x-3 p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                {/* Original File */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {file.originalName}
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-gray-400">→</div>

                {/* New Name Input */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={file.suggestedBaseName}
                      onChange={(e) => onUpdateFileName(file.originalName, e.target.value)}
                      disabled={isRenaming}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                    <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r text-gray-700 dark:text-gray-300 font-mono">
                      {file.originalExtension}
                    </span>
                  </div>
                </div>

                {/* Context Badge */}
                <div className="flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded ${
                    file.context === 'episode'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : file.context === 'movie'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                  }`}>
                    {file.context === 'episode' ? 'TV' : file.context === 'movie' ? 'Movie' : 'Directory'}
                  </span>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => onRemoveFile(file.originalName)}
                  disabled={isRenaming}
                  className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400"
                  title="Remove from queue"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}