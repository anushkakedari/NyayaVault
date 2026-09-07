from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CaseCreate(BaseModel):
    case_number: str = Field(
        ...,
        min_length=1,
        max_length=50,
    )

    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    description: str | None = Field(
        default=None,
        max_length=1000,
    )


class CaseResponse(BaseModel):
    id: int
    case_number: str
    title: str
    description: str | None
    status: str
    created_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CaseDocumentResponse(BaseModel):
    id: int
    original_filename: str
    file_size: int
    mime_type: str
    uploaded_by: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CaseDocumentsResponse(BaseModel):
    case_id: int
    documents: list[CaseDocumentResponse]


class CaseMemberCreate(BaseModel):
    user_id: int
    role: str = Field(..., min_length=1, max_length=50)


class CaseMemberResponse(BaseModel):
    id: int
    case_id: int
    user_id: int
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)