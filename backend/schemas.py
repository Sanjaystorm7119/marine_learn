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
    role_lead: str = "Will be assigned by admin"

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

class UserLeadUpdate(BaseModel):
    lead: str


class CourseAssignmentCreate(BaseModel):
    user_ids: list[int]
    module_ids: list[int]
    deadline: str | None = None  

class ModuleProgressDetail(BaseModel):
    moduleId: int
    moduleTitle: str
    completedLessons: int
    totalLessons: int
    totalQuizQuestions: int = 0
    progress: int
    status: str
    quizScore: int | None

class UserCourseDetail(BaseModel):
    courseId: int
    courseTitle: str
    completedModules: int
    totalModules: int
    completedLessons: int
    totalLessons: int
    progress: int
    status: str
    quizScore: int | None
    deadline: str | None = None
    modules: list[ModuleProgressDetail]

class UserCourseManagementResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    rank: str | None
    overallProgress: int
    streak: int
    courses: list[UserCourseDetail]    
# ── Study Materials ────────────────────────────────────────────────────────────

class StudyTopicResponse(BaseModel):
    id: int
    module_id: int
    title: str
    content: str | None = None
    order_num: int

    class Config:
        from_attributes = True


class StudyQuizQuestionResponse(BaseModel):
    id: int
    module_id: int
    question: str
    options: list
    correct_answer: int
    explanation: str | None = None
    order_num: int

    class Config:
        from_attributes = True


class StudyModuleResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    order_num: int
    topics: list[StudyTopicResponse]
    quiz_questions: list[StudyQuizQuestionResponse]

    class Config:
        from_attributes = True


class CourseResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    order_num: int
    modules: list[StudyModuleResponse]

    class Config:
        from_attributes = True


class TopicProgressCreate(BaseModel):
    topic_id: int
    time_spent_seconds: int = 0


class QuizSubmit(BaseModel):
    module_id: int
    score: int
    total: int


class UserProgressResponse(BaseModel):
    completed_topic_ids: list[int]
    quiz_attempts: list[dict]


# ── Certificates ──────────────────────────────────────────────────────────────

class CertificateIssueRequest(BaseModel):
    course_title: str


class CertificateResponse(BaseModel):
    id: int
    user_full_name: str
    course_title: str
    issued_at: str
    certificate_number: str

    class Config:
        from_attributes = True


# ── Notifications ─────────────────────────────────────────────────────────────

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: str
    related_course_title: str | None = None

    class Config:
        from_attributes = True


class SendNotificationRequest(BaseModel):
    user_ids: list[int]
    title: str
    message: str
    type: str = "info"
    related_course_title: str | None = None


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
