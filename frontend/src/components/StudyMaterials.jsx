import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Award, BarChart3,
  FileText, Settings, HelpCircle, Calendar,
  Search, Bell, Menu, Lock, Play, CheckCircle,
  ArrowLeft, ChevronRight, Trophy, AlertCircle,
  Anchor, Send, RotateCcw, CheckSquare, Clock,
  ChevronLeft, GraduationCap,
} from "lucide-react";
import Sidenav from "./sidenav";
import CertificateTemplate from "./CertificateTemplate";
import { downloadCertificatePDF } from "../lib/downloadCertificate";
import "../pages/studymaterials.css";
import "../pages/dashboard.css";

const API = "http://localhost:8000";
const LETTERS = ["A", "B", "C", "D"];

// ── Sidebar items ────────────────────────────────────────────────────────────
const sidebarItems = [
  { label: "Dashboard",       icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Courses",      icon: BookOpen,        href: "/mycourses" },
  { label: "Study Materials", icon: FileText,        href: "/study-materials", active: true },
  { label: "Calendar",        icon: Calendar,        href: "/calendar" },
  { label: "Certificates",    icon: Award,           href: "/certificates" },
  { label: "Reports",         icon: BarChart3,       href: "/dashboard" },
  { label: "Settings",        icon: Settings,        href: "/settings" },
  { label: "Help",            icon: HelpCircle,      href: "/help" },
];

// ── Module gradient + tag classes (by 1-based index) ─────────────────────────
const MODULE_THEMES = [
  { grad: "sm-grad--1", tag: "sm-tag--1" },
  { grad: "sm-grad--2", tag: "sm-tag--2" },
  { grad: "sm-grad--3", tag: "sm-tag--3" },
  { grad: "sm-grad--4", tag: "sm-tag--4" },
  { grad: "sm-grad--5", tag: "sm-tag--5" },
];

const COURSE_GRADS = ["sm-cgrad--1", "sm-cgrad--2", "sm-cgrad--3", "sm-cgrad--4", "sm-cgrad--5"];

const getTheme = (idx) => MODULE_THEMES[idx % MODULE_THEMES.length];
const getCourseGrad = (idx) => COURSE_GRADS[idx % COURSE_GRADS.length];

const getReadingMin = (content) => Math.max(3, Math.ceil((content || "").split(/\s+/).length / 200));

// ── Prev / Next Navigation Bar ────────────────────────────────────────────────
const NavBar = ({ prevItem, nextItem, onNavigate }) => (
  <div className="sm-nav-bar">
    <button
      className="sm-nav-btn"
      disabled={!prevItem}
      onClick={() => prevItem && onNavigate(prevItem)}
    >
      <ChevronLeft size={16} />
      <span className="sm-nav-btn-text">
        {prevItem ? prevItem.label : "Previous"}
      </span>
    </button>
    <button
      className="sm-nav-btn"
      disabled={!nextItem}
      onClick={() => nextItem && onNavigate(nextItem)}
    >
      <span className="sm-nav-btn-text">
        {nextItem ? nextItem.label : "Next"}
      </span>
      <ChevronRight size={16} />
    </button>
  </div>
);

// ── Quiz Panel ───────────────────────────────────────────────────────────────
const QuizPanel = ({ module, onQuizSubmit, bestScore, onBack, prevItem, nextItem, onNavigate, certData, certLoading, certRef, onDownloadCert }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const questions = module.quiz_questions;

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct_answer) correct++; });
    setScore(correct);
    setSubmitted(true);
    await onQuizSubmit(module.id, correct, questions.length);
  };

  const handleRetry = () => { setAnswers({}); setSubmitted(false); setScore(0); };

  const allAnswered = Object.keys(answers).length === questions.length;
  const pct = Math.round((score / questions.length) * 100);
  const passed = pct >= 60;

  return (
    <div className="sm-detail">
      <button className="sm-back-btn" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Study Materials
      </button>

      {submitted ? (
        <div className="sm-quiz-panel">
          <div className="sm-quiz-header">
            <h2 className="sm-quiz-title">{module.title} — Quiz Results</h2>
          </div>
          <div className="sm-quiz-result">
            <div className={`sm-result-score-ring${passed ? "" : " sm-fail"}`}>
              <span className="sm-result-score-big">{score}/{questions.length}</span>
              <span className="sm-result-score-label">{pct}%</span>
            </div>
            <h3 className="sm-result-title">{passed ? "Well done!" : "Keep Practising"}</h3>
            <p className="sm-result-msg">
              {passed
                ? "You passed this module quiz. Your score has been recorded."
                : "You need 60% to pass. Review the topics and try again."}
            </p>
            <div className="sm-result-actions">
              <button className="sm-btn-retry" onClick={handleRetry}>
                <RotateCcw size={14} style={{ display: "inline", marginRight: 6 }} /> Retry Quiz
              </button>
            </div>

            {/* Certificate section — shown only when passed */}
            {passed && (
              <div style={{ marginTop: 24 }}>
                {certLoading && (
                  <p style={{ textAlign: "center", color: "#3a7ca5", padding: "12px 0" }}>
                    Issuing certificate…
                  </p>
                )}
                {certData && (
                  <>
                    <CertificateTemplate
                      ref={certRef}
                      recipientName={certData.user_full_name}
                      courseName={certData.course_title}
                      issuedAt={certData.issued_at}
                      certificateNumber={certData.certificate_number}
                    />
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
                      <button className="sm-quiz-submit" style={{ width: "auto", padding: "10px 24px" }} onClick={onDownloadCert}>
                        <Award size={16} /> Download Certificate PDF
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div style={{ marginTop: 28 }}>
            {questions.map((q, i) => {
              const userAns = answers[i];
              const correct = q.correct_answer;
              return (
                <div key={q.id} className="sm-quiz-question-card">
                  <div className="sm-quiz-q-num">Question {i + 1}</div>
                  <div className="sm-quiz-q-text">{q.question}</div>
                  <div className="sm-quiz-options">
                    {q.options.map((opt, oi) => {
                      let cls = "sm-quiz-option";
                      if (oi === correct) cls += " sm-opt-correct";
                      else if (oi === userAns && userAns !== correct) cls += " sm-opt-wrong";
                      return (
                        <div key={oi} className={cls}>
                          <span className="sm-quiz-option-letter">{LETTERS[oi]}</span>{opt}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className={`sm-explanation${userAns !== correct ? " sm-expl-wrong" : ""}`}>
                      <strong>{userAns === correct ? "Correct!" : "Incorrect."}</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="sm-quiz-panel">
          <div className="sm-quiz-header">
            <h2 className="sm-quiz-title">{module.title} — Quiz</h2>
            <p className="sm-quiz-subtitle">
              Answer all {questions.length} questions then submit.
              {bestScore !== null && (
                <span style={{ marginLeft: 10, color: "#22c55e", fontWeight: 600 }}>
                  Best: {bestScore}/{questions.length}
                </span>
              )}
            </p>
          </div>
          {questions.map((q, i) => (
            <div key={q.id} className="sm-quiz-question-card">
              <div className="sm-quiz-q-num">Question {i + 1} of {questions.length}</div>
              <div className="sm-quiz-q-text">{q.question}</div>
              <div className="sm-quiz-options">
                {q.options.map((opt, oi) => (
                  <div
                    key={oi}
                    className={`sm-quiz-option${answers[i] === oi ? " sm-opt-selected" : ""}`}
                    onClick={() => handleSelect(i, oi)}
                  >
                    <span className="sm-quiz-option-letter">{LETTERS[oi]}</span>{opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button className="sm-quiz-submit" onClick={handleSubmit} disabled={!allAnswered}>
            <Send size={16} /> Submit Quiz
          </button>
        </div>
      )}

      <NavBar prevItem={prevItem} nextItem={submitted && passed ? nextItem : null} onNavigate={onNavigate} />
    </div>
  );
};

// ── Topic Detail View ────────────────────────────────────────────────────────
const TopicDetail = ({ topic, module, mIdx, isCompleted, onMarkComplete, onBack, prevItem, nextItem, onNavigate }) => {
  const entryTimeRef = useRef(Date.now());

  useEffect(() => {
    entryTimeRef.current = Date.now();
  }, [topic.id]);

  const handleComplete = () => {
    const seconds = Math.floor((Date.now() - entryTimeRef.current) / 1000);
    onMarkComplete(topic.id, seconds);
  };

  return (
    <div className="sm-detail">
      <button className="sm-back-btn" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Study Materials
      </button>

      <div className="sm-detail-breadcrumb">
        <span>{module.title.split(":")[0]}</span>
        <ChevronRight size={12} />
        <span>{topic.title}</span>
      </div>

      {/* Video placeholder */}
      <div className="sm-video-wrap">
        <div className={`sm-video-placeholder ${getTheme(mIdx).grad}`}>
          <div className="sm-video-play-btn">
            <Play size={32} />
          </div>
          <p className="sm-video-label">Video lesson coming soon</p>
        </div>
      </div>

      <div className="sm-detail-meta">
        <span className={`sm-tag ${getTheme(mIdx).tag}`}>
          {module.title.split(":")[0]}
        </span>
        <span className="sm-detail-meta-badge">
          <BookOpen size={12} /> Reading Material
        </span>
        <span className="sm-detail-meta-badge">
          <Clock size={12} /> ~{getReadingMin(topic.content)} min read
        </span>
        {isCompleted && (
          <span className="sm-detail-meta-badge sm-badge--done">
            <CheckCircle size={12} /> Completed
          </span>
        )}
      </div>

      <h1 className="sm-detail-title">{topic.title}</h1>

      <div className="sm-detail-body">{topic.content}</div>

      {!isCompleted ? (
        <button className="sm-complete-btn" onClick={handleComplete}>
          <CheckSquare size={16} /> Mark as Complete
        </button>
      ) : (
        <button className="sm-complete-btn sm-complete-btn--done" disabled>
          <CheckCircle size={16} /> Completed
        </button>
      )}

      <NavBar prevItem={prevItem} nextItem={nextItem} onNavigate={onNavigate} />
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const StudyMaterials = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [progress, setProgress] = useState({ completed_topic_ids: [], quiz_attempts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certData, setCertData] = useState(null);
  const [certLoading, setCertLoading] = useState(false);
  const certRef = useRef(null);

  // null = module grid, { type:"topic", moduleId, topicId, mIdx } or { type:"quiz", moduleId, mIdx }
  const [selected, setSelected] = useState(null);

  const token = localStorage.getItem("token");

  // Modules derived from the selected course
  const modules = selectedCourse?.modules ?? [];

  // ── Data fetching ────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!token) { navigate("/login"); return; }
    try {
      const [coursesRes, progRes] = await Promise.all([
        fetch(`${API}/study/courses`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/study/my-progress`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (coursesRes.status === 401 || progRes.status === 401) { navigate("/login"); return; }
      if (!coursesRes.ok) {
        setError(`Server error: ${coursesRes.status}. Make sure the backend is running.`);
        return;
      }
      const coursesData = await coursesRes.json();
      const prog = progRes.ok ? await progRes.json() : { completed_topic_ids: [], quiz_attempts: [] };
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setProgress(prog);
    } catch {
      setError("Failed to load study materials. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-select a course once when arriving from the dashboard with ?courseId=<id>
  const autoSelectedRef = useRef(false);
  useEffect(() => {
    if (autoSelectedRef.current) return;
    const paramId = searchParams.get("courseId");
    if (paramId && courses.length > 0) {
      const match = courses.find((c) => String(c.id) === paramId);
      if (match) {
        setSelectedCourse(match);
        autoSelectedRef.current = true;
      }
    }
  }, [courses, searchParams]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleMarkComplete = async (topicId, timeSpentSeconds = 0) => {
    try {
      await fetch(`${API}/study/progress`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ topic_id: topicId, time_spent_seconds: timeSpentSeconds }),
      });
      setProgress((prev) => ({
        ...prev,
        completed_topic_ids: [...new Set([...prev.completed_topic_ids, topicId])],
      }));
    } catch { /* silent */ }
  };

  const handleQuizSubmit = async (moduleId, score, total) => {
    try {
      await fetch(`${API}/study/quiz`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ module_id: moduleId, score, total }),
      });
      setProgress((prev) => ({
        ...prev,
        quiz_attempts: [
          { module_id: moduleId, score, total, attempted_at: new Date().toISOString() },
          ...prev.quiz_attempts,
        ],
      }));

      // Issue a certificate when the quiz is passed (≥ 60%)
      if (selectedCourse && Math.round((score / total) * 100) >= 60) {
        setCertLoading(true);
        setCertData(null);
        fetch(`${API}/study/certificates`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ course_title: selectedCourse.title }),
        })
          .then((r) => r.json())
          .then((data) => { setCertData(data); setCertLoading(false); })
          .catch(() => setCertLoading(false));
      }
    } catch { /* silent */ }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isModuleLocked = (mIdx) => {
    if (mIdx === 0) return false;
    const prev = modules[mIdx - 1];
    if (!prev.topics.every((t) => progress.completed_topic_ids.includes(t.id))) return true;
    if (prev.quiz_questions?.length > 0) {
      const best = getBestScore(prev.id);
      if (best === null) return true;
      if (Math.round((best / prev.quiz_questions.length) * 100) < 60) return true;
    }
    return false;
  };

  const isQuizLocked = (mod) =>
    !mod.topics.every((t) => progress.completed_topic_ids.includes(t.id));

  const getModulePct = (mod) => {
    if (!mod.topics.length) return 0;
    const done = mod.topics.filter((t) => progress.completed_topic_ids.includes(t.id)).length;
    return Math.round((done / mod.topics.length) * 100);
  };

  const getBestScore = (moduleId) => {
    const attempts = progress.quiz_attempts.filter((a) => a.module_id === moduleId);
    return attempts.length ? Math.max(...attempts.map((a) => a.score)) : null;
  };

  // Per-course progress helpers
  const getCourseTotalTopics = (course) =>
    course.modules.reduce((s, m) => s + m.topics.length, 0);

  const getCourseDoneTopics = (course) => {
    const allTopicIds = new Set(course.modules.flatMap((m) => m.topics.map((t) => t.id)));
    return progress.completed_topic_ids.filter((id) => allTopicIds.has(id)).length;
  };

  // Module-view totals (for progress strip)
  const totalTopics = modules.reduce((s, m) => s + m.topics.length, 0);
  const doneTopics = (() => {
    const allTopicIds = new Set(modules.flatMap((m) => m.topics.map((t) => t.id)));
    return progress.completed_topic_ids.filter((id) => allTopicIds.has(id)).length;
  })();
  const overallPct = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;

  // ── Loading / Error ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="sm-loading">
        <Anchor size={22} style={{ opacity: 0.5 }} /> Loading study materials…
      </div>
    );
  }

  if (error) {
    return (
      <div className="sm-loading" style={{ flexDirection: "column", gap: 8 }}>
        <AlertCircle size={28} color="#ef4444" />
        <span style={{ color: "#ef4444" }}>{error}</span>
      </div>
    );
  }

  // ── Resolve selected ────────────────────────────────────────────────────
  const selModule = selected ? modules.find((m) => m.id === selected.moduleId) : null;
  const selTopic =
    selected?.type === "topic" && selModule
      ? selModule.topics.find((t) => t.id === selected.topicId)
      : null;

  // ── Build flat nav list (topics + quizzes in order, skipping locked) ────
  const navItems = [];
  modules.forEach((mod, mIdx) => {
    if (isModuleLocked(mIdx)) return;
    mod.topics.forEach((topic) => {
      navItems.push({
        type: "topic",
        moduleId: mod.id,
        topicId: topic.id,
        mIdx,
        label: topic.title,
      });
    });
    if (mod.quiz_questions?.length > 0 && !isQuizLocked(mod)) {
      navItems.push({
        type: "quiz",
        moduleId: mod.id,
        mIdx,
        label: `Module ${mIdx + 1} Quiz`,
      });
    }
  });

  const currentNavIdx = selected
    ? navItems.findIndex((item) =>
        item.type === selected.type &&
        item.moduleId === selected.moduleId &&
        (selected.type === "quiz" || item.topicId === selected.topicId)
      )
    : -1;
  const prevItem = currentNavIdx > 0 ? navItems[currentNavIdx - 1] : null;
  const nextItem = currentNavIdx >= 0 && currentNavIdx < navItems.length - 1 ? navItems[currentNavIdx + 1] : null;
  const handleNavigate = (item) => setSelected(item);

  // ── Card index counter for stagger animation ────────────────────────────
  let cardCounter = 0;

  return (
    <div className={`dashboard-root${sidebarOpen ? " sidebar-open" : " sidebar-collapsed"}`}>
      {/* Desktop Sidebar */}
      <aside className={`sidebar-desktop${sidebarOpen ? " sidebar-desktop--open" : " sidebar-desktop--collapsed"}`}>
        <Sidenav sidebarOpen={sidebarOpen} sidebarItems={sidebarItems} />
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="sidebar-mobile-overlay">
          <div className="sidebar-mobile-backdrop" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="sidebar-mobile-panel">
            <Sidenav sidebarOpen={true} sidebarItems={sidebarItems} />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-topbar nav-gradient">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) setMobileSidebarOpen(true);
              else setSidebarOpen(!sidebarOpen);
            }}
            className="topbar-menu-btn"
          >
            <Menu className="topbar-menu-icon" />
          </button>
          <div className="topbar-search-wrap">
            <div className="topbar-search">
              <Search className="topbar-search-icon" />
              <input type="text" placeholder="Search topics, modules..." className="topbar-search-input" />
            </div>
          </div>
          <div className="topbar-actions">
            <button className="topbar-bell-btn">
              <Bell className="topbar-bell-icon" />
              <span className="topbar-bell-dot" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="dashboard-content">
          <div className="sm-root">

            {/* ═══ COURSE GRID VIEW ═══ */}
            {!selectedCourse && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="sm-header"
                >
                  <h1 className="sm-title">Study Materials</h1>
                  <p className="sm-subtitle">Select a course to begin</p>
                </motion.div>

                <div className="sm-course-grid">
                  {courses.map((course, cIdx) => {
                    const total = getCourseTotalTopics(course);
                    const done = getCourseDoneTopics(course);
                    const pct = total ? Math.round((done / total) * 100) : 0;
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 * cIdx, duration: 0.45 }}
                        className="sm-course-card"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <div className={`sm-course-card__thumb ${getCourseGrad(cIdx)}`}>
                          <div className="sm-course-card__thumb-icon">
                            <GraduationCap size={28} />
                          </div>
                        </div>
                        <div className="sm-course-card__body">
                          <span className="sm-course-card__label">Course</span>
                          <h3 className="sm-course-card__title">{course.title}</h3>
                          <p className="sm-course-card__desc">{course.description}</p>
                          <div className="sm-course-card__footer">
                            <div className="sm-course-card__meta-row">
                              <span className="sm-course-card__meta-item">
                                <BookOpen size={13} />
                                {course.modules.length} module{course.modules.length !== 1 ? "s" : ""}
                              </span>
                              <span className="sm-course-card__meta-item">
                                <Trophy size={13} />
                                {done}/{total} topics
                              </span>
                              <span className="sm-course-card__pct">{pct}%</span>
                            </div>
                            <div className="sm-course-card__prog-bar">
                              <div className="sm-course-card__prog-fill" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ═══ MODULE GRID VIEW (inside a course) ═══ */}
            {selectedCourse && !selected && (
              <>
                {/* Breadcrumb back to courses */}
                <div className="sm-course-breadcrumb">
                  <button
                    className="sm-course-breadcrumb__back"
                    onClick={() => setSelectedCourse(null)}
                  >
                    <ChevronLeft size={16} /> Courses
                  </button>
                  <span className="sm-course-breadcrumb__sep">›</span>
                  <span className="sm-course-breadcrumb__current">{selectedCourse.title}</span>
                </div>

                {/* Page header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="sm-header"
                >
                  <h1 className="sm-title">{selectedCourse.title}</h1>
                  <p className="sm-subtitle">{selectedCourse.description}</p>
                </motion.div>

                {/* Overall progress strip */}
                <div className="sm-progress-strip">
                  <Trophy size={15} color="#f59e0b" />
                  <strong>{doneTopics}</strong> of <strong>{totalTopics}</strong> topics completed
                  <div className="sm-progress-track">
                    <div className="sm-progress-fill" style={{ width: `${overallPct}%` }} />
                  </div>
                  <span>{overallPct}%</span>
                </div>

                {/* Module sections */}
                {modules.map((mod, mIdx) => {
                  const locked = isModuleLocked(mIdx);
                  const pct = getModulePct(mod);
                  const theme = getTheme(mIdx);
                  const best = getBestScore(mod.id);
                  const doneCount = mod.topics.filter((t) =>
                    progress.completed_topic_ids.includes(t.id)
                  ).length;
                  const quizLocked = isQuizLocked(mod);

                  return (
                    <div key={mod.id} className="sm-section">
                      {/* Section header */}
                      <div className={`sm-section__header${locked ? " sm-section--locked" : ""}`}>
                        <div className={`sm-section__num ${theme.tag}`}>{mIdx + 1}</div>
                        <div className="sm-section__info">
                          <h2 className="sm-section__title">{mod.title}</h2>
                          <p className="sm-section__desc">{mod.description}</p>
                          <div className="sm-section__bar-wrap">
                            <div className="sm-section__bar">
                              <div className="sm-section__bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="sm-section__bar-label">
                              {doneCount}/{mod.topics.length} topics
                            </span>
                          </div>
                        </div>
                        {locked && <Lock size={18} className="sm-section__lock" />}
                      </div>

                      {/* Card grid */}
                      <div className="sm-grid">
                        {mod.topics.map((topic) => {
                          const done = progress.completed_topic_ids.includes(topic.id);
                          const idx = cardCounter++;
                          return (
                            <motion.div
                              key={topic.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.04 * idx, duration: 0.4 }}
                              className={`sm-card${locked ? " sm-card--locked" : ""}${done ? " sm-card--done" : ""}`}
                              onClick={() =>
                                !locked &&
                                setSelected({ type: "topic", moduleId: mod.id, topicId: topic.id, mIdx })
                              }
                            >
                              <div className={`sm-card__thumb ${theme.grad}`}>
                                {locked ? (
                                  <span className="sm-card__icon"><Lock size={28} /></span>
                                ) : done ? (
                                  <span className="sm-card__icon sm-card__icon--done"><CheckCircle size={28} /></span>
                                ) : (
                                  <span className="sm-card__icon"><Play size={28} /></span>
                                )}
                              </div>
                              <div className="sm-card__body">
                                <span className={`sm-tag ${theme.tag}`}>
                                  {mod.title.split(":")[0]}
                                </span>
                                <h3 className="sm-card__title">{topic.title}</h3>
                                <p className="sm-card__desc">
                                  {(topic.content || "").slice(0, 90).replace(/\n/g, " ")}…
                                </p>
                                <div className="sm-card__footer">
                                  <span className="sm-card__meta">
                                    <BookOpen size={13} /> Reading
                                  </span>
                                  <span className="sm-card__meta">
                                    <Clock size={13} /> ~{getReadingMin(topic.content)} min
                                  </span>
                                </div>
                              </div>
                              {locked && <div className="sm-card__lock-overlay" />}
                            </motion.div>
                          );
                        })}

                        {/* Quiz card */}
                        {mod.quiz_questions?.length > 0 && (
                          <motion.div
                            key={`quiz-${mod.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.04 * cardCounter++, duration: 0.4 }}
                            className={`sm-card sm-card--quiz${locked || quizLocked ? " sm-card--locked" : ""}`}
                            onClick={() =>
                              !locked &&
                              !quizLocked &&
                              setSelected({ type: "quiz", moduleId: mod.id, mIdx })
                            }
                          >
                            <div className="sm-card__thumb sm-grad--quiz">
                              {locked || quizLocked ? (
                                <span className="sm-card__icon"><Lock size={28} /></span>
                              ) : best !== null ? (
                                <span className="sm-card__icon sm-card__icon--done"><CheckCircle size={28} /></span>
                              ) : (
                                <span className="sm-card__icon"><HelpCircle size={28} /></span>
                              )}
                            </div>
                            <div className="sm-card__body">
                              <span className="sm-tag sm-tag--quiz">Quiz</span>
                              <h3 className="sm-card__title">Module {mIdx + 1} Quiz</h3>
                              <p className="sm-card__desc">
                                {mod.quiz_questions.length} questions — 60% to pass
                              </p>
                              <div className="sm-card__footer">
                                {best !== null ? (
                                  <span className="sm-card__meta sm-meta--score">
                                    <Trophy size={13} /> Best: {best}/{mod.quiz_questions.length}
                                  </span>
                                ) : quizLocked ? (
                                  <span className="sm-card__meta">
                                    <Lock size={13} /> Complete all topics first
                                  </span>
                                ) : (
                                  <span className="sm-card__meta">
                                    <HelpCircle size={13} /> Not attempted
                                  </span>
                                )}
                              </div>
                            </div>
                            {(locked || quizLocked) && <div className="sm-card__lock-overlay" />}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* ═══ TOPIC DETAIL VIEW ═══ */}
            {selected?.type === "topic" && selTopic && selModule && (
              <TopicDetail
                topic={selTopic}
                module={selModule}
                mIdx={selected.mIdx}
                isCompleted={progress.completed_topic_ids.includes(selTopic.id)}
                onMarkComplete={handleMarkComplete}
                onBack={() => setSelected(null)}
                prevItem={prevItem}
                nextItem={nextItem}
                onNavigate={handleNavigate}
              />
            )}

            {/* ═══ QUIZ VIEW ═══ */}
            {selected?.type === "quiz" && selModule && (
              <QuizPanel
                key={`quiz-${selModule.id}`}
                module={selModule}
                onQuizSubmit={handleQuizSubmit}
                bestScore={getBestScore(selModule.id)}
                onBack={() => setSelected(null)}
                prevItem={prevItem}
                nextItem={nextItem}
                onNavigate={handleNavigate}
                certData={certData}
                certLoading={certLoading}
                certRef={certRef}
                onDownloadCert={() =>
                  certRef.current &&
                  downloadCertificatePDF(
                    certRef.current,
                    `certificate-${certData?.certificate_number}.pdf`
                  )
                }
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudyMaterials;
