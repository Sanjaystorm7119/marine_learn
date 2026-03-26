import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  CheckCircle,
  Circle,
  HelpCircle,
  FileText,
  Anchor,
  Trophy,
  RotateCcw,
  CheckSquare,
  Send,
  AlertCircle,
} from "lucide-react";
import "../pages/studymaterials.css";

const API = "http://localhost:8000";

// ── Option letters ─────────────────────────────────────────────────────────────
const LETTERS = ["A", "B", "C", "D"];

// ── Quiz component ─────────────────────────────────────────────────────────────
const QuizPanel = ({ module, onQuizSubmit, bestScore }) => {
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
    questions.forEach((q, i) => {
      if (answers[i] === q.correct_answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    await onQuizSubmit(module.id, correct, questions.length);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const allAnswered = Object.keys(answers).length === questions.length;
  const pct = Math.round((score / questions.length) * 100);
  const passed = pct >= 60;

  if (submitted) {
    return (
      <div className="sm-quiz-panel">
        <div className="sm-quiz-header">
          <h2 className="sm-quiz-title">{module.title} — Quiz</h2>
          <p className="sm-quiz-subtitle">Results</p>
        </div>

        {/* Score ring */}
        <div className={`sm-quiz-result`}>
          <div className={`sm-result-score-ring${passed ? "" : " sm-fail"}`}>
            <span className="sm-result-score-big">{score}/{questions.length}</span>
            <span className="sm-result-score-label">{pct}%</span>
          </div>
          <h3 className="sm-result-title">
            {passed ? "Well done!" : "Keep Practising"}
          </h3>
          <p className="sm-result-msg">
            {passed
              ? "You passed this module quiz. Your score has been recorded."
              : "You need 60% to pass. Review the topics and try again."}
          </p>
          <div className="sm-result-actions">
            <button className="sm-btn-retry" onClick={handleRetry}>
              <RotateCcw size={14} style={{ display: "inline", marginRight: 6 }} />
              Retry Quiz
            </button>
          </div>
        </div>

        {/* Review answers */}
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
                        <span className="sm-quiz-option-letter">{LETTERS[oi]}</span>
                        {opt}
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
    );
  }

  return (
    <div className="sm-quiz-panel">
      <div className="sm-quiz-header">
        <h2 className="sm-quiz-title">{module.title} — Quiz</h2>
        <p className="sm-quiz-subtitle">
          Answer all {questions.length} questions then submit.
          {bestScore !== null && (
            <span style={{ marginLeft: 10, color: "#22c55e", fontWeight: 600 }}>
              Best score: {bestScore}/{questions.length}
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
                <span className="sm-quiz-option-letter">{LETTERS[oi]}</span>
                {opt}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        className="sm-quiz-submit"
        onClick={handleSubmit}
        disabled={!allAnswered}
      >
        <Send size={16} />
        Submit Quiz
      </button>
    </div>
  );
};

// ── Topic content component ───────────────────────────────────────────────────
const TopicContent = ({ topic, module, isCompleted, onMarkComplete }) => (
  <div className="sm-topic-content">
    <div className="sm-topic-breadcrumb">
      <span>{module.title.split(":")[0]}</span>
      <ChevronRight size={12} />
      {topic.title}
    </div>
    <h1 className="sm-topic-title">{topic.title}</h1>
    <div className="sm-topic-meta">
      <span className="sm-topic-meta-badge">
        <BookOpen size={12} />
        Reading Material
      </span>
      {isCompleted && (
        <span className="sm-topic-meta-badge" style={{ background: "#dcfce7", color: "#166534" }}>
          <CheckCircle size={12} />
          Completed
        </span>
      )}
    </div>
    <div className="sm-topic-body">{topic.content}</div>
    {!isCompleted ? (
      <button className="sm-complete-btn" onClick={() => onMarkComplete(topic.id)}>
        <CheckSquare size={16} />
        Mark as Complete
      </button>
    ) : (
      <button className="sm-complete-btn sm-done" disabled>
        <CheckCircle size={16} />
        Completed
      </button>
    )}
  </div>
);

// ── Main StudyMaterials page ──────────────────────────────────────────────────
const StudyMaterials = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState({ completed_topic_ids: [], quiz_attempts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Which module accordion is open (by module id)
  const [openModules, setOpenModules] = useState({});
  // What's selected: { type: "topic"|"quiz", moduleId, topicId? }
  const [selected, setSelected] = useState(null);

  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const [modsRes, progRes] = await Promise.all([
        fetch(`${API}/study/modules`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/study/my-progress`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (modsRes.status === 401 || progRes.status === 401) {
        navigate("/login");
        return;
      }

      if (!modsRes.ok) {
        setError(`Server error: ${modsRes.status}. Make sure the backend server is running and restart it to load new routes.`);
        return;
      }

      const mods = await modsRes.json();
      const prog = progRes.ok ? await progRes.json() : { completed_topic_ids: [], quiz_attempts: [] };
      setModules(Array.isArray(mods) ? mods : []);
      setProgress(prog);

      // Auto-open first module
      if (mods.length > 0) {
        setOpenModules({ [mods[0].id]: true });
      }
    } catch {
      setError("Failed to load study materials. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleModule = (moduleId) => {
    setOpenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const selectTopic = (moduleId, topicId) => {
    setSelected({ type: "topic", moduleId, topicId });
  };

  const selectQuiz = (moduleId) => {
    setSelected({ type: "quiz", moduleId });
  };

  const handleMarkComplete = async (topicId) => {
    try {
      await fetch(`${API}/study/progress`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic_id: topicId }),
      });
      setProgress((prev) => ({
        ...prev,
        completed_topic_ids: [...new Set([...prev.completed_topic_ids, topicId])],
      }));
    } catch {
      // silently fail
    }
  };

  const handleQuizSubmit = async (moduleId, score, total) => {
    try {
      await fetch(`${API}/study/quiz`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ module_id: moduleId, score, total }),
      });
      setProgress((prev) => ({
        ...prev,
        quiz_attempts: [
          { module_id: moduleId, score, total, attempted_at: new Date().toISOString() },
          ...prev.quiz_attempts,
        ],
      }));
    } catch {
      // silently fail
    }
  };

  // Compute total progress
  const totalTopics = modules.reduce((s, m) => s + m.topics.length, 0);
  const doneTopics = progress.completed_topic_ids.length;
  const overallPct = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;

  // Get best quiz score for a module
  const getBestScore = (moduleId) => {
    const attempts = progress.quiz_attempts.filter((a) => a.module_id === moduleId);
    if (!attempts.length) return null;
    return Math.max(...attempts.map((a) => a.score));
  };

  // Module completion pct
  const getModulePct = (mod) => {
    if (!mod.topics.length) return 0;
    const done = mod.topics.filter((t) => progress.completed_topic_ids.includes(t.id)).length;
    return Math.round((done / mod.topics.length) * 100);
  };

  if (loading) {
    return (
      <div className="sm-loading">
        <Anchor size={22} style={{ opacity: 0.5 }} />
        Loading study materials…
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

  // Resolve selected content
  const selectedModule = selected ? modules.find((m) => m.id === selected.moduleId) : null;
  const selectedTopic =
    selected?.type === "topic" && selectedModule
      ? selectedModule.topics.find((t) => t.id === selected.topicId)
      : null;

  return (
    <div className="sm-page">
      {/* ── Left navigator sidebar (module/topic list) ─────────────────────── */}
      <aside className="sm-sidebar">
        <div className="sm-sidebar-header">
          <h2 className="sm-sidebar-title">
            <FileText size={18} />
            Study Materials
          </h2>
          <p className="sm-sidebar-sub">Maritime Cybersecurity Training</p>
        </div>

        <div className="sm-module-list">
          {modules.map((mod, mIdx) => {
            const isOpen = !!openModules[mod.id];
            const pct = getModulePct(mod);
            const bestScore = getBestScore(mod.id);

            return (
              <div key={mod.id} className="sm-module-item">
                {/* Module header */}
                <button
                  className={`sm-module-header${selected?.moduleId === mod.id ? " sm-active" : ""}`}
                  onClick={() => toggleModule(mod.id)}
                >
                  <span className="sm-module-num">{mIdx + 1}</span>
                  <span className="sm-module-header-info">
                    <span className="sm-module-header-title">
                      {mod.title.replace(/^Module \d+:\s*/, "")}
                    </span>
                    <div className="sm-module-progress-bar">
                      <div className="sm-module-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </span>
                  <ChevronRight
                    size={14}
                    className={`sm-module-chevron${isOpen ? " sm-open" : ""}`}
                  />
                </button>

                {/* Topics + quiz */}
                {isOpen && (
                  <div className="sm-topic-list">
                    {mod.topics.map((topic) => {
                      const done = progress.completed_topic_ids.includes(topic.id);
                      const isActive =
                        selected?.type === "topic" && selected.topicId === topic.id;
                      return (
                        <div
                          key={topic.id}
                          className={`sm-topic-row${isActive ? " sm-topic-active" : ""}${done ? " sm-topic-done" : ""}`}
                          onClick={() => selectTopic(mod.id, topic.id)}
                        >
                          {done ? (
                            <CheckCircle size={15} className="sm-topic-icon" />
                          ) : (
                            <Circle size={15} className="sm-topic-icon" />
                          )}
                          <span className="sm-topic-label">{topic.title}</span>
                          {done && <CheckCircle size={12} className="sm-topic-check" />}
                        </div>
                      );
                    })}

                    {/* Quiz row */}
                    {mod.quiz_questions.length > 0 && (
                      <div
                        className={`sm-quiz-row${selected?.type === "quiz" && selected.moduleId === mod.id ? " sm-topic-active" : ""}`}
                        onClick={() => selectQuiz(mod.id)}
                      >
                        <HelpCircle size={15} className="sm-quiz-icon" />
                        <span className="sm-quiz-label">Module Quiz</span>
                        {bestScore !== null ? (
                          <span className="sm-quiz-badge sm-quiz-passed">
                            {bestScore}/{mod.quiz_questions.length}
                          </span>
                        ) : (
                          <span className="sm-quiz-badge">
                            {mod.quiz_questions.length}Q
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Right content area ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Progress bar top strip */}
        <div className="sm-progress-bar-top">
          <Trophy size={15} color="#f59e0b" />
          <strong>{doneTopics}</strong> of <strong>{totalTopics}</strong> topics completed
          <div className="sm-progress-track">
            <div className="sm-progress-fill" style={{ width: `${overallPct}%` }} />
          </div>
          <span>{overallPct}%</span>
        </div>

        {/* Content */}
        <div className="sm-content">
          {!selected && (
            <div className="sm-content-empty">
              <BookOpen size={56} />
              <h3>Select a topic to begin</h3>
              <p>Choose any topic or module quiz from the left panel to start learning.</p>
            </div>
          )}

          {selected?.type === "topic" && selectedTopic && selectedModule && (
            <TopicContent
              topic={selectedTopic}
              module={selectedModule}
              isCompleted={progress.completed_topic_ids.includes(selectedTopic.id)}
              onMarkComplete={handleMarkComplete}
            />
          )}

          {selected?.type === "quiz" && selectedModule && (
            <QuizPanel
              key={`quiz-${selectedModule.id}-${JSON.stringify(progress.quiz_attempts.filter(a=>a.module_id===selectedModule.id).length)}`}
              module={selectedModule}
              onQuizSubmit={handleQuizSubmit}
              bestScore={getBestScore(selectedModule.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyMaterials;
