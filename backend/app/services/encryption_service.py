import base64
import secrets

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.core.config import settings


def get_encryption_key() -> bytes:
    """
    Convert the 64-character hexadecimal key from .env
    into the 32-byte key required by AES-256.
    """
    try:
        key = bytes.fromhex(settings.DOCUMENT_ENCRYPTION_KEY)
    except ValueError as exc:
        raise ValueError(
            "DOCUMENT_ENCRYPTION_KEY must be a valid hexadecimal string"
        ) from exc

    if len(key) != 32:
        raise ValueError(
            "DOCUMENT_ENCRYPTION_KEY must represent exactly 32 bytes"
        )

    return key


def encrypt_file(file_data: bytes) -> tuple[bytes, str]:
    """
    Encrypt file data using AES-256-GCM.

    Returns:
        encrypted_data: encrypted file bytes
        nonce: Base64-encoded nonce used for encryption
    """
    key = get_encryption_key()

    # Generate a fresh 12-byte nonce for every encryption.
    nonce = secrets.token_bytes(12)

    aesgcm = AESGCM(key)

    encrypted_data = aesgcm.encrypt(
        nonce,
        file_data,
        None,
    )

    encoded_nonce = base64.b64encode(nonce).decode("utf-8")

    return encrypted_data, encoded_nonce


def decrypt_file(encrypted_data: bytes, encoded_nonce: str) -> bytes:
    """
    Decrypt AES-256-GCM encrypted file data.
    """
    key = get_encryption_key()

    nonce = base64.b64decode(encoded_nonce)

    aesgcm = AESGCM(key)

    decrypted_data = aesgcm.decrypt(
        nonce,
        encrypted_data,
        None,
    )

    return decrypted_data