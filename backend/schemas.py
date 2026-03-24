from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class Login(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


# ── User ──────────────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


# ── Admin ─────────────────────────────────────────────────────────────────────

class AdminUserCreate(BaseModel):
    """Payload for admin-created users (role can be specified explicitly)."""
    full_name: str
    email: EmailStr
    password: str
    role: str = "crew"


class RoleUpdate(BaseModel):
    role: str


# ── Course / Study Material schemas ───────────────────────────────────────────

class QuizQuestionResponse(BaseModel):
    id: int
    question: str
    options: list
    correct_answer: str
    explanation: str | None = None
    order_index: int

    class Config:
        from_attributes = True


class LessonResponse(BaseModel):
    id: int
    lesson_key: str
    title: str
    content: str | None = None
    duration: str
    video_url: str | None = None
    topics: list
    order_index: int

    class Config:
        from_attributes = True


class ChapterResponse(BaseModel):
    id: int
    chapter_key: str
    title: str
    order_index: int
    lessons: list[LessonResponse] = []

    class Config:
        from_attributes = True


class StudyMaterialResponse(BaseModel):
    id: int
    material_key: str
    title: str
    description: str | None = None
    icon: str
    total_duration: str | None = None
    department: str | None = None
    target_roles: list
    order_index: int
    chapters: list[ChapterResponse] = []
    quiz_questions: list[QuizQuestionResponse] = []

    class Config:
        from_attributes = True


class StudyMaterialSummary(BaseModel):
    """Lightweight version — no chapters/lessons, for list views."""
    id: int
    material_key: str
    title: str
    description: str | None = None
    icon: str
    total_duration: str | None = None
    department: str | None = None
    target_roles: list
    order_index: int

    class Config:
        from_attributes = True
