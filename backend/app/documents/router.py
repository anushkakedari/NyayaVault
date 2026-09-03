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
from app.db.models import (
    Document,
    User,
    AuditLog,
    BlockchainRecord,
)
from app.services.document_service import (
    calculate_sha256,
    validate_file,
)
from app.services.encryption_service import (
    decrypt_file,
    encrypt_file,
)

from app.services.blockchain_service import (
    create_block,
    verify_block,
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


def create_blockchain_record(db, document_id, document_hash):
    previous_block = (
        db.query(BlockchainRecord)
        .order_by(BlockchainRecord.id.desc())
        .first()
    )

    previous_hash = (
        previous_block.block_hash
        if previous_block
        else "0" * 64
    )

    block = create_block(
        document_id=document_id,
        document_hash=document_hash,
        previous_hash=previous_hash,
    )

    blockchain_record = BlockchainRecord(
        document_id=block["document_id"],
        document_hash=block["document_hash"],
        previous_hash=block["previous_hash"],
        block_hash=block["block_hash"],
        created_at=block["created_at"],
    )

    db.add(blockchain_record)
    db.commit()
    db.refresh(blockchain_record)

    return blockchain_record

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

    create_blockchain_record(
    db=db,
    document_id=document.id,
    document_hash=document.sha256_hash,
    )

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



@router.get("/{document_id}/verify-integrity")
def verify_document_integrity(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    if document.uploaded_by != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this document",
        )

    storage_path = Path(document.storage_path)

    if not storage_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Stored document file not found",
        )

    encrypted_data = storage_path.read_bytes()

    # Step 1: Decrypt the encrypted document
    try:
        decrypted_data = decrypt_file(
            encrypted_data,
            document.encryption_nonce,
        )
    except Exception:
        return {
            "document_id": document.id,
            "database_hash_valid": False,
            "blockchain_hash_valid": False,
            "blockchain_record_exists": False,
            "integrity_status": "TAMPERED",
            "message": "Document decryption failed. The file may have been tampered with.",
        }

    # Step 2: Calculate the current document hash
    current_hash = calculate_sha256(decrypted_data)

    # Step 3: Compare with the original database hash
    database_hash_valid = (
        current_hash == document.sha256_hash
    )

    # Step 4: Fetch the blockchain record
    blockchain_record = (
        db.query(BlockchainRecord)
        .filter(
            BlockchainRecord.document_id == document.id
        )
        .order_by(BlockchainRecord.id.desc())
        .first()
    )

    blockchain_record_exists = (
        blockchain_record is not None
    )

    # Step 5: Verify the blockchain record
    blockchain_hash_valid = (
        blockchain_record_exists
        and verify_block(blockchain_record)
        and blockchain_record.document_hash == current_hash
    )

    # Step 6: Final integrity decision
    integrity_status = (
        "VERIFIED"
        if database_hash_valid and blockchain_hash_valid
        else "TAMPERED"
    )

    return {
        "document_id": document.id,
        "database_hash_valid": database_hash_valid,
        "blockchain_hash_valid": blockchain_hash_valid,
        "blockchain_record_exists": blockchain_record_exists,
        "integrity_status": integrity_status,
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

    # except Exception:
    #     raise HTTPException(
    #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #         detail="Document decryption failed",
    #     )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Document integrity verification failed. The encrypted file may have been tampered with.",
        )

    # Verify document integrity
    current_hash = calculate_sha256(decrypted_data)

    if current_hash != document.sha256_hash:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Document integrity verification failed",
        )

    # Verify document integrity against blockchain record
    blockchain_record = (
        db.query(BlockchainRecord)
        .filter(
            BlockchainRecord.document_id == document.id
        )
        .order_by(BlockchainRecord.id.desc())
        .first()
    )

    if not blockchain_record:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Blockchain record not found",
        )

    if not verify_block(blockchain_record):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Blockchain verification failed",
        )

    if blockchain_record.document_hash != current_hash:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Blockchain document hash mismatch",
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