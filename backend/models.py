from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="crew")


# ── Course / Study Material tables ────────────────────────────────────────────

class StudyMaterial(Base):
    """Top-level course (e.g. 'Maritime Cybersecurity Awareness Training')."""
    __tablename__ = "study_materials"

    id = Column(Integer, primary_key=True, index=True)
    material_key = Column(String, unique=True, index=True)   # URL-safe slug
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String, default="📚")
    total_duration = Column(String, nullable=True)
    department = Column(String, nullable=True)               # deck / engine / safety …
    target_roles = Column(JSONB, default=list)               # ["crew","officers",…]
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    chapters = relationship(
        "Chapter",
        back_populates="material",
        cascade="all, delete-orphan",
        order_by="Chapter.order_index",
    )
    quiz_questions = relationship(
        "QuizQuestion",
        back_populates="material",
        cascade="all, delete-orphan",
        order_by="QuizQuestion.order_index",
    )


class Chapter(Base):
    """A chapter/section inside a StudyMaterial."""
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("study_materials.id"), nullable=False)
    chapter_key = Column(String, nullable=False)             # e.g. "ch1"
    title = Column(String, nullable=False)
    order_index = Column(Integer, default=0)

    material = relationship("StudyMaterial", back_populates="chapters")
    lessons = relationship(
        "Lesson",
        back_populates="chapter",
        cascade="all, delete-orphan",
        order_by="Lesson.order_index",
    )


class Lesson(Base):
    """A lesson/sub-section inside a Chapter."""
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    lesson_key = Column(String, nullable=False)              # e.g. "l1"
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)                    # lesson body text
    duration = Column(String, default="15min")
    video_url = Column(String, nullable=True)
    topics = Column(JSONB, default=list)                     # list of topic strings
    order_index = Column(Integer, default=0)

    chapter = relationship("Chapter", back_populates="lessons")


class QuizQuestion(Base):
    """An MCQ question belonging to a StudyMaterial."""
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("study_materials.id"), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(JSONB, nullable=False)                  # [{"key":"A","text":"…"}, …]
    correct_answer = Column(String, nullable=False)          # "A" / "B" / "C" / "D"
    explanation = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)

    material = relationship("StudyMaterial", back_populates="quiz_questions")