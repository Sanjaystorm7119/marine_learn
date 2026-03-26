import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

# This is your secret key. In a real app, this is hidden, but for now, this is fine!
SECRET_KEY = "my_super_secret_marine_key_123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # Token expires in 1 hour

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 1. Function to check if the typed password matches the scrambled database password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 2. Function to create the digital Keycard (JWT Token)
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # This creates the actual token string
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt