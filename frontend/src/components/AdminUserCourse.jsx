import { useState, useMemo, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bell,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Send,
  Award,
  TrendingUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Percent,
  Target,
  Flame,
  Plus,
  X,
} from "lucide-react";
import "../pages/AdminUserCourse.css";

// ─── GlassCard ───
const GlassCard = ({ children, className = "" }) => (
  <div className={`glass-card ${className}`}>{children}</div>
);

// ─── Toast ───
let _toastCallback = null;
export function useToast() {
  return {
    toast: ({ title, description }) => {
      if (_toastCallback) _toastCallback({ title, description });
    },
  };
}

const ITEMS_PER_PAGE = 8;

// ─── Main Component ───
// ─── Main Component ───
const AdminUserCourse = () => {
  const [users, setUsers] = useState([]);
  const [coursePool, setCoursePool] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toasts, setToasts] = useState([]);
  _toastCallback = ({ title, description }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  };

  const [activeTab, setActiveTab] = useState("officer");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedUser, setExpandedUser] = useState(null);
  const [page, setPage] = useState(1);
  const [selectOpen, setSelectOpen] = useState(false);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState("all");
  const [selectedUsersForAssign, setSelectedUsersForAssign] = useState([]);
  const [selectedCoursesForAssign, setSelectedCoursesForAssign] = useState([]);
  const [assignUserSearch, setAssignUserSearch] = useState("");
  const [assignTargetSelectOpen, setAssignTargetSelectOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("access_token") || localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [userRes, courseRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/admin/user-courses", { headers }),
        fetch("http://127.0.0.1:8000/study/courses", { headers }),
      ]);

      if (userRes.ok) {
        setUsers(await userRes.json());
      } else {
        console.error("User fetch failed:", await userRes.text());
        setUsers([]);
      }

      if (courseRes.ok) {
        setCoursePool(await courseRes.json());
      } else {
        console.error("Course fetch failed:", await courseRes.text());
        setCoursePool([]);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
      setCoursePool([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignCourses = async () => {
    if (
      selectedUsersForAssign.length === 0 ||
      selectedCoursesForAssign.length === 0
    )
      return;

    try {
      const token =
        localStorage.getItem("access_token") || localStorage.getItem("token");

      // Expand selected course IDs → module IDs using coursePool
      const moduleIds = selectedCoursesForAssign.flatMap((cid) => {
        const course = coursePool.find((c) => c.id === cid);
        return course?.modules?.map((m) => m.id) ?? [];
      });

      const payload = {
        user_ids: selectedUsersForAssign
          .map(Number)
          .filter((n) => Number.isInteger(n) && n > 0),
        module_ids: moduleIds.filter((n) => Number.isInteger(n) && n > 0),
      };
      console.log("Assign payload →", JSON.stringify(payload));

      const response = await fetch(
        "http://127.0.0.1:8000/admin/assign-courses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        const result = await response.json();
        const skipped = result.skipped_courses;
        _toastCallback &&
          _toastCallback({
            title: "Courses Assigned",
            description: skipped?.length
              ? `Assigned ${result.assigned_count} modules. Skipped (no modules): ${skipped.join(", ")}`
              : `Successfully assigned ${result.assigned_count} modules to selected users.`,
          });
        setAssignDialogOpen(false);
        setSelectedUsersForAssign([]);
        setSelectedCoursesForAssign([]);
        setAssignUserSearch("");
        fetchData();
      } else {
        const err = await response.json().catch(() => ({}));
        console.error(
          "Assign 422 full detail:",
          JSON.stringify(err.detail, null, 2),
        );
        // Pydantic v2 returns detail as an array of {type, loc, msg, input}
        const detail = Array.isArray(err.detail)
          ? err.detail
              .map((e) => `${e.loc?.slice(-1)[0] ?? "field"}: ${e.msg}`)
              .join("; ")
          : typeof err.detail === "string"
            ? err.detail
            : `Server error ${response.status}`;
        _toastCallback &&
          _toastCallback({
            title: "Assignment Failed",
            description: detail,
          });
      }
    } catch (error) {
      console.error("Failed to assign courses", error);
      _toastCallback &&
        _toastCallback({
          title: "Assignment Failed",
          description: "Network error — could not reach the server.",
        });
    }
  };

  const availableCoursesForAssign = useMemo(() => {
    if (selectedUsersForAssign.length === 0) return coursePool;
    return coursePool.filter((course) =>
      selectedUsersForAssign.some((uid) => {
        const user = users.find((u) => u.id === uid);
        const assignedModuleIds = new Set(
          user?.courses.map((uc) => uc.courseId) ?? [],
        );
        const courseModuleIds = course.modules?.map((m) => m.id) ?? [];
        // course is available if at least one of its modules isn't yet assigned
        return courseModuleIds.some((mid) => !assignedModuleIds.has(mid));
      }),
    );
  }, [selectedUsersForAssign, users, coursePool]);

  const filteredAssignUsers = useMemo(() => {
    let list = users;
    if (assignTarget === "officer")
      list = list.filter((u) => u.role === "officer");
    else if (assignTarget === "crew")
      list = list.filter((u) => u.role === "crew");
    if (assignUserSearch) {
      const q = assignUserSearch.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, assignTarget, assignUserSearch]);

  const openAssignForUser = (userId) => {
    setSelectedUsersForAssign([userId]);
    setAssignTarget("all");
    setSelectedCoursesForAssign([]);
    setAssignUserSearch("");
    setAssignDialogOpen(true);
  };

  const filtered = useMemo(() => {
    return users
      .filter((u) => u.role === activeTab)
      .filter((u) => {
        if (search) {
          const q = search.toLowerCase();
          return (
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.rank || "").toLowerCase().includes(q)
          );
        }
        return true;
      })
      .filter((u) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "completed") return u.overallProgress === 100;
        if (statusFilter === "in-progress")
          return u.overallProgress > 0 && u.overallProgress < 100;
        if (statusFilter === "not-started") return u.overallProgress === 0;
        if (statusFilter === "low-progress")
          return u.overallProgress > 0 && u.overallProgress < 30;
        return true;
      });
  }, [users, activeTab, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const stats = useMemo(() => {
    const roleUsers = users.filter((u) => u.role === activeTab);
    const total = roleUsers.length;
    const completed = roleUsers.filter((u) => u.overallProgress === 100).length;
    const avgProgress = total
      ? Math.round(roleUsers.reduce((a, u) => a + u.overallProgress, 0) / total)
      : 0;
    const pending = roleUsers.filter(
      (u) => u.overallProgress > 0 && u.overallProgress < 100,
    ).length;
    const scores = roleUsers.flatMap((u) =>
      u.courses.filter((c) => c.quizScore !== null).map((c) => c.quizScore),
    );
    const avgQuiz = scores.length
      ? Math.round(scores.reduce((a, s) => a + s, 0) / scores.length)
      : 0;
    return { total, completed, avgProgress, pending, avgQuiz };
  }, [users, activeTab]);

  const handlePushNotification = (user) => {
    _toastCallback &&
      _toastCallback({
        title: "Notification Sent",
        description: `Reminder pushed to ${user.name} for pending courses.`,
      });
  };

  const handleBulkNotify = () => {
    const pending = filtered.filter((u) => u.overallProgress < 100);
    _toastCallback &&
      _toastCallback({
        title: "Bulk Notification Sent",
        description: `Reminders pushed to ${pending.length} ${activeTab}s with pending courses.`,
      });
  };

  const statusBadge = (status) => {
    const map = {
      completed: "badge-completed",
      "in-progress": "badge-inprogress",
      "not-started": "badge-notstarted",
    };
    const label =
      status === "in-progress"
        ? "In Progress"
        : status === "completed"
          ? "Completed"
          : "Not Started";
    return <span className={`status-badge ${map[status]}`}>{label}</span>;
  };

  const quizBadge = (score) => {
    if (score === null) return <span className="quiz-na">—</span>;
    return (
      <span className={`quiz-score ${score >= 70 ? "quiz-pass" : "quiz-fail"}`}>
        {score}%
      </span>
    );
  };

  const statusFilterOptions = [
    { value: "all", label: "All Status" },
    { value: "completed", label: "Completed" },
    { value: "in-progress", label: "In Progress" },
    { value: "not-started", label: "Not Started" },
    { value: "low-progress", label: "Low Progress (<30%)" },
  ];

  const officerCount = users.filter((u) => u.role === "officer").length;
  const crewCount = users.filter((u) => u.role === "crew").length;

  const statCards = [
    {
      label: "Total",
      value: stats.total,
      Icon: Users,
      colorClass: "stat-cyan",
    },
    {
      label: "Completed All",
      value: stats.completed,
      Icon: CheckCircle2,
      colorClass: "stat-emerald",
    },
    {
      label: "In Progress",
      value: stats.pending,
      Icon: Clock,
      colorClass: "stat-amber",
    },
    {
      label: "Avg Progress",
      value: `${stats.avgProgress}%`,
      Icon: TrendingUp,
      colorClass: "stat-purple",
    },
    {
      label: "Avg Quiz Score",
      value: `${stats.avgQuiz}%`,
      Icon: Target,
      colorClass: "stat-pink",
    },
  ];

  return (
    <div className="ucm-root">
      {/* Toast Container */}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className="toast"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
            >
              <p className="toast-title">{t.title}</p>
              <p className="toast-desc">{t.description}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="ucm-inner"
      >
        {/* Header */}
        <div className="ucm-header">
          <div>
            <h1 className="ucm-title">User Course Management</h1>
            <p className="ucm-subtitle">
              Track learner progress, assign courses, quiz scores &amp; send
              reminders
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn-assign-course"
              onClick={() => {
                setSelectedUsersForAssign([]);
                setSelectedCoursesForAssign([]);
                setAssignUserSearch("");
                setAssignTarget("all");
                setAssignDialogOpen(true);
              }}
            >
              <Plus className="icon-sm" />
              Assign Course
            </button>
            <button className="btn-bulk-notify" onClick={handleBulkNotify}>
              <Bell className="icon-sm" />
              Notify All Pending
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-list">
          <button
            className={`tab-trigger ${activeTab === "officer" ? "tab-active" : ""}`}
            onClick={() => {
              setActiveTab("officer");
              setPage(1);
            }}
          >
            <Award className="icon-sm" />
            Officers ({officerCount})
          </button>
          <button
            className={`tab-trigger ${activeTab === "crew" ? "tab-active" : ""}`}
            onClick={() => {
              setActiveTab("crew");
              setPage(1);
            }}
          >
            <Users className="icon-sm" />
            Crew ({crewCount})
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {statCards.map((s) => (
            <GlassCard key={s.label} className={`stat-card ${s.colorClass}`}>
              <div className="stat-inner">
                <div className="stat-icon-wrap">
                  <s.Icon className="icon-md" />
                </div>
                <div>
                  <p className="stat-label">{s.label}</p>
                  <p className="stat-value">{s.value}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Filters */}
        <div className="filter-row">
          <div className="search-wrap">
            <Search className="search-icon" />
            <input
              className="search-input"
              placeholder="Search by name, email or rank..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Custom Select */}
          <div className="custom-select-wrap">
            <button
              className="custom-select-trigger"
              onClick={() => setSelectOpen((v) => !v)}
            >
              <Filter className="icon-xs filter-icon-muted" />
              <span>
                {
                  statusFilterOptions.find((o) => o.value === statusFilter)
                    ?.label
                }
              </span>
              <ChevronDown
                className={`icon-xs select-chevron ${selectOpen ? "chevron-open" : ""}`}
              />
            </button>
            {selectOpen && (
              <div className="custom-select-dropdown">
                {statusFilterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`custom-select-item ${statusFilter === opt.value ? "select-item-active" : ""}`}
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setPage(1);
                      setSelectOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <UserTable
          users={paginated}
          coursePool={coursePool}
          expandedUser={expandedUser}
          setExpandedUser={setExpandedUser}
          statusBadge={statusBadge}
          quizBadge={quizBadge}
          onNotify={handlePushNotification}
          onAssign={openAssignForUser}
        />

        {/* Pagination */}
        <div className="pagination-row">
          <p className="pagination-info">
            Showing{" "}
            {filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length}
          </p>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="icon-sm" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="page-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`page-btn page-num ${page === p ? "page-active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ),
              )}
            <button
              className="page-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="icon-sm" />
            </button>
          </div>
        </div>
        {/* ── Assign Course Dialog ── */}
        {assignDialogOpen && (
          <div
            className="dialog-overlay"
            onClick={() => setAssignDialogOpen(false)}
          >
            <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
              <div className="dialog-header">
                <div>
                  <h2 className="dialog-title">Assign Courses to Users</h2>
                  <p className="dialog-desc">
                    Select users and courses to assign. Already-assigned courses
                    are skipped.
                  </p>
                </div>
                <button
                  className="dialog-close"
                  onClick={() => setAssignDialogOpen(false)}
                >
                  <X className="icon-sm" />
                </button>
              </div>

              <div className="dialog-body">
                {/* Step 1 — Users */}
                <div className="dialog-section">
                  <div className="dialog-section-header">
                    <p className="dialog-section-label">1. Select Users</p>
                    <div className="custom-select-wrap">
                      <button
                        className="custom-select-trigger dialog-select-sm"
                        onClick={() => setAssignTargetSelectOpen((v) => !v)}
                      >
                        <span>
                          {
                            {
                              all: "All Users",
                              officer: "Officers Only",
                              crew: "Crew Only",
                            }[assignTarget]
                          }
                        </span>
                        <ChevronDown
                          className={`icon-xs select-chevron ${assignTargetSelectOpen ? "chevron-open" : ""}`}
                        />
                      </button>
                      {assignTargetSelectOpen && (
                        <div className="custom-select-dropdown">
                          {[
                            { value: "all", label: "All Users" },
                            { value: "officer", label: "Officers Only" },
                            { value: "crew", label: "Crew Only" },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              className={`custom-select-item ${assignTarget === opt.value ? "select-item-active" : ""}`}
                              onClick={() => {
                                setAssignTarget(opt.value);
                                setSelectedUsersForAssign([]);
                                setAssignTargetSelectOpen(false);
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="search-wrap dialog-search">
                    <Search className="search-icon" />
                    <input
                      className="search-input"
                      placeholder="Search users..."
                      value={assignUserSearch}
                      onChange={(e) => setAssignUserSearch(e.target.value)}
                    />
                  </div>

                  <div className="assign-list">
                    {filteredAssignUsers.map((user) => (
                      <label key={user.id} className="assign-list-item">
                        <input
                          type="checkbox"
                          className="assign-checkbox"
                          checked={selectedUsersForAssign.includes(user.id)}
                          onChange={(e) => {
                            setSelectedUsersForAssign((prev) =>
                              e.target.checked
                                ? [...prev, user.id]
                                : prev.filter((id) => id !== user.id),
                            );
                          }}
                        />
                        <div className="assign-item-info">
                          <p className="assign-item-name">{user.name}</p>
                          <p className="assign-item-meta">{user.role}</p>
                        </div>
                        <span className="assign-item-count">
                          {user.courses.length} courses
                        </span>
                      </label>
                    ))}
                  </div>
                  {selectedUsersForAssign.length > 0 && (
                    <p className="assign-selected-info assign-selected-cyan">
                      {selectedUsersForAssign.length} user(s) selected
                    </p>
                  )}
                </div>

                {/* Step 2 — Courses */}
                <div className="dialog-section">
                  <p className="dialog-section-label">
                    2. Select Courses to Assign
                  </p>
                  <div className="assign-list assign-list-courses">
                    {availableCoursesForAssign.length === 0 && (
                      <p className="assign-empty-msg">
                        No courses available to assign.
                      </p>
                    )}
                    {availableCoursesForAssign.map((course) => {
                      const moduleCount = course.modules?.length ?? 0;
                      const noModules = moduleCount === 0;
                      return (
                        <label
                          key={course.id}
                          className={`assign-list-item${noModules ? " assign-item-disabled" : ""}`}
                          title={
                            noModules
                              ? "This course has no modules yet — assign modules to it first."
                              : ""
                          }
                        >
                          <input
                            type="checkbox"
                            className="assign-checkbox assign-checkbox-emerald"
                            disabled={noModules}
                            checked={selectedCoursesForAssign.includes(
                              course.id,
                            )}
                            onChange={(e) => {
                              setSelectedCoursesForAssign((prev) =>
                                e.target.checked
                                  ? [...prev, course.id]
                                  : prev.filter((c) => c !== course.id),
                              );
                            }}
                          />
                          <BookOpen className="icon-sm assign-course-icon" />
                          <span className="assign-item-name">
                            {course.title}
                          </span>
                          <span
                            className={`assign-item-count${noModules ? " assign-count-warn" : ""}`}
                          >
                            {noModules
                              ? "no modules"
                              : `${moduleCount} module${moduleCount !== 1 ? "s" : ""}`}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {selectedCoursesForAssign.length > 0 && (
                    <p className="assign-selected-info assign-selected-emerald">
                      {selectedCoursesForAssign.length} course(s) selected
                    </p>
                  )}
                </div>
              </div>

              <div className="dialog-footer">
                <button
                  className="btn-dialog-cancel"
                  onClick={() => setAssignDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-dialog-assign"
                  disabled={
                    selectedUsersForAssign.length === 0 ||
                    selectedCoursesForAssign.length === 0
                  }
                  onClick={handleAssignCourses}
                >
                  <Plus className="icon-sm" />
                  Assign{" "}
                  {selectedCoursesForAssign.length > 0
                    ? `${selectedCoursesForAssign.length} Course(s)`
                    : "Courses"}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── UserTable Sub-Component ───
const UserTable = ({
  users,
  coursePool,
  expandedUser,
  setExpandedUser,
  statusBadge,
  quizBadge,
  onNotify,
  onAssign,
}) => (
  <GlassCard className="table-card">
    <div className="table-scroll">
      <table className="ucm-table">
        <thead>
          <tr className="table-header-row">
            <th className="th">User</th>

            <th className="th">Courses</th>
            <th className="th">Progress</th>
            <th className="th">Streak</th>
            <th className="th th-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isExpanded = expandedUser === user.id;
            const completedCount = user.courses.filter(
              (c) => c.status === "completed",
            ).length;
            const pendingCount = user.courses.length - completedCount;
            return (
              <Fragment key={user.id}>
                <tr
                  className="table-row"
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                >
                  <td className="td">
                    <div className="user-cell">
                      <div className="user-avatar">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="user-name">{user.name}</p>
                        <p className="user-email">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="td">
                    <div className="courses-cell">
                      <span className="courses-completed">
                        {completedCount}
                      </span>
                      <span className="courses-sep">/</span>
                      <span className="courses-total">
                        {user.courses.length} courses
                      </span>
                      <span className="courses-pending">
                        ({user.courses.reduce((s, c) => s + c.totalModules, 0)}{" "}
                        modules)
                      </span>
                    </div>
                  </td>
                  <td className="td">
                    <div className="progress-cell">
                      <div className="progress-bar-wrap">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${user.overallProgress}%` }}
                        />
                      </div>
                      <span className="progress-label">
                        {user.overallProgress}%
                      </span>
                    </div>
                  </td>
                  <td className="td">
                    <div className="streak-cell">
                      <Flame className="icon-sm streak-icon" />
                      <span className="streak-value">{user.streak}d</span>
                    </div>
                  </td>
                  <td className="td td-right">
                    <div className="actions-cell">
                      <button
                        className="action-btn action-btn-assign"
                        title="Assign course"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssign(user.id);
                        }}
                      >
                        <Plus className="icon-sm" />
                      </button>
                      <button
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedUser(isExpanded ? null : user.id);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronUp className="icon-sm" />
                        ) : (
                          <ChevronDown className="icon-sm" />
                        )}
                      </button>
                      {pendingCount > 0 && (
                        <button
                          className="action-btn action-btn-notify"
                          title="Push reminder"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNotify(user);
                          }}
                        >
                          <Send className="icon-sm" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expanded Row */}
                <AnimatePresence>
                  {isExpanded && (
                    <tr key={`${user.id}-detail`} className="expanded-row">
                      <td colSpan={7} className="expanded-td">
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="expanded-motion"
                        >
                          <div className="expanded-content">
                            <p className="breakdown-label">Course Breakdown</p>
                            <div className="course-list">
                              {user.courses.length === 0 ? (
                                <p className="no-courses-msg">
                                  No courses assigned
                                </p>
                              ) : (
                                user.courses.map((course) => (
                                  <div
                                    key={course.courseId}
                                    className="course-block"
                                  >
                                    {/* Course name header */}
                                    <div className="course-group-header">
                                      <BookOpen className="icon-sm course-block-icon" />
                                      <span className="course-group-title">
                                        {course.courseTitle}
                                      </span>
                                      <span className="course-group-meta">
                                        {course.totalModules} module
                                        {course.totalModules !== 1 ? "s" : ""}
                                      </span>
                                    </div>

                                    {/* Module rows */}
                                    <div className="module-list">
                                      {(course.modules ?? []).map((mod) => (
                                        <div
                                          key={mod.moduleId}
                                          className="module-item"
                                        >
                                          <div className="module-connector" />
                                          <div className="course-info">
                                            <p className="module-title">
                                              {mod.moduleTitle}
                                              </p>
                                            <p className="module-meta">
                                              {mod.completedLessons}/
                                              {mod.totalLessons} lessons
                                              {mod.totalQuizQuestions > 0 && (
                                                <>
                                                  {" "}
                                                  &bull;{" "}
                                                  {mod.totalQuizQuestions} quiz
                                                  Q
                                                </>
                                              )}
                                            </p>
                                          </div>
                                          <div className="course-stats">
                                            <div className="course-progress-wrap">
                                              <div className="progress-bar-wrap progress-bar-sm">
                                                <div
                                                  className="progress-bar-fill module-progress-fill"
                                                  style={{
                                                    width: `${mod.progress}%`,
                                                  }}
                                                />
                                              </div>
                                              <span className="course-progress-label">
                                                {mod.progress}%
                                              </span>
                                            </div>
                                            {statusBadge(mod.status)}
                                            <div className="course-quiz">
                                              {quizBadge(mod.quizScore)}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </Fragment>
            );
          })}
          {users.length === 0 && (
            <tr>
              <td colSpan={7} className="empty-row">
                No users found matching your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </GlassCard>
);

export default AdminUserCourse;
