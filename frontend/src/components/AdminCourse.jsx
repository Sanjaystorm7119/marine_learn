import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Edit, Trash2, Eye, BookOpen, Clock,
  ChevronDown, ChevronUp, CheckCircle, XCircle,
  BarChart3, FileText, HelpCircle,
  ArrowLeft, GripVertical, Save, Video, X
} from "lucide-react";
// import { coursesByDepartment } from "./courseData"; // removed: courses now come from API
import { toast } from "sonner";

import "../pages/AdminCourse.css";

const API = "http://127.0.0.1:8000";

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

function mapApiCourse(c) {
  return {
    id: c.id,
    title: c.title,
    icon: c.icon || "📘",
    description: c.description || "",
    totalDuration: c.total_duration || "",
    chapters: (c.modules || []).map((mod, i) => ({
      id: mod.id,
      title: mod.title,
      isExpanded: i === 0,
      lessons: (mod.topics || []).map(t => ({
        id: t.id,
        title: t.title,
        duration: t.duration || "15min",
        videoUrl: t.video_url || "",
        content: t.content || "",
        topics: [],
      })),
    })),
    quizPool: (c.quiz_questions || []).map(q => ({
      id: q.id,
      question: q.question,
      options: q.options || ["", "", "", ""],
      correctIndex: q.correct_answer,
    })),
  };
}

function buildSavePayload({ title, icon, description, totalDuration, modules, quizQuestions }) {
  return {
    title,
    icon,
    description,
    total_duration: totalDuration,
    order_num: 0,
    modules: modules.map((mod, i) => ({
      id: typeof mod.id === "number" ? mod.id : null,
      title: mod.title,
      description: null,
      order_num: i,
      lessons: mod.lessons.map((l, j) => ({
        id: typeof l.id === "number" ? l.id : null,
        title: l.title,
        content: l.content || "",
        duration: l.duration || "15min",
        video_url: l.videoUrl || "",
        order_num: j,
      })),
    })),
    quiz_questions: quizQuestions.map((q, k) => ({
      id: typeof q.id === "number" ? q.id : null,
      question: q.question,
      options: q.options,
      correct_answer: q.correctIndex,
      explanation: null,
      order_num: k,
    })),
  };
}

/* ─────────────────────────────────────────────
   COURSE MANAGEMENT
───────────────────────────────────────────── */
export const CourseManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/admin/courses`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setAllCourses(data.map(mapApiCourse)))
      .catch(() => toast.error("Failed to load courses"))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() =>
    allCourses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [allCourses, searchQuery]
  );

  const totalLessons = allCourses.reduce((acc, c) => acc + c.chapters.reduce((a, ch) => a + ch.lessons.length, 0), 0);
  const totalModules = allCourses.reduce((acc, c) => acc + c.chapters.length, 0);
  const totalQuizzes = allCourses.reduce((acc, c) => acc + c.quizPool.length, 0);

  const toggleModuleExpand = (id) =>
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));

  const handleDelete = async (courseId) => {
    if (!window.confirm("Delete this course? This cannot be undone.")) return;
    const res = await fetch(`${API}/admin/courses/${courseId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.ok) {
      setAllCourses(prev => prev.filter(c => c.id !== courseId));
      setSelectedCourse(null);
      toast.success("Course deleted");
    } else {
      toast.error("Failed to delete course");
    }
  };

  const stats = [
    { label: "Total Courses",   value: allCourses.length, Icon: BookOpen,   colorClass: "stat-blue"   },
    { label: "Total Modules",   value: totalModules,       Icon: BarChart3,  colorClass: "stat-green"  },
    { label: "Total Lessons",   value: totalLessons,       Icon: FileText,   colorClass: "stat-amber"  },
    { label: "Quiz Questions",  value: totalQuizzes,       Icon: HelpCircle, colorClass: "stat-violet" },
  ];

  if (loading) return <div className="ac-page"><p style={{ padding: "2rem" }}>Loading courses…</p></div>;

  return (
    <div className="ac-page">
      {/* Header */}
      <div className="ac-header-row">
        <div>
          <h1 className="ac-page-title">Course Management</h1>
          <p className="ac-breadcrumb">
            <span className="ac-breadcrumb-link" onClick={() => navigate("/admin")}>Home</span>
            {" / "}
            <span>Course Management</span>
          </p>
        </div>
        <button className="ac-btn ac-btn-primary" onClick={() => navigate("/admin/courses/new")}>
          <Plus size={16} /> Add New Course
        </button>
      </div>

      {/* Stats */}
      <div className="ac-stats-grid">
        {stats.map(({ label, value, Icon, colorClass }) => (
          <div key={label} className="ac-card ac-stat-card">
            <div className={`ac-stat-icon ${colorClass}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="ac-stat-label">{label}</p>
              <p className="ac-stat-value">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & View Toggle */}
      <div className="ac-card ac-search-bar">
        <div className="ac-search-inner">
          <div className="ac-search-input-wrap">
            <Search size={16} className="ac-search-icon" />
            <input
              className="ac-input ac-search-input"
              placeholder="Search courses by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="ac-view-toggle">
            <button
              onClick={() => setViewMode("table")}
              className={`ac-toggle-btn ${viewMode === "table" ? "active" : ""}`}
            >Table</button>
            <button
              onClick={() => setViewMode("grid")}
              className={`ac-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
            >Grid</button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" ? (
        <div className="ac-card ac-table-wrap">
          <div className="ac-table-scroll">
            <table className="ac-table">
              <thead>
                <tr className="ac-thead-row">
                  <th className="ac-th">Course</th>
                  <th className="ac-th">Modules</th>
                  <th className="ac-th">Lessons</th>
                  <th className="ac-th">Quiz</th>
                  <th className="ac-th">Duration</th>
                  <th className="ac-th">Status</th>
                  <th className="ac-th ac-th-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map(course => {
                  const lessonCount = course.chapters.reduce((a, ch) => a + ch.lessons.length, 0);
                  return (
                    <tr key={course.id} className="ac-tbody-row">
                      <td className="ac-td">
                        <div className="ac-course-cell">
                          <span className="ac-course-icon">{course.icon}</span>
                          <div>
                            <p className="ac-course-title">{course.title}</p>
                            <p className="ac-course-desc">{course.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="ac-td ac-td-muted">{course.chapters.length}</td>
                      <td className="ac-td ac-td-muted">{lessonCount}</td>
                      <td className="ac-td ac-td-muted">{course.quizPool.length} Q</td>
                      <td className="ac-td ac-td-muted">{course.totalDuration}</td>
                      <td className="ac-td">
                        <div className="ac-status-badge">
                          <CheckCircle size={14} className="ac-check-icon" />
                          <span className="ac-published">Published</span>
                        </div>
                      </td>
                      <td className="ac-td">
                        <div className="ac-actions">
                          <button className="ac-icon-btn" onClick={() => setSelectedCourse(course)}>
                            <Eye size={16} />
                          </button>
                          <button className="ac-icon-btn ac-icon-btn-edit" onClick={() => navigate(`/admin/courses/edit/${course.id}`)}>
                            <Edit size={16} />
                          </button>
                          <button className="ac-icon-btn ac-icon-btn-del" onClick={() => handleDelete(course.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="ac-table-footer">
            <span className="ac-table-count">Showing {filteredCourses.length} of {allCourses.length} courses</span>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="ac-grid-view">
          {filteredCourses.map(course => {
            const lessonCount = course.chapters.reduce((a, ch) => a + ch.lessons.length, 0);
            return (
              <motion.div key={course.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="ac-card ac-grid-card ac-grid-card-group">
                  <div className="ac-grid-card-bar" />
                  <div className="ac-grid-card-body">
                    <div className="ac-grid-card-top">
                      <div className="ac-grid-card-info">
                        <span className="ac-grid-course-icon">{course.icon}</span>
                        <div>
                          <h3 className="ac-grid-course-title">{course.title}</h3>
                          <p className="ac-grid-course-meta">{course.chapters.length} modules · {lessonCount} lessons</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
                        className="ac-icon-btn ac-grid-edit-btn"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                    <p className="ac-grid-course-desc">{course.description}</p>
                    <div className="ac-grid-course-stats">
                      <span className="ac-grid-stat"><BookOpen size={14} /> {course.chapters.length} modules</span>
                      <span className="ac-grid-stat"><Clock size={14} /> {course.totalDuration}</span>
                    </div>
                    <div className="ac-grid-card-footer">
                      <div className="ac-status-badge">
                        <CheckCircle size={14} className="ac-check-icon" />
                        <span className="ac-published">Published</span>
                      </div>
                      <span className="ac-grid-quiz-count">{course.quizPool.length} quiz Q</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Course Detail Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="ac-modal-backdrop"
            onClick={() => { setSelectedCourse(null); setExpandedModules({}); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="ac-modal"
            >
              <div className="ac-modal-bar" />
              <div className="ac-modal-body">
                {/* Modal Header */}
                <div className="ac-modal-header">
                  <div className="ac-modal-title-row">
                    <span className="ac-modal-course-icon">{selectedCourse.icon}</span>
                    <div>
                      <h2 className="ac-modal-course-title">{selectedCourse.title}</h2>
                      <p className="ac-modal-course-duration">{selectedCourse.totalDuration}</p>
                    </div>
                  </div>
                  <button
                    className="ac-icon-btn"
                    onClick={() => { setSelectedCourse(null); setExpandedModules({}); }}
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                <p className="ac-modal-desc">{selectedCourse.description}</p>

                {/* Stats */}
                <div className="ac-modal-stats">
                  {[
                    { label: "Modules",        value: selectedCourse.chapters.length },
                    { label: "Lessons",        value: selectedCourse.chapters.reduce((a, ch) => a + ch.lessons.length, 0) },
                    { label: "Quiz Questions", value: selectedCourse.quizPool.length },
                  ].map(s => (
                    <div key={s.label} className="ac-modal-stat-box">
                      <p className="ac-modal-stat-value">{s.value}</p>
                      <p className="ac-modal-stat-label">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Module Structure */}
                <div className="ac-modal-modules">
                  <h3 className="ac-modal-section-title">Module Structure</h3>
                  {selectedCourse.chapters.map((chapter, i) => (
                    <div key={chapter.id} className="ac-module-item">
                      <button
                        onClick={() => toggleModuleExpand(chapter.id)}
                        className="ac-module-header"
                      >
                        <div className="ac-module-num">{i + 1}</div>
                        <div className="ac-module-info">
                          <p className="ac-module-title">{chapter.title}</p>
                          <p className="ac-module-lesson-count">{chapter.lessons.length} lessons</p>
                        </div>
                        {expandedModules[chapter.id]
                          ? <ChevronUp size={16} className="ac-chevron" />
                          : <ChevronDown size={16} className="ac-chevron" />}
                      </button>
                      <AnimatePresence>
                        {expandedModules[chapter.id] && (
                          <motion.div
                            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                            className="ac-module-lessons-wrap"
                          >
                            <div className="ac-module-lessons">
                              {chapter.lessons.map(lesson => (
                                <div key={lesson.id} className="ac-lesson-row">
                                  <span className="ac-lesson-title">
                                    <FileText size={14} className="ac-lesson-icon" />
                                    {lesson.title}
                                  </span>
                                  <span className="ac-lesson-duration">{lesson.duration}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Modal Actions */}
                <div className="ac-modal-actions">
                  <button
                    className="ac-btn ac-btn-primary ac-btn-flex"
                    onClick={() => { setSelectedCourse(null); navigate(`/admin/courses/edit/${selectedCourse.id}`); }}
                  >
                    <Edit size={16} /> Edit Course
                  </button>
                  <button className="ac-btn ac-btn-danger" onClick={() => handleDelete(selectedCourse.id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


/* ─────────────────────────────────────────────
   COURSE FORM  (Add / Edit)
───────────────────────────────────────────── */
export const CourseForm = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const isEditing = !!courseId;

  // Removed: const existingCourse = isEditing
  //   ? Object.values(coursesByDepartment).flat().find(c => c.id === courseId)
  //   : null;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving]   = useState(false);

  const [title, setTitle]               = useState("");
  const [icon, setIcon]                 = useState("📘");
  const [description, setDescription]  = useState("");
  const [totalDuration, setTotalDuration] = useState("");
  const [activeTab, setActiveTab]       = useState("details");
  const [modules, setModules]           = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);

  useEffect(() => {
    if (!isEditing) return;
    fetch(`${API}/admin/courses/${courseId}`, { headers: authHeaders() })
      .then(r => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(data => {
        const mapped = mapApiCourse(data);
        setTitle(mapped.title);
        setIcon(mapped.icon);
        setDescription(mapped.description);
        setTotalDuration(mapped.totalDuration);
        setModules(mapped.chapters);
        setQuizQuestions(mapped.quizPool);
      })
      .catch(() => toast.error("Failed to load course"))
      .finally(() => setLoading(false));
  }, [courseId, isEditing]);

  /* ── module helpers ── */
  const addModule = () =>
    setModules(prev => [...prev, { id: `mod-${Date.now()}`, title: `Module ${prev.length + 1}`, lessons: [], isExpanded: true }]);

  const removeModule = idx =>
    setModules(prev => prev.filter((_, i) => i !== idx));

  const toggleModule = idx =>
    setModules(prev => prev.map((m, i) => i === idx ? { ...m, isExpanded: !m.isExpanded } : m));

  const updateModuleTitle = (idx, val) =>
    setModules(prev => prev.map((m, i) => i === idx ? { ...m, title: val } : m));

  /* ── lesson helpers ── */
  const addLesson = modIdx =>
    setModules(prev => prev.map((m, i) => i === modIdx
      ? { ...m, lessons: [...m.lessons, { id: `lesson-${Date.now()}`, title: "", duration: "15min", videoUrl: "", topics: [], content: "" }] }
      : m));

  const removeLesson = (modIdx, lesIdx) =>
    setModules(prev => prev.map((m, i) => i === modIdx
      ? { ...m, lessons: m.lessons.filter((_, li) => li !== lesIdx) }
      : m));

  const updateLesson = (modIdx, lesIdx, field, val) =>
    setModules(prev => prev.map((m, i) => i === modIdx
      ? { ...m, lessons: m.lessons.map((l, li) => li === lesIdx ? { ...l, [field]: val } : l) }
      : m));

  /* ── quiz helpers ── */
  const addQuiz = () =>
    setQuizQuestions(prev => [...prev, { id: `q-${Date.now()}`, question: "", options: ["", "", "", ""], correctIndex: 0 }]);

  const removeQuiz = idx =>
    setQuizQuestions(prev => prev.filter((_, i) => i !== idx));

  const updateQuiz = (idx, field, val) =>
    setQuizQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: val } : q));

  const updateQuizOption = (qIdx, oIdx, val) =>
    setQuizQuestions(prev => prev.map((q, i) => i === qIdx
      ? { ...q, options: q.options.map((o, oi) => oi === oIdx ? val : o) }
      : q));

  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Course title is required"); return; }
    setSaving(true);
    const payload = buildSavePayload({ title, icon, description, totalDuration, modules, quizQuestions });
    try {
      const url = isEditing ? `${API}/admin/courses/${courseId}` : `${API}/admin/courses`;
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(isEditing ? "Course updated successfully!" : "Course created successfully!");
      navigate("/admin/courses");
    } catch {
      toast.error("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const tabLabel = tab =>
    tab === "details" ? "Course Details"
    : tab === "modules" ? `Modules (${modules.length})`
    : `Quiz (${quizQuestions.length})`;

  if (loading) return <div className="ac-page"><p style={{ padding: "2rem" }}>Loading course…</p></div>;

  return (
    <div className="ac-page ac-form-page">
      {/* Header */}
      <div className="ac-form-header">
        <div className="ac-form-header-left">
          <button className="ac-back-btn" onClick={() => navigate("/admin/courses")}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="ac-form-title">{isEditing ? "Edit Course" : "Add New Course"}</h1>
            <p className="ac-form-subtitle">
              {isEditing ? "Update course modules and lessons" : "Create a new course with modules and lessons"}
            </p>
          </div>
        </div>
        <button className="ac-btn ac-btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? "Saving…" : (isEditing ? "Update" : "Create") + " Course"}
        </button>
      </div>

      {/* Tabs */}
      <div className="ac-tabs">
        {["details", "modules", "quiz"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`ac-tab-btn ${activeTab === tab ? "active" : ""}`}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      {/* ── Details Tab ── */}
      {activeTab === "details" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ac-tab-content">
          <div className="ac-card ac-form-card">
            {/* Icon + Title */}
            <div className="ac-form-icon-title">
              <div>
                <label className="ac-label">Icon</label>
                <input
                  className="ac-input ac-icon-input"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  maxLength={2}
                />
              </div>
              <div className="ac-form-title-field">
                <label className="ac-label">Course Title</label>
                <input
                  className="ac-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Maritime Cybersecurity Fundamentals"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="ac-label">Description</label>
              <textarea
                className="ac-textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief course description..."
                rows={4}
              />
            </div>

            {/* Duration + Summary */}
            <div className="ac-form-two-col">
              <div>
                <label className="ac-label">Total Duration</label>
                <input
                  className="ac-input"
                  value={totalDuration}
                  onChange={e => setTotalDuration(e.target.value)}
                  placeholder="e.g. 2h 30min"
                />
              </div>
              <div>
                <label className="ac-label">Summary</label>
                <div className="ac-summary-box">
                  <span className="ac-summary-stat"><BookOpen size={14} /> {modules.length} modules</span>
                  <span className="ac-summary-stat"><FileText size={14} /> {totalLessons} lessons</span>
                  <span className="ac-summary-stat"><Clock size={14} /> {totalDuration || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Modules Tab ── */}
      {activeTab === "modules" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ac-tab-content">
          {modules.map((mod, modIdx) => (
            <div key={mod.id} className="ac-card ac-module-card">
              {/* Module Header Row */}
              <div className="ac-module-row" onClick={() => toggleModule(modIdx)}>
                <GripVertical size={16} className="ac-grip" />
                <div className="ac-module-badge">{modIdx + 1}</div>
                <input
                  className="ac-input ac-module-title-input"
                  value={mod.title}
                  onChange={e => { e.stopPropagation(); updateModuleTitle(modIdx, e.target.value); }}
                  onClick={e => e.stopPropagation()}
                  placeholder="Module title..."
                />
                <span className="ac-module-count">{mod.lessons.length} lessons</span>
                <button
                  className="ac-icon-btn ac-icon-btn-del"
                  onClick={e => { e.stopPropagation(); removeModule(modIdx); }}
                >
                  <Trash2 size={16} />
                </button>
                {mod.isExpanded
                  ? <ChevronUp size={16} className="ac-chevron" />
                  : <ChevronDown size={16} className="ac-chevron" />}
              </div>

              {/* Lessons */}
              <AnimatePresence>
                {mod.isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ac-lessons-wrap"
                  >
                    <div className="ac-lessons-inner">
                      {mod.lessons.map((lesson, lesIdx) => (
                        <div key={lesson.id} className="ac-lesson-card">
                          <div className="ac-lesson-top">
                            <Video size={16} className="ac-video-icon" />
                            <input
                              className="ac-input ac-lesson-title-input"
                              value={lesson.title}
                              onChange={e => updateLesson(modIdx, lesIdx, "title", e.target.value)}
                              placeholder="Lesson title..."
                            />
                            <input
                              className="ac-input ac-duration-input"
                              value={lesson.duration}
                              onChange={e => updateLesson(modIdx, lesIdx, "duration", e.target.value)}
                              placeholder="15min"
                            />
                            <button
                              className="ac-icon-btn ac-icon-btn-del"
                              onClick={() => removeLesson(modIdx, lesIdx)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <input
                            className="ac-input ac-url-input"
                            value={lesson.videoUrl}
                            onChange={e => updateLesson(modIdx, lesIdx, "videoUrl", e.target.value)}
                            placeholder="Video URL (YouTube embed link)..."
                          />
                          <textarea
                            className="ac-input ac-url-input"
                            value={lesson.content || ""}
                            onChange={e => updateLesson(modIdx, lesIdx, "content", e.target.value)}
                            placeholder="Lesson content / reading material..."
                            rows={5}
                            style={{ resize: "vertical", marginTop: "0.5rem", lineHeight: "1.6" }}
                          />
                        </div>
                      ))}
                      <button
                        className="ac-btn ac-btn-dashed ac-btn-full"
                        onClick={() => addLesson(modIdx)}
                      >
                        <Plus size={14} /> Add Lesson
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <button className="ac-btn ac-btn-dashed ac-btn-full ac-btn-lg" onClick={addModule}>
            <Plus size={20} /> Add Module
          </button>
        </motion.div>
      )}

      {/* ── Quiz Tab ── */}
      {activeTab === "quiz" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ac-tab-content">
          {quizQuestions.map((q, qIdx) => (
            <div key={q.id} className="ac-card ac-quiz-card">
              <div className="ac-quiz-inner">
                <span className="ac-quiz-num">{qIdx + 1}</span>
                <div className="ac-quiz-body">
                  <input
                    className="ac-input"
                    value={q.question}
                    onChange={e => updateQuiz(qIdx, "question", e.target.value)}
                    placeholder="Enter question..."
                  />
                  <div className="ac-options-grid">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="ac-option-row">
                        <button
                          onClick={() => updateQuiz(qIdx, "correctIndex", oIdx)}
                          className={`ac-radio-btn ${q.correctIndex === oIdx ? "correct" : ""}`}
                        >
                          {q.correctIndex === oIdx && <div className="ac-radio-dot" />}
                        </button>
                        <input
                          className="ac-input ac-option-input"
                          value={opt}
                          onChange={e => updateQuizOption(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${oIdx + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  className="ac-icon-btn ac-icon-btn-del ac-quiz-del"
                  onClick={() => removeQuiz(qIdx)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <button className="ac-btn ac-btn-dashed ac-btn-full ac-btn-lg" onClick={addQuiz}>
            <Plus size={20} /> Add Quiz Question
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default CourseManagement;
