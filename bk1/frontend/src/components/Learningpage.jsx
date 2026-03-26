import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { coursesByDepartment, getDepartmentTitle, getCourseData } from "./courseData";
import "../pages/Learningpage.css";



// ─── SVG Icons (1-to-1 with lucide-react) ────────────────────────────────────

const IconBookOpen = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const IconAward = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const IconClock = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconPlay = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IconPause = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="4" height="16" x="6" y="4"/>
    <rect width="4" height="16" x="14" y="4"/>
  </svg>
);
const IconCheck = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);
const IconLock = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconArrowLeft = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);
const IconListChecks = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/>
    <path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>
  </svg>
);
const IconDownload = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" x2="12" y1="15" y2="3"/>
  </svg>
);
const IconRotate = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);
const IconX = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
const IconTrophy = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);
const IconChevronRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
const IconChevronDown = ({ size = 16, rotated = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: rotated ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

// ─── Progress (replaces <Progress />) ────────────────────────────────────────
const Progress = ({ value, className = "" }) => (
  <div className={`lp-progress ${className}`}>
    <div className="lp-progress__fill" style={{ width: `${Math.min(Math.max(value || 0, 0), 100)}%` }} />
  </div>
);

// ─── Button (replaces shadcn <Button />) ──────────────────────────────────────
const Btn = ({ children, onClick, disabled, variant = "default", size = "default", className = "" }) => (
  <button
    onClick={onClick}
    disabled={!!disabled}
    className={[
      "lp-btn",
      `lp-btn--${variant}`,
      size !== "default" ? `lp-btn--${size}` : "",
      disabled ? "lp-btn--disabled" : "",
      className,
    ].filter(Boolean).join(" ")}
  >
    {children}
  </button>
);

// ─── LearningPage ─────────────────────────────────────────────────────────────
const LearningPage = () => {
  const { departmentId, courseId } = useParams();
  const navigate = useNavigate();

  const course     = getCourseData(departmentId || "", courseId || "");
  const allLessons = course ? course.chapters.flatMap(ch => ch.lessons) : [];

  const [stage, setStage]                         = useState("learning");
  const [selectedLessonId, setSelectedLessonId]   = useState(null);
  const [lessonProgress, setLessonProgress]       = useState({});
  const [lessonsCompleted, setLessonsCompleted]   = useState(new Set());
  const [isPlaying, setIsPlaying]                 = useState(false);
  const [expandedChapters, setExpandedChapters]   = useState(
    new Set(course ? [course.chapters[0]?.id] : [])
  );
  const [certificateUnlocked, setCertificateUnlocked] = useState(false);

  // Quiz
  const [quizQuestions, setQuizQuestions]               = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers]           = useState({});
  const [score, setScore]                               = useState(0);

  // Progress simulation tick


  // Course not found
  if (!course) {
    return (
      <div className="lp-notfound">
        <div className="lp-notfound__card">
          <h2 className="lp-notfound__title">Course Not Found</h2>
          <p className="lp-notfound__desc">The requested course could not be found.</p>
          <Btn onClick={() => navigate("/courses")}>Back to Courses</Btn>
        </div>
      </div>
    );
  }

  // Helpers
  const isChapterComplete   = ch  => ch.lessons.every(l => lessonsCompleted.has(l.id));
  const isChapterUnlocked   = idx => idx === 0 || isChapterComplete(course.chapters[idx - 1]);
  const allChaptersComplete = course.chapters.every(ch => isChapterComplete(ch));

  const toggleChapter = id => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleLessonClick = (lessonId, chIdx) => {
    if (!isChapterUnlocked(chIdx)) return;
    setSelectedLessonId(lessonId);
    setIsPlaying(false);
  };

  const startQuiz = useCallback(() => {
    const shuffled = [...course.quizPool].sort(() => Math.random() - 0.5);
    setQuizQuestions(shuffled.slice(0, 10));
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setScore(0);
    setStage("quiz");
  }, [course]);

  const submitQuiz = () => {
    let correct = 0;
    quizQuestions.forEach((q, i) => { if (selectedAnswers[i] === q.correctIndex) correct++; });
    setScore(correct);
    setStage("result");
    if (correct >= 7) setCertificateUnlocked(true);
  };

  const passed            = score >= 7;
  const selectedLesson    = allLessons.find(l => l.id === selectedLessonId);
  const selectedProgress  = selectedLessonId ? (lessonProgress[selectedLessonId] || 0) : 0;
  const selectedCompleted = selectedLessonId ? lessonsCompleted.has(selectedLessonId) : false;
  const totalLessons      = allLessons.length;
  const completedCount    = allLessons.filter(l => lessonsCompleted.has(l.id)).length;
  const overallProgress   = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    /* min-h-screen bg-background flex flex-col */
    <div className="lp-root">

      {/* flex-1 flex overflow-hidden pt-16 lg:pt-20 */}
      <div className="lp-layout">

        {/* ══ SIDEBAR: w-72 lg:w-80 border-r bg-card flex flex-col shrink-0 hidden md:flex ══ */}
        <aside className="lp-sidebar">

          {/* p-4 border-b */}
          <div className="lp-sidebar__header">
            <div className="lp-sidebar__titlerow">
              <span className="lp-sidebar__icon">{course.icon}</span>
              <h2 className="lp-sidebar__title">{course.title}</h2>
            </div>
            {/* flex items-center gap-3 mt-2 text-xs text-muted-foreground */}
            <div className="lp-sidebar__meta">
              <span className="lp-sidebar__metaitem">
                <IconClock size={12} /> {course.totalDuration}
              </span>
              <span className="lp-sidebar__metaitem">
                <IconBookOpen size={12} /> {totalLessons} Lessons
              </span>
            </div>
            {/* h-1.5 mt-3 */}
            <Progress value={overallProgress} className="lp-progress--xs lp-mt3" />
          </div>

          {/* ScrollArea flex-1 */}
          <div className="lp-sidebar__scroll">
            <div className="lp-sidebar__list">

              {course.chapters.map((chapter, chIdx) => {
                const unlocked = isChapterUnlocked(chIdx);
                const complete = isChapterComplete(chapter);
                const expanded = expandedChapters.has(chapter.id);

                return (
                  <div key={chapter.id} className="lp-chapter">
                    {/* chapter btn: w-full flex items-center gap-2 px-3 py-2.5 rounded-lg */}
                    <button
                      onClick={() => unlocked && toggleChapter(chapter.id)}
                      className={`lp-chapter__btn${!unlocked ? " lp-chapter__btn--locked" : ""}`}
                    >
                      <span className="lp-icon--sm lp-shrink0">
                        {complete
                          ? <span className="lp-emerald"><IconCheck size={16} /></span>
                          : unlocked
                            ? <span className="lp-muted"><IconChevronDown size={16} rotated={!expanded} /></span>
                            : <span className="lp-muted"><IconLock size={16} /></span>
                        }
                      </span>
                      {/* font-semibold text-xs flex-1 */}
                      <span className={`lp-chapter__label${complete ? " lp-emerald" : ""}`}>
                        {chapter.title}
                      </span>
                      {/* text-[10px] font-bold text-emerald-500 bg-emerald-500/10 */}
                      {complete && <span className="lp-badge--done">DONE</span>}
                    </button>

                    {/* ml-3 border-l-2 border-border pl-2 space-y-0.5 mb-2 */}
                    {unlocked && expanded && (
                      <div className="lp-lessons">
                        {chapter.lessons.map(lesson => {
                          const lessonDone = lessonsCompleted.has(lesson.id);
                          const isActive   = selectedLessonId === lesson.id;
                          const progress   = lessonProgress[lesson.id] || 0;

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson.id, chIdx)}
                              className={[
                                "lp-lesson__btn",
                                isActive   ? "lp-lesson__btn--active" : "",
                                lessonDone ? "lp-lesson__btn--done"   : "",
                              ].filter(Boolean).join(" ")}
                            >
                              <span className="lp-icon--sm lp-shrink0">
                                {lessonDone ? (
                                  <span className="lp-emerald"><IconCheck size={16} /></span>
                                ) : isActive && isPlaying ? (
                                  /* w-4 h-4 rounded-full border-2 border-primary */
                                  <span className="lp-playing">
                                    <span className="lp-playing__dot" />
                                  </span>
                                ) : (
                                  <span className="lp-muted"><IconPlay size={14} /></span>
                                )}
                              </span>
                              <div className="lp-lesson__info">
                                <p className="lp-lesson__title">{lesson.title}</p>
                                <p className="lp-lesson__dur">{lesson.duration}</p>
                              </div>
                              {progress > 0 && !lessonDone && (
                                <span className="lp-lesson__pct">{Math.round(progress)}%</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* mt-2 border-t pt-2 — Quiz row */}
              <div className="lp-sidebar__sep">
                <button
                  onClick={() => allChaptersComplete && startQuiz()}
                  className={`lp-action__btn${allChaptersComplete ? " lp-action__btn--quiz" : " lp-action__btn--locked"}`}
                >
                  <span className="lp-icon--sm lp-shrink0">
                    {allChaptersComplete
                      ? <span className="lp-primary"><IconListChecks size={16} /></span>
                      : <span className="lp-muted"><IconLock size={16} /></span>}
                  </span>
                  <span className="lp-action__label">Final Quiz (10 Questions)</span>
                </button>
              </div>

              {/* mt-1 border-t pt-2 — Certificate row */}
              <div className="lp-sidebar__sep lp-sidebar__sep--mt1">
                <button
                  onClick={() => certificateUnlocked && setStage("result")}
                  className={`lp-action__btn${certificateUnlocked ? " lp-action__btn--cert" : " lp-action__btn--locked"}`}
                >
                  <span className="lp-icon--sm lp-shrink0">
                    {certificateUnlocked
                      ? <span className="lp-amber"><IconAward size={16} /></span>
                      : <span className="lp-muted"><IconLock size={16} /></span>}
                  </span>
                  <span className="lp-action__label">
                    {certificateUnlocked ? "🎓 Certificate Earned" : "🔒 Certificate (Locked)"}
                  </span>
                  {certificateUnlocked && (
                    /* text-[10px] font-bold text-amber-500 bg-amber-500/10 ml-auto */
                    <span className="lp-badge--unlocked lp-ml-auto">UNLOCKED</span>
                  )}
                </button>
              </div>

            </div>
          </div>
        </aside>

        {/* ══ MAIN: flex-1 min-w-0 overflow-y-auto ══ */}
        <main className="lp-main">
          <AnimatePresence mode="wait">

            {/* ════ LEARNING ════ */}
            {stage === "learning" && (
              <motion.div
                key="learning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lp-learning"
              >
                {selectedLesson ? (
                  <>
                    {/* relative aspect-video max-h-[55vh] bg-black */}
                    <div className="lp-video">
                      {selectedLesson.videoUrl ? (
                        <video
  key={selectedLesson.videoUrl}
  controls
  className="lp-video__iframe"
  src={selectedLesson.videoUrl}
  onTimeUpdate={(e) => {
    const pct = (e.target.currentTime / e.target.duration) * 100;
    setLessonProgress(prev => ({ ...prev, [selectedLessonId]: pct }));
  }}
  onEnded={() => {
    setLessonProgress(prev => ({ ...prev, [selectedLessonId]: 100 }));
    setLessonsCompleted(prev => new Set(prev).add(selectedLessonId));
  }}
/>
                      ) : (
                        /* w-full h-full nav-gradient flex items-center justify-center */
                        <div className="lp-video__placeholder lp-nav-gradient">
                          <div className="lp-video__ph-inner">
                            <div className="lp-video__icon">{course.icon}</div>
                            <h2 className="lp-video__title">{selectedLesson.title}</h2>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* px-4 lg:px-6 py-3 border-b bg-card */}
                    <div className="lp-controls">
                      <div className="lp-controls__row">
                        <span className="lp-controls__label">Lesson Progress</span>
                        <div className="lp-controls__right">
                          {!selectedCompleted && (
                            /* rounded-full text-xs h-7 px-3 gap-1 */
                            <Btn
                              size="sm"
                              variant={isPlaying ? "secondary" : "default"}
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="lp-btn--pill lp-btn--h7"
                            >
                              {isPlaying
                                ? <><IconPause size={12} /> Pause</>
                                : <><IconPlay size={12} /> {selectedProgress > 0 ? "Continue" : "Mark Progress"}</>
                              }
                            </Btn>
                          )}
                          {selectedCompleted && (
                            /* flex items-center gap-1 text-xs text-emerald-600 font-semibold */
                            <span className="lp-controls__complete">
                              <IconCheck size={14} /> Complete
                            </span>
                          )}
                          <span className="lp-controls__pct">{Math.round(selectedProgress)}%</span>
                        </div>
                      </div>
                      {/* h-2 */}
                      <Progress value={selectedProgress} className="lp-progress--sm" />
                      <p className="lp-controls__hint">
                        Watch the video and click "Mark Progress" to track completion (90% required).
                      </p>
                    </div>

                    {/* p-4 lg:p-6 flex-1 */}
                    <div className="lp-topics">
                      <h3 className="lp-topics__heading">Topics Covered</h3>
                      <div className="lp-topics__list">
                        {selectedLesson.topics.map((t, i) => (
                          <div key={i} className="lp-topics__item">
                            <span className="lp-primary lp-fw-bold lp-mt05">•</span>
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>

                      {selectedCompleted && (
                        <div className="lp-mt6">
                          {(() => {
                            const curIdx = allLessons.findIndex(l => l.id === selectedLessonId);
                            if (curIdx < allLessons.length - 1) {
                              const nextLesson = allLessons[curIdx + 1];
                              const nextChIdx  = course.chapters.findIndex(ch =>
                                ch.lessons.some(l => l.id === nextLesson.id)
                              );
                              if (isChapterUnlocked(nextChIdx)) {
                                return (
                                  <Btn
                                    className="lp-btn--pill lp-btn--gap"
                                    onClick={() => {
                                      setSelectedLessonId(nextLesson.id);
                                      setExpandedChapters(prev =>
                                        new Set(prev).add(course.chapters[nextChIdx].id)
                                      );
                                    }}
                                  >
                                    Next Lesson <IconChevronRight size={16} />
                                  </Btn>
                                );
                              }
                            }
                            if (allChaptersComplete) {
                              return (
                                <Btn onClick={startQuiz} className="lp-btn--pill lp-btn--gap lp-btn--emerald">
                                  <IconListChecks size={16} /> Take Quiz
                                </Btn>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* flex-1 flex items-center justify-center p-8 */
                  <div className="lp-welcome">
                    <div className="lp-welcome__inner">
                      <div className="lp-welcome__icon">{course.icon}</div>
                      <h2 className="lp-welcome__title">{course.title}</h2>
                      <p className="lp-welcome__desc">{course.description}</p>
                      <div className="lp-welcome__meta">
                        <span className="lp-sidebar__metaitem"><IconClock size={16} /> {course.totalDuration}</span>
                        <span className="lp-sidebar__metaitem"><IconBookOpen size={16} /> {totalLessons} Lessons</span>
                        <span className="lp-sidebar__metaitem"><IconListChecks size={16} /> {course.chapters.length} Chapters</span>
                      </div>
                      {/* rounded-full px-8 gap-2 size="lg" */}
                      <Btn
                        size="lg"
                        className="lp-btn--pill lp-btn--gap lp-btn--px8"
                        onClick={() => {
                          const first = course.chapters[0]?.lessons[0];
                          if (first) {
                            setSelectedLessonId(first.id);
                            setExpandedChapters(new Set([course.chapters[0].id]));
                          }
                        }}
                      >
                        <IconPlay size={20} /> Start Learning
                      </Btn>
                    </div>
                  </div>
                )}

                {/* md:hidden fixed bottom-4 left-4 right-4 z-20 */}
                <div className="lp-mobilebar">
                  <div className="lp-mobilebar__card">
                    <div className="lp-mobilebar__row">
                      <div className="lp-mobilebar__text">
                        <span className="lp-fw-semibold">{completedCount}/{totalLessons}</span>
                        <span className="lp-muted lp-ml1"> lessons done</span>
                      </div>
                      {/* w-24 h-1.5 */}
                      <Progress value={overallProgress} className="lp-progress--mobile" />
                      {allChaptersComplete && (
                        <Btn size="sm" onClick={startQuiz} className="lp-btn--pill">Take Quiz</Btn>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════ QUIZ ════ */}
            {stage === "quiz" && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                /* max-w-3xl mx-auto p-4 lg:p-8 space-y-6 */
                className="lp-quiz"
              >
                <div className="lp-quiz__top">
                  <h2 className="lp-quiz__heading">
                    <span className="lp-primary"><IconListChecks size={20} /></span>
                    Quiz: {course.title}
                  </h2>
                  <span className="lp-quiz__count">{Object.keys(selectedAnswers).length}/10 answered</span>
                </div>

                {/* h-2 */}
                <Progress value={(Object.keys(selectedAnswers).length / 10) * 100} className="lp-progress--sm" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                  >
                    {/* Card border-primary/20 */}
                    <div className="lp-qcard">
                      <div className="lp-qcard__body">
                        <div className="lp-qcard__header">
                          {/* w-8 h-8 rounded-full bg-primary text-primary-foreground */}
                          <span className="lp-qcard__num">{currentQuestionIndex + 1}</span>
                          <span className="lp-qcard__of">Question {currentQuestionIndex + 1} of 10</span>
                        </div>
                        <h3 className="lp-qcard__question">{quizQuestions[currentQuestionIndex]?.question}</h3>
                        <div className="lp-options">
                          {quizQuestions[currentQuestionIndex]?.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedAnswers(p => ({ ...p, [currentQuestionIndex]: i }))}
                              className={`lp-option${selectedAnswers[currentQuestionIndex] === i ? " lp-option--selected" : ""}`}
                            >
                              <span className="lp-option__letter">{String.fromCharCode(65 + i)}.</span>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* flex items-center justify-between */}
                <div className="lp-quiz__nav">
                  <Btn variant="outline" disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(p => p - 1)}
                    className="lp-btn--pill lp-btn--gap">
                    <IconArrowLeft size={16} /> Previous
                  </Btn>

                  {/* flex gap-1 flex-wrap justify-center */}
                  <div className="lp-quiz__dots">
                    {quizQuestions.map((_, i) => (
                      <button key={i} onClick={() => setCurrentQuestionIndex(i)}
                        className={[
                          "lp-quiz__dot",
                          i === currentQuestionIndex       ? "lp-quiz__dot--active"   : "",
                          selectedAnswers[i] !== undefined ? "lp-quiz__dot--answered" : "",
                        ].filter(Boolean).join(" ")}>
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  {currentQuestionIndex < 9 ? (
                    <Btn onClick={() => setCurrentQuestionIndex(p => p + 1)} className="lp-btn--pill lp-btn--gap">
                      Next <IconChevronRight size={16} />
                    </Btn>
                  ) : (
                    <Btn onClick={submitQuiz} disabled={Object.keys(selectedAnswers).length < 10}
                      className="lp-btn--pill lp-btn--emerald">
                      Submit Quiz
                    </Btn>
                  )}
                </div>
              </motion.div>
            )}

            {/* ════ RESULT ════ */}
            {stage === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                /* max-w-2xl mx-auto p-4 lg:p-8 space-y-6 */
                className="lp-result"
              >
                {/* Card overflow-hidden border-emerald/destructive */}
                <div className={`lp-result__card${passed ? " lp-result__card--pass" : " lp-result__card--fail"}`}>

                  {/* p-8 text-center gradient */}
                  <div className={`lp-result__hero${passed ? " lp-result__hero--pass" : " lp-result__hero--fail"}`}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                      <div className="lp-result__emoji">{passed ? "🎉" : "😔"}</div>
                    </motion.div>
                    <h2 className="lp-result__heading">{passed ? "Congratulations!" : "Not Quite There"}</h2>
                    <p className="lp-result__sub">
                      {passed
                        ? "You've passed the quiz and earned your certificate!"
                        : "You need at least 70% to pass. Try again with a different question set."}
                    </p>
                  </div>

                  {/* CardContent p-6 */}
                  <div className="lp-result__body">
                    {/* flex items-center justify-center gap-8 mb-6 */}
                    <div className="lp-result__stats">
                      <div className="lp-result__stat">
                        <p className="lp-result__statval">{score}/10</p>
                        <p className="lp-result__statlbl">Correct Answers</p>
                      </div>
                      <div className="lp-result__divider" />
                      <div className="lp-result__stat">
                        <p className={`lp-result__statval${passed ? " lp-emerald" : " lp-destructive"}`}>{score * 10}%</p>
                        <p className="lp-result__statlbl">Score</p>
                      </div>
                      <div className="lp-result__divider" />
                      <div className="lp-result__stat">
                        <p className="lp-result__statval">70%</p>
                        <p className="lp-result__statlbl">Pass Mark</p>
                      </div>
                    </div>

                    {passed ? (
                      <div className="lp-cert">
                        {/* Card border-2 border-dashed border-primary/30 bg-primary/5 */}
                        <div className="lp-cert__card">
                          <div className="lp-cert__body">
                            <span className="lp-cert__trophy lp-primary"><IconTrophy size={40} /></span>
                            <h3 className="lp-cert__title">Certificate of Completion</h3>
                            <p className="lp-cert__course">{course.title}</p>
                            <p className="lp-cert__awardee">Awarded to <span className="lp-fw-semibold lp-fg">{localStorage.getItem("full_name") || "User"}</span></p>
                            <p className="lp-cert__date">Date: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                            <p className="lp-cert__id">Certificate #{`MAR-${String(Math.floor(Math.random() * 90000 + 10000))}`}</p>
                          </div>
                        </div>
                        <div className="lp-cert__actions">
                          <Btn className="lp-btn--pill lp-btn--gap">
                            <IconDownload size={16} /> Download PDF
                          </Btn>
                          <Btn variant="outline" className="lp-btn--pill lp-btn--gap" onClick={() => navigate("/certificates")}>
                            <IconAward size={16} /> View Certificates
                          </Btn>
                        </div>
                      </div>
                    ) : (
                      <div className="lp-result__failactions">
                        <Btn onClick={startQuiz} className="lp-btn--pill lp-btn--gap">
                          <IconRotate size={16} /> Retake Quiz (New Questions)
                        </Btn>
                        <Btn variant="outline" onClick={() => setStage("learning")} className="lp-btn--pill">
                          Review Lessons
                        </Btn>
                      </div>
                    )}
                  </div>
                </div>

                {/* Answer Review Card */}
                <div className="lp-review">
                  <div className="lp-review__header">
                    <h3 className="lp-review__title">Answer Review</h3>
                  </div>
                  <div className="lp-review__list">
                    {quizQuestions.map((q, i) => {
                      const correct = selectedAnswers[i] === q.correctIndex;
                      return (
                        <div key={q.id} className={`lp-review__item${correct ? " lp-review__item--pass" : " lp-review__item--fail"}`}>
                          <div className="lp-review__row">
                            <span className="lp-icon--sm lp-shrink0 lp-mt05">
                              {correct
                                ? <span className="lp-emerald"><IconCheck size={16} /></span>
                                : <span className="lp-destructive"><IconX size={16} /></span>}
                            </span>
                            <div>
                              <p className="lp-review__q">{q.question}</p>
                              <p className="lp-review__ans">
                                Your answer:{" "}
                                <span className={correct ? "lp-emerald lp-fw-medium" : "lp-destructive lp-fw-medium"}>
                                  {q.options[selectedAnswers[i]]}
                                </span>
                                {!correct && <>
                                  {" "}• Correct:{" "}
                                  <span className="lp-emerald lp-fw-medium">{q.options[q.correctIndex]}</span>
                                </>}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default LearningPage;