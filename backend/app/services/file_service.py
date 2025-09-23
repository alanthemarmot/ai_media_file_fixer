import os
import shutil
from pathlib import Path
from typing import Optional


class FileService:
    """Service for handling file operations"""

    @staticmethod
    def rename_file(original_path: str, new_name: str) -> dict:
        """
        Rename a file while preserving its location

        Args:
            original_path: Full path to the original file
            new_name: New filename (including extension)

        Returns:
            Dictionary with success status, message, and new path if successful
        """
        try:
            # Convert to Path object for easier manipulation
            original_file = Path(original_path)

            # Check if the original file exists
            if not original_file.exists():
                return {
                    "success": False,
                    "message": f"File not found: {original_path}",
                    "error": "FILE_NOT_FOUND"
                }

            # Check if it's actually a file (not a directory)
            if not original_file.is_file():
                return {
                    "success": False,
                    "message": f"Path is not a file: {original_path}",
                    "error": "NOT_A_FILE"
                }

            # Create the new path by combining the parent directory with the new name
            new_file_path = original_file.parent / new_name

            # Check if a file with the new name already exists
            if new_file_path.exists():
                return {
                    "success": False,
                    "message": f"A file with the name '{new_name}' already exists in the same directory",
                    "error": "FILE_EXISTS"
                }

            # Perform the rename
            original_file.rename(new_file_path)

            return {
                "success": True,
                "message": f"File successfully renamed from '{original_file.name}' to '{new_name}'",
                "new_path": str(new_file_path),
                "original_path": original_path
            }

        except PermissionError:
            return {
                "success": False,
                "message": "Permission denied. Unable to rename the file. Check file permissions.",
                "error": "PERMISSION_DENIED"
            }
        except OSError as e:
            return {
                "success": False,
                "message": f"OS error occurred while renaming file: {str(e)}",
                "error": "OS_ERROR"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Unexpected error occurred: {str(e)}",
                "error": "UNKNOWN_ERROR"
            }

    @staticmethod
    def validate_filename(filename: str) -> dict:
        """
        Validate if a filename is valid for the current operating system

        Args:
            filename: The filename to validate

        Returns:
            Dictionary with validation result and message
        """
        # Check for empty filename
        if not filename.strip():
            return {
                "valid": False,
                "message": "Filename cannot be empty"
            }

        # Check for invalid characters (common across OS)
        invalid_chars = ['<', '>', ':', '"', '|', '?', '*']
        # Add Windows-specific invalid chars
        if os.name == 'nt':
            invalid_chars.extend(['/', '\\'])
        else:
            # Unix-like systems (including macOS)
            invalid_chars.append('\0')  # null character

        for char in invalid_chars:
            if char in filename:
                return {
                    "valid": False,
                    "message": f"Filename contains invalid character: '{char}'"
                }

        # Check for reserved names (Windows)
        if os.name == 'nt':
            reserved_names = [
                'CON', 'PRN', 'AUX', 'NUL',
                'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
                'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
            ]
            name_without_ext = filename.split('.')[0].upper()
            if name_without_ext in reserved_names:
                return {
                    "valid": False,
                    "message": f"Filename uses a reserved name: '{name_without_ext}'"
                }

        # Check filename length (255 chars is common limit)
        if len(filename.encode('utf-8')) > 255:
            return {
                "valid": False,
                "message": "Filename is too long (maximum 255 bytes)"
            }

        return {
            "valid": True,
            "message": "Filename is valid"
        }