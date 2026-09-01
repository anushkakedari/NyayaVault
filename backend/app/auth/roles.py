from enum import Enum


class Role(str, Enum):
    ADMIN = "ADMIN"
    INVESTIGATOR = "INVESTIGATOR"
    LEGAL_OFFICER = "LEGAL_OFFICER"
    VIEWER = "VIEWER"