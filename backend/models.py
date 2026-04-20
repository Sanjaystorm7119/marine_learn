from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, UniqueConstraint, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="crew")
    role_lead = Column(String, default="Will be assigned by admin") # <-- ADDED THIS
    phone = Column(String, nullable=True)    # <-- NEW
    vessel = Column(String, nullable=True)  # <-- NEW


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String, default="📘")
    total_duration = Column(String, default="")
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
    duration = Column(String, default="15min")
    video_url = Column(String, nullable=True)
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
    attempted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_title = Column(String, nullable=False)
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    certificate_number = Column(String, unique=True, index=True)

    __table_args__ = (UniqueConstraint("user_id", "course_title", name="uq_user_course_cert"),)


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=False)
    lead = Column(String, default="Will be assigned by admin")

class UserCourseAssignment(Base):
    __tablename__ = "user_course_assignments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("study_modules.id"), nullable=False)
    assigned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    deadline = Column(DateTime, nullable=True) # <-- ADD THIS

    __table_args__ = (UniqueConstraint("user_id", "module_id", name="uq_user_module_assign"),)


class TeamsCredentials(Base):
    """Single-row table — stores encrypted Azure AD credentials."""
    __tablename__ = "teams_credentials"

    id = Column(Integer, primary_key=True, default=1)
    tenant_id_enc = Column(Text, nullable=False)
    client_id_enc = Column(Text, nullable=False)
    client_secret_value_enc = Column(Text, nullable=False)
    secret_id_enc = Column(Text, nullable=False)
    organizer_user_id = Column(String, nullable=False)       # UPN or object-id
    organizer_display_name = Column(String, nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))


class TeamsMeeting(Base):
    __tablename__ = "teams_meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    join_url = Column(Text, nullable=True)
    graph_meeting_id = Column(String, nullable=True)
    organizer_user_id = Column(String, nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String, default="scheduled")             # scheduled | cancelled
    participants = Column(JSONB, default=list)               # list of email strings
    email_status = Column(String, default="pending")         # pending | sent | failed


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    # type: "course_assigned" | "pending_reminder" | "info"
    type = Column(String, default="info", nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    related_course_title = Column(String, nullable=True)

    user = relationship("User", backref="notifications")