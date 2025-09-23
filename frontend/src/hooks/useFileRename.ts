import { useState } from 'react';
import { renameFile as apiRenameFile } from '../api';
import { electronFileService } from '../services/electronFileService';

export interface SelectedFileInfo {
  file: File;
  originalName: string;
  originalExtension: string;
  suggestedBaseName: string;
  fullSuggestedName: string;
  detectedPath?: string;
  context: 'episode' | 'movie' | 'directory';
  contextData?: any;
}

export function useFileRename() {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileInfo[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);

  const addFile = (
    file: File,
    suggestedBaseName: string,
    context: 'episode' | 'movie' | 'directory',
    contextData?: any,
    detectedPath?: string
  ) => {
    // Extract the file extension from the original file
  const lastDotIndex = file.name.lastIndexOf('.');
  const originalExtension = context === 'directory' ? '' : (lastDotIndex !== -1 ? file.name.substring(lastDotIndex) : '');

    // Create the full suggested name with the original extension
  const fullSuggestedName = suggestedBaseName + originalExtension;

    const newFileInfo: SelectedFileInfo = {
      file,
      originalName: file.name,
      originalExtension,
      suggestedBaseName,
      fullSuggestedName,
      detectedPath,
      context,
      contextData,
    };

    // Check if this file is already in the queue (by original name)
    setSelectedFiles(prev => {
      const existingIndex = prev.findIndex(f => f.originalName === file.name);
      if (existingIndex >= 0) {
        // Replace existing file
        const updated = [...prev];
        updated[existingIndex] = newFileInfo;
        return updated;
      } else {
        // Add new file
        return [...prev, newFileInfo];
      }
    });
  };

  const removeFile = (originalName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.originalName !== originalName));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  const updateFileName = (originalName: string, newBaseName: string) => {
    setSelectedFiles(prev => prev.map(file =>
      file.originalName === originalName
        ? {
            ...file,
            suggestedBaseName: newBaseName,
            fullSuggestedName: newBaseName + file.originalExtension
          }
        : file
    ));
  };

  const renameAllFiles = async (): Promise<{ success: number; failed: number; errors: string[] }> => {
    if (selectedFiles.length === 0) return { success: 0, failed: 0, errors: [] };

    setIsRenaming(true);
    const results = { success: 0, failed: 0, errors: [] as string[] };

    try {
      for (const file of selectedFiles) {
        try {
          // Check if we have a detected path to work with
          if (!file.detectedPath) {
            console.log(`No file path detected for "${file.originalName}" - skipping`);
            results.failed++;
            results.errors.push(`${file.originalName}: No file path detected`);
            continue;
          }

          console.log(`Renaming ${file.context === 'directory' ? 'folder' : 'file'}: ${file.detectedPath} -> ${file.fullSuggestedName}`);

          // Try Electron API first, fall back to HTTP API
          let result;
          if (electronFileService.isAvailable()) {
            console.log('Using Electron file service');
            if (file.context === 'directory') {
              result = await electronFileService.renamePath(file.detectedPath, file.fullSuggestedName);
            } else {
              result = await electronFileService.renameFile(file.detectedPath, file.fullSuggestedName);
            }
          } else {
            console.log('Using HTTP API');
            // HTTP API likely only supports files; attempt anyway
            result = await apiRenameFile(file.detectedPath, file.fullSuggestedName);
          }

          if (result.success) {
            console.log('File renamed successfully:', result.message);
            results.success++;
          } else {
            console.error('File rename failed:', result.message);
            results.failed++;
            results.errors.push(`${file.originalName}: ${result.message}`);
          }
        } catch (error) {
          console.error('Error renaming file:', error);
          results.failed++;
          results.errors.push(`${file.originalName}: ${String(error)}`);
        }
      }

      setIsRenaming(false);
      return results;
    } catch (error) {
      console.error('Error in bulk rename:', error);
      setIsRenaming(false);
      return { success: 0, failed: selectedFiles.length, errors: [String(error)] };
    }
  };

  return {
    selectedFiles,
    isRenaming,
    addFile,
    removeFile,
    clearAllFiles,
    updateFileName,
    renameAllFiles,
  };
}