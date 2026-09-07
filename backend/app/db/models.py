from datetime import datetime

# from sqlalchemy import (
#     BigInteger,
#     Boolean,
#     DateTime,
#     ForeignKey,
#     Integer,
#     String,
# )

from sqlalchemy import (
     BigInteger,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    case_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="OPEN",
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    creator: Mapped["User"] = relationship(
        "User",
        back_populates="cases",
    )

    documents: Mapped[list["Document"]] = relationship(
        "Document",
        back_populates="case",
    )

    members: Mapped[list["CaseMember"]] = relationship(
        "CaseMember",
        back_populates="case",
        cascade="all, delete-orphan",
    )


class CaseMember(Base):
    __tablename__ = "case_members"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    case_id: Mapped[int] = mapped_column(
        ForeignKey("cases.id"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="VIEWER",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    case: Mapped["Case"] = relationship(
        "Case",
        back_populates="members",
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="case_memberships",
    )



class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="VIEWER",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


    # One user can upload many documents
    documents: Mapped[list["Document"]] = relationship(
        "Document",
        back_populates="uploader",
    )

    # One user can create many cases
    cases: Mapped[list["Case"]] = relationship(
        "Case",
        back_populates="creator",
    )

    case_memberships: Mapped[list["CaseMember"]] = relationship(
        "CaseMember",
        back_populates="user",
        cascade="all, delete-orphan",
    )

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )


        # Case to which this document belongs
    case_id: Mapped[int | None] = mapped_column(
        ForeignKey("cases.id"),
        nullable=True,
        index=True,
    )

    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    stored_filename: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    file_size: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    # SHA-256 hash of the original file
    sha256_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
    )

    # AES-256-GCM nonce
    encryption_nonce: Mapped[str] = mapped_column(
        String(24),
        nullable=False,
    )

    # Path of the encrypted file on local storage
    storage_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    # User who uploaded the document
    uploaded_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationship back to User
    uploader: Mapped["User"] = relationship(
        "User",
        back_populates="documents",
    )

    #relationship back to the case
    case: Mapped["Case | None"] = relationship(
        "Case",
        back_populates="documents",
    )

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    action = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class BlockchainRecord(Base):
    __tablename__ = "blockchain_records"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False,
    )
    document_hash = Column(String, nullable=False)
    previous_hash = Column(String, nullable=False)
    block_hash = Column(
        String,
        unique=True,
        nullable=False,
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )