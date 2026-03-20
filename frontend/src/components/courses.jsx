import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Anchor, BookOpen, LayoutDashboard, Award, Clock, Calendar,
  FileText, BarChart3, Settings, HelpCircle, Menu, User, LogOut,
  Search, Bell, ChevronRight, Play, CheckCircle2, Lock, ArrowLeft,
  Timer, ListChecks, Download, RotateCcw, X,
  CircleDot, Trophy
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { coursesByDepartment, getDepartmentTitle } from "./courseData";
import "../pages/courses.css";

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Courses", icon: BookOpen, href: "/course/cybersecurity", active: true },
  { label: "Calendar", icon: Calendar, href: "/dashboard" },
  { label: "Certificates", icon: Award, href: "/certificates" },
  { label: "Reports", icon: BarChart3, href: "/dashboard" },
  { label: "Resources", icon: FileText, href: "/dashboard" },
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Help", icon: HelpCircle, href: "/dashboard" },
];

// ─── Reusable primitives ───────────────────────────────────────────────────────

function Button({ children, onClick, disabled, size = "md", variant = "primary", className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn--${variant} btn--${size} ${className}`}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "", onClick }) {
  return (
    <div className={`card ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

function CardContent({ children, className = "" }) {
  return <div className={`card-content ${className}`}>{children}</div>;
}

function CardHeader({ children, className = "" }) {
  return <div className={`card-header ${className}`}>{children}</div>;
}

function CardTitle({ children, className = "" }) {
  return <h3 className={`card-title ${className}`}>{children}</h3>;
}

function Progress({ value, className = "" }) {
  return (
    <div className={`progress-track ${className}`}>
      <div className="progress-fill" style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const CoursePage = () => {
  const { departmentId, courseId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const userName = localStorage.getItem("full_name") || "User";
  const userRole = localStorage.getItem("role") || "Crew";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    navigate("/login");
  };

  // Course state
  const [stage, setStage] = useState("overview");
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [lessonProgress, setLessonProgress] = useState({});
  const [lessonsCompleted, setLessonsCompleted] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const courses = departmentId ? coursesByDepartment[departmentId] : undefined;
  const course = courses?.find(c => c.id === courseId);

  // Simulate lesson playback
  useEffect(() => {
    if (!isPlaying || !course) return;
    const lesson = course.lessons[currentLessonIndex];
    const id = lesson.id;
    const interval = setInterval(() => {
      setLessonProgress(prev => {
        const current = prev[id] || 0;
        if (current >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          return prev;
        }
        const next = Math.min(current + 2, 100);
        if (next >= 90 && !lessonsCompleted.has(id)) {
          setLessonsCompleted(prev => new Set(prev).add(id));
        }
        return { ...prev, [id]: next };
      });
    }, 300);
    return () => clearInterval(interval);
  }, [isPlaying, currentLessonIndex, course, lessonsCompleted]);

  const allLessonsComplete = course ? course.lessons.every(l => lessonsCompleted.has(l.id)) : false;

  const startQuiz = useCallback(() => {
    if (!course) return;
    const shuffled = [...course.quizPool].sort(() => Math.random() - 0.5);
    setQuizQuestions(shuffled.slice(0, 10));
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setScore(0);
    setStage("quiz");
  }, [course]);

  const submitQuiz = () => {
    let correct = 0;
    quizQuestions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctIndex) correct++;
    });
    setScore(correct);
    setQuizSubmitted(true);
    setStage("result");
  };

  const passed = score >= 7;

  if (!course) {
    return (
      <div className="not-found-wrapper">
        <Card className="not-found-card">
          <h2 className="not-found-title">Course Not Found</h2>
          <p className="not-found-text">The requested course could not be found.</p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="sidebar-inner">
      <div className="sidebar-logo">
        <Link to="/" className="sidebar-logo-link">
          <Anchor className="sidebar-logo-icon" />
          {sidebarOpen && (
            <div className="sidebar-logo-text">
              <span className="sidebar-brand">MarineLearn</span>
              <span className="sidebar-sub">Course</span>
            </div>
          )}
        </Link>
      </div>
      <nav className="sidebar-nav">
        {sidebarItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={`sidebar-nav-item ${item.active ? "sidebar-nav-item--active" : ""}`}
          >
            <item.icon className="sidebar-nav-icon" />
            {sidebarOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <User className="sidebar-avatar-icon" />
          </div>
          {sidebarOpen && (
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{userName}</p>
              <p className="sidebar-user-role">{userRole}</p>
            </div>
          )}
          {sidebarOpen && (
            <button className="sidebar-logout" onClick={handleLogout}>
              <LogOut className="sidebar-logout-icon" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      {/* Desktop Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : "sidebar--collapsed"}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="mobile-overlay">
          <div className="mobile-overlay-backdrop" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="mobile-sidebar"><SidebarContent /></aside>
        </div>
      )}

      <main className="main-content">
        {/* Header */}
        <header className="top-header">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) setMobileSidebarOpen(true);
              else setSidebarOpen(!sidebarOpen);
            }}
            className="header-menu-btn"
          >
            <Menu className="header-icon" />
          </button>
          <div className="header-search-wrap">
            <div className="header-search">
              <Search className="header-search-icon" />
              <input type="text" placeholder="Search..." className="header-search-input" />
            </div>
          </div>
          <button className="header-bell-btn">
            <Bell className="header-icon" />
            <span className="header-bell-dot" />
          </button>
        </header>

        <div className="content-area">
          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="breadcrumb">
            <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
            <ChevronRight className="breadcrumb-chevron" />
            <span className="breadcrumb-current">{getDepartmentTitle(departmentId || "")}</span>
            <ChevronRight className="breadcrumb-chevron" />
            <span className="breadcrumb-active">{course.title}</span>
          </motion.div>

          <AnimatePresence mode="wait">

            {/* ═══ OVERVIEW ═══ */}
            {stage === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="section-gap">

                {/* Course Header */}
                <Card className="overflow-hidden">
                  <div className="course-hero nav-gradient">
                    <div className="course-hero-inner">
                      <div className="course-icon">{course.icon}</div>
                      <div className="course-hero-body">
                        <h1 className="course-hero-title">{course.title}</h1>
                        <p className="course-hero-desc">{course.description}</p>
                        <div className="course-meta">
                          <span className="course-meta-item"><Clock className="meta-icon" /> {course.totalDuration}</span>
                          <span className="course-meta-item"><BookOpen className="meta-icon" /> {course.lessons.length} Lessons</span>
                          <span className="course-meta-item"><ListChecks className="meta-icon" /> Quiz: 10 Questions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Course Flow */}
                <Card>
                  <CardHeader>
                    <CardTitle className="card-title-flex">
                      <ListChecks className="card-title-icon" /> Course Flow
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flow-list">
                      {/* Step 1: Enroll */}
                      <div className="flow-step flow-step--done">
                        <div className="flow-step-num flow-step-num--done">1</div>
                        <div>
                          <p className="flow-step-title">Enroll → {course.title}</p>
                          <p className="flow-step-sub">Start your learning journey</p>
                        </div>
                        <CheckCircle2 className="flow-step-check flow-step-check--done" />
                      </div>

                      {/* Steps for each lesson */}
                      {course.lessons.map((lesson, i) => {
                        const completed = lessonsCompleted.has(lesson.id);
                        const progress = lessonProgress[lesson.id] || 0;
                        return (
                          <div key={lesson.id} className={`flow-step ${completed ? "flow-step--done" : "flow-step--pending"}`}>
                            <div className={`flow-step-num ${completed ? "flow-step-num--done" : "flow-step-num--pending"}`}>{i + 2}</div>
                            <div className="flow-step-body">
                              <p className="flow-step-title">{lesson.title} ({lesson.duration})</p>
                              <p className="flow-step-sub">No skip → 90% watched {completed ? "✅" : ""}</p>
                              {progress > 0 && <Progress value={progress} className="flow-progress" />}
                            </div>
                            {completed
                              ? <CheckCircle2 className="flow-step-check flow-step-check--done" />
                              : <CircleDot className="flow-step-check flow-step-check--pending" />}
                          </div>
                        );
                      })}

                      {/* Quiz step */}
                      <div className={`flow-step ${allLessonsComplete ? "flow-step--quiz-unlocked" : "flow-step--locked"}`}>
                        <div className={`flow-step-num ${allLessonsComplete ? "flow-step-num--primary" : "flow-step-num--pending"}`}>
                          {course.lessons.length + 2}
                        </div>
                        <div>
                          <p className="flow-step-title">🎉 Quiz Unlocked! (10 random questions)</p>
                          <p className="flow-step-sub">Score 7/10 (70%) → Certificate Generated</p>
                        </div>
                        {!allLessonsComplete && <Lock className="flow-step-check flow-step-check--pending" />}
                      </div>

                      {/* Certificate step */}
                      <div className="flow-step flow-step--locked">
                        <div className="flow-step-num flow-step-num--pending">{course.lessons.length + 3}</div>
                        <div>
                          <p className="flow-step-title">📜 Download Certificate</p>
                          <p className="flow-step-sub">Dashboard shows new cert</p>
                        </div>
                        <Award className="flow-step-check flow-step-check--pending" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lesson Cards */}
                <div>
                  <h2 className="section-heading">Lessons</h2>
                  <div className="lesson-list">
                    {course.lessons.map((lesson, i) => {
                      const completed = lessonsCompleted.has(lesson.id);
                      const progress = lessonProgress[lesson.id] || 0;
                      const canStart = i === 0 || lessonsCompleted.has(course.lessons[i - 1].id);
                      return (
                        <motion.div key={lesson.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                          <Card
                            className={`lesson-card ${canStart ? "lesson-card--active" : "lesson-card--locked"} ${completed ? "lesson-card--done" : ""}`}
                            onClick={() => { if (canStart && !completed) { setCurrentLessonIndex(i); setStage("lesson"); } }}
                          >
                            <CardContent className="lesson-card-body">
                              <div className="lesson-card-inner">
                                <div className={`lesson-icon-box ${completed ? "lesson-icon-box--done" : canStart ? "lesson-icon-box--active" : "lesson-icon-box--locked"}`}>
                                  {completed
                                    ? <CheckCircle2 className="lesson-icon lesson-icon--done" />
                                    : canStart
                                      ? <Play className="lesson-icon lesson-icon--active" />
                                      : <Lock className="lesson-icon lesson-icon--locked" />}
                                </div>
                                <div className="lesson-body">
                                  <div className="lesson-meta-row">
                                    <span className="lesson-label">LESSON {i + 1}</span>
                                    <span className="lesson-duration"><Timer className="lesson-duration-icon" />{lesson.duration}</span>
                                  </div>
                                  <h3 className="lesson-title">{lesson.title}</h3>
                                  <ul className="lesson-topics">
                                    {lesson.topics.map((t, j) => (
                                      <li key={j} className="lesson-topic">
                                        <span className="lesson-bullet">•</span> {t}
                                      </li>
                                    ))}
                                  </ul>
                                  {progress > 0 && !completed && <Progress value={progress} className="lesson-progress" />}
                                </div>
                                {canStart && !completed && (
                                  <Button size="sm" className="lesson-start-btn">Start Lesson</Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Quiz Button */}
                <Card className={`quiz-unlock-card ${allLessonsComplete ? "quiz-unlock-card--ready" : "quiz-unlock-card--locked"}`}>
                  <CardContent className="quiz-unlock-body">
                    <div className="quiz-unlock-emoji">{allLessonsComplete ? "🎉" : "🔒"}</div>
                    <h3 className="quiz-unlock-title">
                      {allLessonsComplete ? "Quiz Unlocked!" : "Complete All Lessons to Unlock Quiz"}
                    </h3>
                    <p className="quiz-unlock-sub">10 random questions • 70% to pass • Certificate on success</p>
                    <Button size="lg" disabled={!allLessonsComplete} onClick={startQuiz} className="quiz-unlock-btn">
                      {allLessonsComplete ? "Start Quiz" : "Locked"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ═══ LESSON VIEW ═══ */}
            {stage === "lesson" && (
              <motion.div key="lesson" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="section-gap">
                <Button variant="ghost" onClick={() => { setIsPlaying(false); setStage("overview"); }} className="back-btn">
                  <ArrowLeft className="back-icon" /> Back to Overview
                </Button>

                {(() => {
                  const lesson = course.lessons[currentLessonIndex];
                  const progress = lessonProgress[lesson.id] || 0;
                  const completed = lessonsCompleted.has(lesson.id);
                  return (
                    <>
                      {/* Video Player Simulation */}
                      <Card className="overflow-hidden">
                        <div className="video-player nav-gradient">
                          <div className="video-overlay" />
                          <div className="video-center">
                            <div className="video-icon">{course.icon}</div>
                            <h2 className="video-title">{lesson.title}</h2>
                            <p className="video-sub">Lesson {currentLessonIndex + 1} • {lesson.duration}</p>
                            {!isPlaying && !completed && (
                              <Button size="lg" onClick={() => setIsPlaying(true)} className="video-play-btn">
                                <Play className="video-play-icon" /> {progress > 0 ? "Continue" : "Play Lesson"}
                              </Button>
                            )}
                            {isPlaying && (
                              <div className="video-playing-row">
                                <div className="video-live-dot" />
                                <span className="video-playing-text">Playing...</span>
                                <Button size="sm" variant="ghost" onClick={() => setIsPlaying(false)} className="video-pause-btn">
                                  Pause
                                </Button>
                              </div>
                            )}
                            {completed && (
                              <div className="video-complete-row">
                                <CheckCircle2 className="video-complete-icon" />
                                <span className="video-complete-text">Lesson Complete!</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <CardContent className="video-footer">
                          <div className="video-progress-row">
                            <span className="video-progress-label">Progress</span>
                            <span className="video-progress-pct">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="video-progress-bar" />
                          <p className="video-progress-note">Must watch at least 90% to complete. No skipping allowed.</p>
                        </CardContent>
                      </Card>

                      {/* Lesson Topics */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Topics Covered</CardTitle>
                        </CardHeader>
                        <CardContent className="topics-list">
                          {lesson.topics.map((t, i) => (
                            <div key={i} className="topic-item">
                              <span className="topic-bullet">•</span>
                              <span>{t}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Navigation */}
                      {completed && (
                        <div className="lesson-nav-row">
                          {currentLessonIndex < course.lessons.length - 1 ? (
                            <Button onClick={() => setCurrentLessonIndex(currentLessonIndex + 1)} className="rounded-full gap-2">
                              Next Lesson <ChevronRight className="btn-icon-right" />
                            </Button>
                          ) : (
                            <Button onClick={() => setStage("overview")} className="rounded-full gap-2">
                              Back to Overview <ChevronRight className="btn-icon-right" />
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </motion.div>
            )}

            {/* ═══ QUIZ ═══ */}
            {stage === "quiz" && (
              <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="quiz-wrapper">
                <div className="quiz-top-row">
                  <h2 className="quiz-heading">
                    <ListChecks className="quiz-heading-icon" /> Quiz: {course.title}
                  </h2>
                  <span className="quiz-answered-count">{Object.keys(selectedAnswers).length}/10 answered</span>
                </div>

                <Progress value={(Object.keys(selectedAnswers).length / 10) * 100} className="quiz-progress-bar" />

                <AnimatePresence mode="wait">
                  <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                    <Card className="quiz-question-card">
                      <CardContent className="quiz-question-body">
                        <div className="quiz-q-header">
                          <span className="quiz-q-num">{currentQuestionIndex + 1}</span>
                          <span className="quiz-q-label">Question {currentQuestionIndex + 1} of 10</span>
                        </div>
                        <h3 className="quiz-q-text">{quizQuestions[currentQuestionIndex]?.question}</h3>
                        <div className="quiz-options">
                          {quizQuestions[currentQuestionIndex]?.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: i }))}
                              className={`quiz-option ${selectedAnswers[currentQuestionIndex] === i ? "quiz-option--selected" : ""}`}
                            >
                              <span className="quiz-option-letter">{String.fromCharCode(65 + i)}.</span>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>

                {/* Question Navigation */}
                <div className="quiz-nav">
                  <Button variant="outline" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(prev => prev - 1)} className="quiz-nav-prev">
                    <ArrowLeft className="quiz-nav-icon" /> Previous
                  </Button>

                  <div className="quiz-dots">
                    {quizQuestions.map((_, i) => (
                      <button key={i} onClick={() => setCurrentQuestionIndex(i)}
                        className={`quiz-dot ${i === currentQuestionIndex ? "quiz-dot--current" : selectedAnswers[i] !== undefined ? "quiz-dot--answered" : "quiz-dot--empty"}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  {currentQuestionIndex < 9 ? (
                    <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)} className="quiz-nav-next">
                      Next <ChevronRight className="quiz-nav-icon-r" />
                    </Button>
                  ) : (
                    <Button onClick={submitQuiz} disabled={Object.keys(selectedAnswers).length < 10} className="quiz-submit-btn">
                      Submit Quiz
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══ RESULT ═══ */}
            {stage === "result" && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="result-wrapper">
                <Card className={`result-card ${passed ? "result-card--pass" : "result-card--fail"}`}>
                  <div className={`result-hero ${passed ? "result-hero--pass" : "result-hero--fail"}`}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                      <div className="result-emoji">{passed ? "🎉" : "😔"}</div>
                    </motion.div>
                    <h2 className="result-title">{passed ? "Congratulations!" : "Not Quite There"}</h2>
                    <p className="result-sub">
                      {passed
                        ? "You've passed the quiz and earned your certificate!"
                        : "You need at least 70% to pass. Try again with a different question set."}
                    </p>
                  </div>
                  <CardContent className="result-body">
                    <div className="result-stats">
                      <div className="result-stat">
                        <p className="result-stat-val">{score}/10</p>
                        <p className="result-stat-label">Correct Answers</p>
                      </div>
                      <div className="result-divider" />
                      <div className="result-stat">
                        <p className={`result-stat-val ${passed ? "result-stat-val--pass" : "result-stat-val--fail"}`}>{score * 10}%</p>
                        <p className="result-stat-label">Score</p>
                      </div>
                      <div className="result-divider" />
                      <div className="result-stat">
                        <p className="result-stat-val">70%</p>
                        <p className="result-stat-label">Pass Mark</p>
                      </div>
                    </div>

                    {passed ? (
                      <div className="cert-section">
                        <Card className="cert-preview-card">
                          <CardContent className="cert-preview-body">
                            <Trophy className="cert-trophy-icon" />
                            <h3 className="cert-title">Certificate of Completion</h3>
                            <p className="cert-course">{course.title}</p>
                            <p className="cert-awarded">Awarded to <span className="cert-name">{localStorage.getItem("full_name") || "User"}</span></p>
                            <p className="cert-date">Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p className="cert-id">Certificate #{`MAR-${String(Math.floor(Math.random() * 90000 + 10000))}`}</p>
                          </CardContent>
                        </Card>
                        <div className="cert-actions">
                          <Button className="cert-btn-download">
                            <Download className="cert-btn-icon" /> Download PDF
                          </Button>
                          <Button variant="outline" className="cert-btn-view" onClick={() => navigate("/certificates")}>
                            <Award className="cert-btn-icon" /> View in Dashboard
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="result-actions">
                        <Button onClick={startQuiz} className="result-btn-retry">
                          <RotateCcw className="result-btn-icon" /> Retake Quiz (New Questions)
                        </Button>
                        <Button variant="outline" onClick={() => setStage("overview")} className="result-btn-review">
                          Review Lessons
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Answer Review */}
                <Card>
                  <CardHeader>
                    <CardTitle>Answer Review</CardTitle>
                  </CardHeader>
                  <CardContent className="review-list">
                    {quizQuestions.map((q, i) => {
                      const correct = selectedAnswers[i] === q.correctIndex;
                      return (
                        <div key={q.id} className={`review-item ${correct ? "review-item--correct" : "review-item--wrong"}`}>
                          <div className="review-item-inner">
                            {correct
                              ? <CheckCircle2 className="review-icon review-icon--correct" />
                              : <X className="review-icon review-icon--wrong" />}
                            <div>
                              <p className="review-question">{q.question}</p>
                              <p className="review-answer">
                                Your answer:{" "}
                                <span className={correct ? "review-answer--correct" : "review-answer--wrong"}>
                                  {q.options[selectedAnswers[i]]}
                                </span>
                                {!correct && (
                                  <> • Correct: <span className="review-answer--correct">{q.options[q.correctIndex]}</span></>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default CoursePage;