import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Award, BarChart3, FileText,
  Settings, HelpCircle, Calendar, BookMarked, ChevronRight,
  ChevronDown, CheckCircle2, Circle, Clock, Tag,
  ArrowLeft, ArrowRight, Menu,
} from "lucide-react";
import Sidenav from "./sidenav";
import "../pages/dashboard.css";
import "../pages/StudyMaterials.css";

const sidebarItems = [
  { label: "Dashboard",       icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Courses",      icon: BookOpen,        href: "/mycourses" },
  { label: "Study Materials", icon: BookMarked,      href: "/study-materials", active: true },
  { label: "Calendar",        icon: Calendar,        href: "/calendar" },
  { label: "Certificates",    icon: Award,           href: "/certificates" },
  { label: "Reports",         icon: BarChart3,       href: "/dashboard" },
  { label: "Resources",       icon: FileText,        href: "/dashboard" },
  { label: "Settings",        icon: Settings,        href: "/settings" },
  { label: "Help",            icon: HelpCircle,      href: "/dashboard" },
];

/* flatten chapters/lessons into a linear list for prev/next nav */
function buildLessonList(chapters) {
  const list = [];
  chapters.forEach((ch) => ch.lessons.forEach((le) => list.push({ chapter: ch, lesson: le })));
  return list;
}

/* ── Quiz ───────────────────────────────────────────────────────────────── */
const Quiz = ({ questions }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const score = submitted
    ? questions.filter((q) => answers[q.id] === q.correct_answer).length
    : 0;

  return (
    <div className="smv-quiz">
      <h2 className="smv-quiz-title">📝 Assessment Quiz</h2>
      <p className="smv-quiz-sub">{questions.length} questions · Choose the best answer</p>

      {questions.map((q, i) => {
        const chosen = answers[q.id];
        const correct = q.correct_answer;
        return (
          <div
            key={q.id}
            className={`smv-q${submitted ? (chosen === correct ? " smv-q--correct" : " smv-q--wrong") : ""}`}
          >
            <p className="smv-q-text"><span className="smv-q-num">Q{i + 1}.</span> {q.question}</p>
            <div className="smv-q-options">
              {q.options.map((opt) => {
                const isChosen = chosen === opt.key;
                const isCorrect = opt.key === correct;
                return (
                  <label
                    key={opt.key}
                    className={`smv-opt${submitted && isCorrect ? " smv-opt--correct" : ""}${submitted && isChosen && !isCorrect ? " smv-opt--wrong" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt.key}
                      disabled={submitted}
                      checked={isChosen}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt.key }))}
                    />
                    <span className="smv-opt-key">{opt.key}</span>
                    <span>{opt.text}</span>
                  </label>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="smv-q-explanation">💡 {q.explanation}</p>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button
          className="smv-btn smv-btn--primary"
          disabled={Object.keys(answers).length < questions.length}
          onClick={() => setSubmitted(true)}
        >
          Submit Quiz
        </button>
      ) : (
        <div className="smv-score">
          <span className="smv-score-val">{score} / {questions.length}</span>
          <span className="smv-score-label">
            {score === questions.length ? "Perfect score! 🎉" : score >= questions.length * 0.7 ? "Good job! ✅" : "Keep studying 📖"}
          </span>
          <button
            className="smv-btn smv-btn--ghost"
            onClick={() => { setAnswers({}); setSubmitted(false); }}
          >
            Retake
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Main ───────────────────────────────────────────────────────────────── */
const StudyMaterialView = () => {
  const { materialKey } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openChapters, setOpenChapters] = useState({});
  const [activeIdx, setActiveIdx] = useState([0, 0]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [visited, setVisited] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    fetch(`http://localhost:8000/courses/${materialKey}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (!r.ok) throw new Error("Material not found"); return r.json(); })
      .then((data) => {
        setMaterial(data);
        if (data.chapters.length > 0) {
          setOpenChapters({ 0: true });
          setVisited(new Set(["0-0"]));
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [materialKey, navigate]);

  const selectLesson = (ci, li) => {
    setActiveIdx([ci, li]);
    setShowQuiz(false);
    setVisited((v) => new Set([...v, `${ci}-${li}`]));
    setOpenChapters((o) => ({ ...o, [ci]: true }));
  };

  const lessonList = material ? buildLessonList(material.chapters) : [];
  const currentFlatIdx = lessonList.findIndex((item) => {
    const [ci, li] = activeIdx;
    return (
      material &&
      item.chapter.id === material.chapters[ci]?.id &&
      item.lesson.id === material.chapters[ci]?.lessons[li]?.id
    );
  });

  const goToFlat = (idx) => {
    if (idx < 0 || idx >= lessonList.length) return;
    const item = lessonList[idx];
    const ci = material.chapters.findIndex((c) => c.id === item.chapter.id);
    const li = material.chapters[ci].lessons.findIndex((l) => l.id === item.lesson.id);
    selectLesson(ci, li);
  };

  const activeLesson = material && !showQuiz
    ? material.chapters[activeIdx[0]]?.lessons[activeIdx[1]]
    : null;

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
        <header className="dashboard-topbar nav-gradient">
          <button
            className="topbar-menu-btn"
            onClick={() => {
              if (window.innerWidth < 1024) setMobileSidebarOpen(true);
              else setSidebarOpen(!sidebarOpen);
            }}
          >
            <Menu className="topbar-menu-icon" />
          </button>

          <div style={{ flex: 1 }} />

          <Link to="/study-materials" className="smv-back-link">
            <ArrowLeft size={14} /> All Materials
          </Link>
        </header>

        {loading && (
          <div className="sm-state">
            <div className="sm-spinner" />
            <p>Loading…</p>
          </div>
        )}
        {error && <div className="sm-state sm-state--error"><p>{error}</p></div>}

        {material && (
          <div className="smv-layout">
            {/* Chapter / Lesson Navigator */}
            <aside className="smv-nav">
              <div className="smv-nav-header">
                <span className="smv-nav-icon">{material.icon}</span>
                <span className="smv-nav-title">{material.title}</span>
              </div>

              <div className="smv-nav-list">
                {material.chapters.map((ch, ci) => (
                  <div key={ch.id} className="smv-nav-chapter">
                    <button
                      className="smv-nav-ch-btn"
                      onClick={() => setOpenChapters((o) => ({ ...o, [ci]: !o[ci] }))}
                    >
                      <span className="smv-nav-ch-label">{ch.title}</span>
                      {openChapters[ci] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    <AnimatePresence initial={false}>
                      {openChapters[ci] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: "hidden" }}
                        >
                          {ch.lessons.map((le, li) => {
                            const isActive = !showQuiz && activeIdx[0] === ci && activeIdx[1] === li;
                            const isDone = visited.has(`${ci}-${li}`);
                            return (
                              <button
                                key={le.id}
                                className={`smv-nav-lesson${isActive ? " smv-nav-lesson--active" : ""}`}
                                onClick={() => selectLesson(ci, li)}
                              >
                                {isDone
                                  ? <CheckCircle2 size={13} className="smv-nav-check smv-nav-check--done" />
                                  : <Circle size={13} className="smv-nav-check" />}
                                <span>{le.title}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {material.quiz_questions?.length > 0 && (
                  <button
                    className={`smv-nav-quiz-btn${showQuiz ? " smv-nav-lesson--active" : ""}`}
                    onClick={() => setShowQuiz(true)}
                  >
                    📝 Assessment Quiz
                  </button>
                )}
              </div>
            </aside>

            {/* Content Area */}
            <div className="smv-content">
              <AnimatePresence mode="wait">
                {showQuiz ? (
                  <motion.div
                    key="quiz"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Quiz questions={material.quiz_questions} />
                  </motion.div>
                ) : activeLesson ? (
                  <motion.div
                    key={`${activeIdx[0]}-${activeIdx[1]}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="smv-lesson"
                  >
                    <p className="smv-breadcrumb">{material.chapters[activeIdx[0]]?.title}</p>
                    <h1 className="smv-lesson-title">{activeLesson.title}</h1>

                    <div className="smv-lesson-meta">
                      {activeLesson.duration && (
                        <span className="sm-meta-pill">
                          <Clock size={12} /> {activeLesson.duration}
                        </span>
                      )}
                    </div>

                    {activeLesson.topics?.length > 0 && (
                      <div className="smv-topics">
                        <p className="smv-topics-label"><Tag size={13} /> Topics covered</p>
                        <ul className="smv-topics-list">
                          {activeLesson.topics.map((t, i) => (
                            <li key={i} className="smv-topic-item">
                              <ChevronRight size={12} /> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeLesson.content && (
                      <div className="smv-body">
                        {activeLesson.content.split("\n\n").map((para, i) => (
                          <p key={i} className="smv-para">
                            {para.split("\n").map((line, j, arr) => (
                              <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                            ))}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="smv-nav-controls">
                      <button
                        className="smv-btn smv-btn--ghost"
                        disabled={currentFlatIdx <= 0}
                        onClick={() => goToFlat(currentFlatIdx - 1)}
                      >
                        <ArrowLeft size={14} /> Previous
                      </button>

                      {currentFlatIdx < lessonList.length - 1 ? (
                        <button
                          className="smv-btn smv-btn--primary"
                          onClick={() => goToFlat(currentFlatIdx + 1)}
                        >
                          Next <ArrowRight size={14} />
                        </button>
                      ) : (
                        <button
                          className="smv-btn smv-btn--primary"
                          onClick={() => setShowQuiz(true)}
                        >
                          Take Quiz <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyMaterialView;
