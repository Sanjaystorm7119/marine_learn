from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# ⚠️ IMPORTANT: Replace 'YOUR_PASSWORD' with the actual password you just used to log into pgAdmin!
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:Lachu%40123@localhost/marinelearn_db3"

# The engine is responsible for actually talking to the database
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Each instance of the SessionLocal class will be a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# We will use this Base class later to create our database models (like the User table)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()