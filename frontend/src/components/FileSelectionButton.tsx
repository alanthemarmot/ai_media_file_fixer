import { useRef, useState } from 'react';
import { DocumentIcon } from '@heroicons/react/24/outline';
import { electronFileService } from '../services/electronFileService';

interface FileSelectionButtonProps {
  onFileSelected: (file: File, filePath?: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function FileSelectionButton({
  onFileSelected,
  disabled = false,
  className = "flex items-center space-x-1 text-sm bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-1 rounded transition-colors"
}: FileSelectionButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = async () => {
    if (disabled) return;

    // Use Electron file dialog if available
    if (electronFileService.isAvailable()) {
      try {
        const filePath = await electronFileService.showOpenDialog();
        if (filePath) {
          // Create a mock File object with the selected path
          // In Electron, we'll work with the file path directly
          const fileName = filePath.split('/').pop() || 'unknown';
          const mockFile = new File([''], fileName);
          // Add the real path as a property for our use
          (mockFile as any).realPath = filePath;
          onFileSelected(mockFile, filePath);
        }
      } catch (error) {
        console.error('Error opening file dialog:', error);
        // Fall back to browser file input
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }
    } else {
      // Use browser file input
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const processFile = (file: File) => {
    // Try to get the file path if available (some browsers support this)
    let filePath: string | undefined;

    // Check if the file has a webkitRelativePath or other path information
    if ('webkitRelativePath' in file && file.webkitRelativePath) {
      filePath = file.webkitRelativePath;
    } else if ('path' in file && (file as any).path) {
      filePath = (file as any).path;
    }

    onFileSelected(file, filePath);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div
      className={`relative ${isDragOver ? 'opacity-75' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <button
        onClick={handleClick}
        disabled={disabled}
        className={className}
        title="Click to select file or drag & drop file here"
      >
        <DocumentIcon className="w-4 h-4" />
        <span>Select File</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="*/*"
      />
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 border-dashed rounded flex items-center justify-center">
          <span className="text-blue-700 dark:text-blue-300 text-xs font-medium">Drop file here</span>
        </div>
      )}
    </div>
  );
}