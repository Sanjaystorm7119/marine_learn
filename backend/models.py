from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="crew")
    role_lead = Column(String, default="Will be assigned by admin") # <-- ADDED THIS


class StudyModule(Base):
    __tablename__ = "study_modules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    order_num = Column(Integer, default=0)

    topics = relationship("StudyTopic", back_populates="module", order_by="StudyTopic.order_num")
    quiz_questions = relationship("StudyQuizQuestion", back_populates="module", order_by="StudyQuizQuestion.order_num")


class StudyTopic(Base):
    __tablename__ = "study_topics"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("study_modules.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text)
    order_num = Column(Integer, default=0)

    module = relationship("StudyModule", back_populates="topics")
    progress_records = relationship("UserTopicProgress", back_populates="topic")


class StudyQuizQuestion(Base):
    __tablename__ = "study_quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("study_modules.id"), nullable=False)
    question = Column(Text, nullable=False)
    options = Column(JSONB)          # list of 4 option strings
    correct_answer = Column(Integer)  # 0-based index
    explanation = Column(Text)
    order_num = Column(Integer, default=0)

    module = relationship("StudyModule", back_populates="quiz_questions")


class UserTopicProgress(Base):
    __tablename__ = "user_topic_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("study_topics.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("StudyTopic", back_populates="progress_records")

    __table_args__ = (UniqueConstraint("user_id", "topic_id", name="uq_user_topic"),)


class UserQuizAttempt(Base):
    __tablename__ = "user_quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("study_modules.id"), nullable=False)
    score = Column(Integer)
    total = Column(Integer)
    attempted_at = Column(DateTime, default=datetime.utcnow)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=False)

class UserCourseAssignment(Base):
    __tablename__ = "user_course_assignments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("study_modules.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "module_id", name="uq_user_module_assign"),)       