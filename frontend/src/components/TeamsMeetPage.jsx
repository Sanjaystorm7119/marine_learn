import { useState } from "react";
import { motion } from "framer-motion";
import {
  Video, Plus, Calendar, Clock, Ship, Users, Send,
  Search, Trash2, CheckCircle2, XCircle
} from "lucide-react";
import "../pages/TeamsMeetPage.css";

const vesselList = [
  "MV Ocean Star",
  "MV Sea Falcon",
  "MV Pacific Voyager",
  "MV Atlantic Guardian",
  "MV Indian Explorer",
];

const mockMeetings = [
  {
    id: "MTG001",
    title: "Safety Compliance Review",
    vessel: "MV Ocean Star",
    date: "2026-04-15",
    startTime: "10:00",
    endTime: "11:00",
    attendees: ["Capt. James", "Chief Officer Raj", "Safety Officer Lee"],
    status: "scheduled",
    meetingLink: "https://teams.microsoft.com/meet/abc123",
    agenda: "Review Q1 safety training compliance status and plan for Q2 drills.",
    createdBy: "John Doe",
  },
  {
    id: "MTG002",
    title: "VAPT Findings Discussion",
    vessel: "MV Sea Falcon",
    date: "2026-04-12",
    startTime: "14:00",
    endTime: "15:30",
    attendees: ["IT Officer Smith", "Capt. Williams", "Chief Engineer Davis"],
    status: "completed",
    meetingLink: "https://teams.microsoft.com/meet/def456",
    agenda: "Discuss latest VAPT findings and remediation plan.",
    createdBy: "John Doe",
  },
  {
    id: "MTG003",
    title: "Crew Training Schedule Planning",
    vessel: "MV Pacific Voyager",
    date: "2026-04-18",
    startTime: "09:00",
    endTime: "10:00",
    attendees: ["HR Manager Chen", "Training Officer Park"],
    status: "scheduled",
    meetingLink: "https://teams.microsoft.com/meet/ghi789",
    agenda: "Plan upcoming crew training schedule for the next quarter.",
    createdBy: "John Doe",
  },
  {
    id: "MTG004",
    title: "Engine Room Inspection Debrief",
    vessel: "MV Atlantic Guardian",
    date: "2026-04-10",
    startTime: "11:00",
    endTime: "12:00",
    attendees: ["Chief Engineer Thompson", "2nd Engineer Kim"],
    status: "cancelled",
    meetingLink: "https://teams.microsoft.com/meet/jkl012",
    agenda: "Debrief on last inspection findings.",
    createdBy: "John Doe",
  },
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00",
];

const TeamsMeetPage = () => {
  const [meetings, setMeetings] = useState(mockMeetings);
  const [searchQuery, setSearchQuery] = useState("");
  const [vesselFilter, setVesselFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newVessel, setNewVessel] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newAttendees, setNewAttendees] = useState("");
  const [newAgenda, setNewAgenda] = useState("");

  const showToast = (title, description, variant = "default") => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.vessel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVessel = vesselFilter === "all" || m.vessel === vesselFilter;
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesVessel && matchesStatus;
  });

  const scheduledCount = meetings.filter((m) => m.status === "scheduled").length;
  const completedCount = meetings.filter((m) => m.status === "completed").length;
  const cancelledCount = meetings.filter((m) => m.status === "cancelled").length;

  const handleScheduleMeeting = () => {
    if (!newTitle || !newVessel || !newDate || !newStartTime || !newEndTime) {
      showToast("Missing Fields", "Please fill all required fields.", "destructive");
      return;
    }
    const meeting = {
      id: `MTG${String(meetings.length + 1).padStart(3, "0")}`,
      title: newTitle,
      vessel: newVessel,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      attendees: newAttendees.split(",").map((a) => a.trim()).filter(Boolean),
      status: "scheduled",
      meetingLink: `https://teams.microsoft.com/meet/${Math.random().toString(36).slice(2, 10)}`,
      agenda: newAgenda,
      createdBy: "John Doe",
    };
    setMeetings([meeting, ...meetings]);
    setDialogOpen(false);
    setNewTitle(""); setNewVessel(""); setNewDate("");
    setNewStartTime(""); setNewEndTime(""); setNewAttendees(""); setNewAgenda("");
    showToast("Meeting Scheduled", `"${meeting.title}" scheduled for ${meeting.vessel} on ${meeting.date}.`);
  };

  const handleCancel = (id) => {
    setMeetings(meetings.map((m) => m.id === id ? { ...m, status: "cancelled" } : m));
    showToast("Meeting Cancelled", "The meeting has been cancelled.");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="tm-badge tm-badge--scheduled">
            <Clock className="tm-badge-icon" /> Scheduled
          </span>
        );
      case "completed":
        return (
          <span className="tm-badge tm-badge--completed">
            <CheckCircle2 className="tm-badge-icon" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="tm-badge tm-badge--cancelled">
            <XCircle className="tm-badge-icon" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="tm-page">
      {/* Toast */}
      {toast && (
        <div className={`tm-toast ${toast.variant === "destructive" ? "tm-toast--error" : ""}`}>
          <strong>{toast.title}</strong>
          <span>{toast.description}</span>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="tm-header"
      >
        <div>
          <h1 className="tm-title">
            <Video className="tm-title-icon" /> Teams Meet
          </h1>
          <p className="tm-subtitle">Schedule and manage vessel-wise team meetings</p>
        </div>
        <button className="tm-btn-primary" onClick={() => setDialogOpen(true)}>
          <Plus className="tm-btn-icon" /> Schedule Meeting
        </button>
      </motion.div>

      {/* Schedule Meeting Modal */}
      {dialogOpen && (
        <div className="tm-modal-overlay" onClick={() => setDialogOpen(false)}>
          <div className="tm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <h2 className="tm-modal-title">
                <Video className="tm-modal-title-icon" /> Schedule New Meeting
              </h2>
              <button className="tm-modal-close" onClick={() => setDialogOpen(false)}>×</button>
            </div>
            <div className="tm-modal-body">
              <div className="tm-form-group">
                <label className="tm-label">Meeting Title *</label>
                <input
                  className="tm-input"
                  placeholder="e.g. Safety Compliance Review"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="tm-form-group">
                <label className="tm-label">Vessel *</label>
                <select
                  className="tm-select"
                  value={newVessel}
                  onChange={(e) => setNewVessel(e.target.value)}
                >
                  <option value="">Select vessel</option>
                  {vesselList.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="tm-form-group">
                <label className="tm-label">Date *</label>
                <input
                  className="tm-input"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="tm-form-row">
                <div className="tm-form-group">
                  <label className="tm-label">Start Time *</label>
                  <select
                    className="tm-select"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                  >
                    <option value="">Select</option>
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="tm-form-group">
                  <label className="tm-label">End Time *</label>
                  <select
                    className="tm-select"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                  >
                    <option value="">Select</option>
                    {timeSlots
                      .filter((t) => t > newStartTime)
                      .map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="tm-form-group">
                <label className="tm-label">Attendees</label>
                <input
                  className="tm-input"
                  placeholder="Comma-separated names (e.g. Capt. James, Officer Raj)"
                  value={newAttendees}
                  onChange={(e) => setNewAttendees(e.target.value)}
                />
                <p className="tm-hint">Separate names with commas</p>
              </div>
              <div className="tm-form-group">
                <label className="tm-label">Agenda</label>
                <textarea
                  className="tm-textarea"
                  placeholder="Meeting agenda..."
                  value={newAgenda}
                  onChange={(e) => setNewAgenda(e.target.value)}
                />
              </div>
              <button className="tm-btn-primary tm-btn-full" onClick={handleScheduleMeeting}>
                <Send className="tm-btn-icon" /> Schedule &amp; Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="tm-stats-grid">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="tm-stat-card tm-stat-card--primary"
        >
          <div className="tm-stat-icon tm-stat-icon--primary">
            <Clock className="tm-stat-icon-svg" />
          </div>
          <div>
            <p className="tm-stat-value">{scheduledCount}</p>
            <p className="tm-stat-label">Upcoming</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="tm-stat-card tm-stat-card--green"
        >
          <div className="tm-stat-icon tm-stat-icon--green">
            <CheckCircle2 className="tm-stat-icon-svg" />
          </div>
          <div>
            <p className="tm-stat-value">{completedCount}</p>
            <p className="tm-stat-label">Completed</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="tm-stat-card tm-stat-card--red"
        >
          <div className="tm-stat-icon tm-stat-icon--red">
            <XCircle className="tm-stat-icon-svg" />
          </div>
          <div>
            <p className="tm-stat-value">{cancelledCount}</p>
            <p className="tm-stat-label">Cancelled</p>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="tm-filters-card">
        <div className="tm-filters">
          <div className="tm-search-wrap">
            <Search className="tm-search-icon" />
            <input
              className="tm-input tm-input--search"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="tm-select"
            value={vesselFilter}
            onChange={(e) => setVesselFilter(e.target.value)}
          >
            <option value="all">All Vessels</option>
            {vesselList.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            className="tm-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Meetings Table */}
      <div className="tm-table-card">
        <div className="tm-table-header">
          <h2 className="tm-table-title">Meetings ({filteredMeetings.length})</h2>
          <p className="tm-table-desc">All scheduled and past meetings organized by vessel</p>
        </div>
        <div className="tm-table-wrap">
          <table className="tm-table">
            <thead>
              <tr className="tm-thead-row">
                <th>Meeting</th>
                <th>Vessel</th>
                <th>Date &amp; Time</th>
                <th>Attendees</th>
                <th>Status</th>
                <th className="tm-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeetings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="tm-empty-cell">
                    <Video className="tm-empty-icon" />
                    <p>No meetings found</p>
                  </td>
                </tr>
              ) : (
                filteredMeetings.map((meeting) => (
                  <motion.tr
                    key={meeting.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="tm-tr"
                  >
                    <td>
                      <p className="tm-td-title">{meeting.title}</p>
                      <p className="tm-td-agenda">{meeting.agenda}</p>
                    </td>
                    <td>
                      <span className="tm-vessel-badge">
                        <Ship className="tm-vessel-icon" /> {meeting.vessel}
                      </span>
                    </td>
                    <td>
                      <div className="tm-td-date">
                        <Calendar className="tm-td-icon" />
                        <span className="tm-td-date-val">{meeting.date}</span>
                      </div>
                      <div className="tm-td-time">
                        <Clock className="tm-td-icon-sm" />
                        {meeting.startTime} - {meeting.endTime}
                      </div>
                    </td>
                    <td>
                      <div className="tm-td-attendees">
                        <Users className="tm-td-icon" />
                        <span>
                          {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="tm-td-attendees-list">{meeting.attendees.join(", ")}</p>
                    </td>
                    <td>{getStatusBadge(meeting.status)}</td>
                    <td className="tm-td-actions">
                      <div className="tm-action-btns">
                        {meeting.status === "scheduled" && (
                          <>
                            <button
                              className="tm-action-btn tm-action-btn--primary"
                              title="Join Meeting"
                            >
                              <Video className="tm-action-icon" />
                            </button>
                            <button
                              className="tm-action-btn tm-action-btn--danger"
                              title="Cancel Meeting"
                              onClick={() => handleCancel(meeting.id)}
                            >
                              <Trash2 className="tm-action-icon" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamsMeetPage;