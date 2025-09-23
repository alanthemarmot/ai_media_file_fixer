from pydantic import BaseModel, Field
from typing import Optional


class RenameFileRequest(BaseModel):
    """Request model for file rename operation"""
    original_path: str = Field(..., description="Full path to the original file")
    new_name: str = Field(..., description="New filename including extension")

    class Config:
        json_schema_extra = {
            "example": {
                "original_path": "/path/to/original/file.mp4",
                "new_name": "S01E01 - Episode Title (1080p).mp4"
            }
        }


class RenameFileResponse(BaseModel):
    """Response model for file rename operation"""
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Human-readable message about the operation")
    new_path: Optional[str] = Field(None, description="Full path to the renamed file (if successful)")
    original_path: Optional[str] = Field(None, description="Original file path")
    error: Optional[str] = Field(None, description="Error code if operation failed")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "File successfully renamed from 'old_name.mp4' to 'new_name.mp4'",
                "new_path": "/path/to/new/file.mp4",
                "original_path": "/path/to/original/file.mp4"
            }
        }


class ValidateFilenameRequest(BaseModel):
    """Request model for filename validation"""
    filename: str = Field(..., description="Filename to validate")

    class Config:
        json_schema_extra = {
            "example": {
                "filename": "S01E01 - Episode Title (1080p).mp4"
            }
        }


class ValidateFilenameResponse(BaseModel):
    """Response model for filename validation"""
    valid: bool = Field(..., description="Whether the filename is valid")
    message: str = Field(..., description="Validation message")

    class Config:
        json_schema_extra = {
            "example": {
                "valid": True,
                "message": "Filename is valid"
            }
        }