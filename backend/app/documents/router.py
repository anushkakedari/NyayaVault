from pathlib import Path
import secrets

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import Document, User, AuditLog
from app.services.document_service import (
    calculate_sha256,
    validate_file,
)
from app.services.encryption_service import (
    decrypt_file,
    encrypt_file,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


STORAGE_DIR = Path("storage/documents")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

def create_audit_log(db, user_id, document_id, action):
    audit_log = AuditLog(
        user_id=user_id,
        document_id=document_id,
        action=action,
    )
    db.add(audit_log)
    db.commit()


@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Read uploaded file
    file_data = await file.read()

    file_size = len(file_data)

    # Validate file
    try:
        validate_file(
            filename=file.filename or "",
            file_size=file_size,
            mime_type=file.content_type or "",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    # Calculate SHA-256 hash of original file
    sha256_hash = calculate_sha256(file_data)

    # Encrypt original file using AES-256-GCM
    encrypted_data, encryption_nonce = encrypt_file(file_data)

    # Generate random filename for encrypted storage
    stored_filename = f"{secrets.token_hex(16)}.enc"

    storage_path = STORAGE_DIR / stored_filename

    # Store encrypted file
    storage_path.write_bytes(encrypted_data)

    # Save document metadata in PostgreSQL
    document = Document(
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_size=file_size,
        mime_type=file.content_type or "",
        sha256_hash=sha256_hash,
        encryption_nonce=encryption_nonce,
        storage_path=str(storage_path),
        uploaded_by=current_user.id,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    create_audit_log(
    db,
    current_user.id,
    document.id,
    "UPLOAD",
    )

    return {
        "message": "Document uploaded successfully",
        "document": {
            "id": document.id,
            "original_filename": document.original_filename,
            "file_size": document.file_size,
            "mime_type": document.mime_type,
            "sha256_hash": document.sha256_hash,
            "uploaded_by": document.uploaded_by,
            "created_at": document.created_at,
        },
    }


@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Find document
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    # Check document ownership
    if document.uploaded_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this document",
        )

    # Read encrypted file
    storage_path = Path(document.storage_path)

    if not storage_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stored document file not found",
        )

    encrypted_data = storage_path.read_bytes()

    # Decrypt file
    try:
        decrypted_data = decrypt_file(
            encrypted_data,
            document.encryption_nonce,
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document decryption failed",
        )

    # Verify document integrity
    current_hash = calculate_sha256(decrypted_data)

    if current_hash != document.sha256_hash:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Document integrity verification failed",
        )

    
    create_audit_log(
    db,
    current_user.id,
    document.id,
    "DOWNLOAD",
    ) 

    # Return original document
    return Response(
        content=decrypted_data,
        media_type=document.mime_type,
        headers={
            "Content-Disposition": (
                f'attachment; filename="{document.original_filename}"'
            )
        },
    )