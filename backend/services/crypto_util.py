"""
Symmetric encryption helpers using Fernet.
APP_ENCRYPTION_KEY must be set in the environment (backend/.env).
"""

import os
from dotenv import load_dotenv
from cryptography.fernet import Fernet

load_dotenv()
_key = os.environ.get("APP_ENCRYPTION_KEY")
if not _key:
    raise RuntimeError(
        "APP_ENCRYPTION_KEY is not set. "
        "Generate one with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
    )

_fernet = Fernet(_key.encode())


def encrypt(plaintext: str) -> str:
    return _fernet.encrypt(plaintext.encode()).decode()


def decrypt(token: str) -> str:
    return _fernet.decrypt(token.encode()).decode()
