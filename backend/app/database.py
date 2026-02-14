import os
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, create_engine, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Get the database URL from .env
# Supabase provides this in Project Settings -> Database
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback for development if not provided yet
    DATABASE_URL = "sqlite:///./cosint.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, default="New Conversation")
    user_id = Column(String, nullable=True) # UUID as string from Supabase
    bioguide_id = Column(String, nullable=True) # Optional link to a specific member
    created_at = Column(DateTime, default=datetime.utcnow)
    position = Column(Integer, default=0)
    
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"))
    role = Column(String) # 'human' or 'assistant'
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

class TrackedBill(Base):
    __tablename__ = "tracked_bills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False)
    bill_id = Column(String, nullable=False) # e.g., "118-hr-1"
    bill_type = Column(String)
    bill_number = Column(String)
    congress = Column(Integer)
    title = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    position = Column(Integer, default=0)

class ResearchNote(Base):
    __tablename__ = "research_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False)
    bioguide_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables if they don't exist (useful for initial setup)
def init_db():
    Base.metadata.create_all(bind=engine)
