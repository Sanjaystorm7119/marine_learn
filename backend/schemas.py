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


# ── Study Materials ────────────────────────────────────────────────────────────

class StudyTopicResponse(BaseModel):
    id: int
    module_id: int
    title: str
    content: str
    order_num: int

    class Config:
        from_attributes = True


class StudyQuizQuestionResponse(BaseModel):
    id: int
    module_id: int
    question: str
    options: list
    correct_answer: int
    explanation: str
    order_num: int

    class Config:
        from_attributes = True


class StudyModuleResponse(BaseModel):
    id: int
    title: str
    description: str
    order_num: int
    topics: list[StudyTopicResponse]
    quiz_questions: list[StudyQuizQuestionResponse]

    class Config:
        from_attributes = True


class CourseResponse(BaseModel):
    id: int
    title: str
    description: str
    order_num: int
    modules: list[StudyModuleResponse]

    class Config:
        from_attributes = True


class TopicProgressCreate(BaseModel):
    topic_id: int


class QuizSubmit(BaseModel):
    module_id: int
    score: int
    total: int


class UserProgressResponse(BaseModel):
    completed_topic_ids: list[int]
    quiz_attempts: list[dict]


# --- NEW: ROLE MANAGEMENT SCHEMAS ---
class AdminRoleCreate(BaseModel):
    name: str
    description: str
    lead: str = "Will be assigned by admin"

class AdminRoleUpdate(BaseModel):
    name: str
    description: str
    lead: str

class AdminRoleResponse(BaseModel):
    id: int
    name: str
    description: str
    lead: str
    userCount: int = 0 # We will calculate this in the router!

    class Config:
        from_attributes = True    
