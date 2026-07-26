import secrets
import string
import uuid

COLOR_ROTATION = ["amber", "teal", "rose", "violet", "sky", "lime"]
INVITE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"


def new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10]}"


def initials_from_name(name: str) -> str:
    parts = name.strip().split()
    if not parts:
        return "?"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[1][0]).upper()


def color_for_index(index: int) -> str:
    return COLOR_ROTATION[index % len(COLOR_ROTATION)]


def generate_invite_token(length: int = 8) -> str:
    return "".join(secrets.choice(INVITE_ALPHABET) for _ in range(length))
