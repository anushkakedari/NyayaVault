import hashlib
from pathlib import Path


# Maximum allowed document size: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".docx",
}

# Allowed MIME types
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def validate_file(
    filename: str,
    file_size: int,
    mime_type: str,
) -> None:
    """
    Validate uploaded document before processing.
    """

    # Check filename
    if not filename:
        raise ValueError("Filename is required")

    # Check extension
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            "Unsupported file type. Allowed: PDF, JPG, JPEG, PNG, DOCX"
        )

    # Check MIME type
    if mime_type not in ALLOWED_MIME_TYPES:
        raise ValueError("Unsupported MIME type")

    # Check file size
    if file_size <= 0:
        raise ValueError("File cannot be empty")

    if file_size > MAX_FILE_SIZE:
        raise ValueError("File size cannot exceed 10 MB")


def calculate_sha256(file_data: bytes) -> str:
    """
    Calculate SHA-256 hash of the original file.
    """

    return hashlib.sha256(file_data).hexdigest()