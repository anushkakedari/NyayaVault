import hashlib
import json
from datetime import datetime


GENESIS_HASH = "0" * 64


def calculate_block_hash(
    document_id: int,
    document_hash: str,
    previous_hash: str,
    created_at: str,
) -> str:
    block_data = {
        "document_id": document_id,
        "document_hash": document_hash,
        "previous_hash": previous_hash,
        "created_at": created_at,
    }

    encoded_data = json.dumps(
        block_data,
        sort_keys=True,
    ).encode("utf-8")

    return hashlib.sha256(encoded_data).hexdigest()


def create_block(
    document_id: int,
    document_hash: str,
    previous_hash: str,
):
    created_at = datetime.utcnow()

    block_hash = calculate_block_hash(
        document_id=document_id,
        document_hash=document_hash,
        previous_hash=previous_hash,
        created_at=created_at.isoformat(),
    )

    return {
        "document_id": document_id,
        "document_hash": document_hash,
        "previous_hash": previous_hash,
        "block_hash": block_hash,
        "created_at": created_at,
    }


def verify_block(block) -> bool:
    expected_hash = calculate_block_hash(
        document_id=block.document_id,
        document_hash=block.document_hash,
        previous_hash=block.previous_hash,
        created_at=block.created_at.isoformat(),
    )

    return expected_hash == block.block_hash