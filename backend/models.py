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


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    order_num = Column(Integer, default=0)

    modules = relationship("StudyModule", back_populates="course", order_by="StudyModule.order_num")


class StudyModule(Base):
    __tablename__ = "study_modules"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    order_num = Column(Integer, default=0)

    course = relationship("Course", back_populates="modules")
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
    # completed_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    time_spent_seconds = Column(Integer, default=0, server_default="0", nullable=False)

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

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_title = Column(String, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    certificate_number = Column(String, unique=True, index=True)

    __table_args__ = (UniqueConstraint("user_id", "course_title", name="uq_user_course_cert"),)


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=False)
    lead = Column(String, default="Will be assigned by admin")    