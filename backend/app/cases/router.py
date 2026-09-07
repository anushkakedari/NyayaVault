# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.exc import IntegrityError
# from sqlalchemy.orm import Session

# from app.auth.dependencies import get_current_user
# from app.db.database import get_db
# from app.db.models import Case, User

# from app.cases.schemas import (
#     CaseCreate,
#     CaseResponse,
#     CaseDocumentsResponse,
# )
# from app.db.models import Document


# router = APIRouter(
#     prefix="/cases",
#     tags=["Cases"],
# )


# @router.post(
#     "/",
#     response_model=CaseResponse,
#     status_code=status.HTTP_201_CREATED,
# )
# def create_case(
#     case_data: CaseCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     existing_case = (
#         db.query(Case)
#         .filter(Case.case_number == case_data.case_number)
#         .first()
#     )

#     if existing_case:
#         raise HTTPException(
#             status_code=status.HTTP_409_CONFLICT,
#             detail="Case number already exists",
#         )

#     case = Case(
#         case_number=case_data.case_number,
#         title=case_data.title,
#         description=case_data.description,
#         created_by=current_user.id,
#     )

#     db.add(case)

#     try:
#         db.commit()
#         db.refresh(case)
#     except IntegrityError:
#         db.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_409_CONFLICT,
#             detail="Case number already exists",
#         )

#     return case


# # @router.get("/{case_id}/documents")
# @router.get(
#     "/{case_id}/documents",
#     response_model=CaseDocumentsResponse,
# )
# def get_case_documents(
#     case_id: int,
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db),
# ):
#     case = (
#         db.query(Case)
#         .filter(Case.id == case_id)
#         .first()
#     )

#     if not case:
#         raise HTTPException(
#             status_code=404,
#             detail="Case not found",
#         )

#     if case.created_by != current_user.id:
#         raise HTTPException(
#             status_code=403,
#             detail="You do not have permission to access this case",
#         )

#     documents = (
#         db.query(Document)
#         .filter(Document.case_id == case_id)
#         .all()
#     )

#     return {
#         "case_id": case_id,
#         "documents": documents,
#     }



from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.roles import Role
from app.db.database import get_db
from app.db.models import Case, CaseMember, Document, User

from app.cases.schemas import (
    CaseCreate,
    CaseResponse,
    CaseMemberCreate,
    CaseMemberResponse,
    CaseDocumentsResponse,
)


router = APIRouter(
    prefix="/cases",
    tags=["Cases"],
)


def get_case_or_404(case_id: int, db: Session) -> Case:
    case = db.query(Case).filter(Case.id == case_id).first()

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Case not found",
        )

    return case


def can_manage_case(case: Case, current_user: User) -> bool:
    return (
        case.created_by == current_user.id
        or current_user.role == Role.ADMIN.value
    )


@router.post(
    "/",
    response_model=CaseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_case(
    case_data: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_case = (
        db.query(Case)
        .filter(Case.case_number == case_data.case_number)
        .first()
    )

    if existing_case:
        raise HTTPException(
            status_code=409,
            detail="Case number already exists",
        )

    case = Case(
        case_number=case_data.case_number,
        title=case_data.title,
        description=case_data.description,
        created_by=current_user.id,
    )

    db.add(case)

    try:
        db.commit()
        db.refresh(case)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Case number already exists",
        )

    return case


@router.post(
    "/{case_id}/members",
    response_model=CaseMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_case_member(
    case_id: int,
    member_data: CaseMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = get_case_or_404(case_id, db)

    if not can_manage_case(case, current_user):
        raise HTTPException(
            status_code=403,
            detail="Only the case owner or admin can manage members",
        )

    user = (
        db.query(User)
        .filter(User.id == member_data.user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    existing_member = (
        db.query(CaseMember)
        .filter(
            CaseMember.case_id == case_id,
            CaseMember.user_id == member_data.user_id,
        )
        .first()
    )

    if existing_member:
        raise HTTPException(
            status_code=409,
            detail="User is already a member of this case",
        )

    member = CaseMember(
        case_id=case_id,
        user_id=member_data.user_id,
        role=member_data.role,
    )

    db.add(member)

    try:
        db.commit()
        db.refresh(member)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="User is already a member of this case",
        )

    return member


@router.get(
    "/{case_id}/members",
    response_model=list[CaseMemberResponse],
)
def get_case_members(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    case = get_case_or_404(case_id, db)

    if not can_manage_case(case, current_user):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view case members",
        )

    return (
        db.query(CaseMember)
        .filter(CaseMember.case_id == case_id)
        .all()
    )


@router.get(
    "/{case_id}/documents",
    response_model=CaseDocumentsResponse,
)
def get_case_documents(
    case_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    case = get_case_or_404(case_id, db)

    if not can_manage_case(case, current_user):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this case",
        )

    documents = (
        db.query(Document)
        .filter(Document.case_id == case_id)
        .all()
    )

    return {
        "case_id": case_id,
        "documents": documents,
    }