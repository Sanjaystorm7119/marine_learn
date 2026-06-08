import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Video, Plus, Calendar, Clock, Ship, Users, Send,
  Search, Trash2, CheckCircle2, XCircle, Download,
  Mail, MailQuestion, RefreshCw, CalendarPlus
} from "lucide-react";
import "../pages/TeamsMeetPage.css";

const vesselList = [
  "MV Ocean Star",
  "MV Sea Falcon",
  "MV Pacific Voyager",
  "MV Atlantic Pioneer",
  "MV Indian Explorer",
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00",
];

const proposedTimeSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

const TeamsMeetPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [vesselFilter, setVesselFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Request Availability state
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmDate, setConfirmDate] = useState("");
  const [confirmStart, setConfirmStart] = useState("");
  const [confirmEnd, setConfirmEnd] = useState("");

  // Schedule meeting form state
  const [newTitle, setNewTitle] = useState("");
  const [newVessel, setNewVessel] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newAgenda, setNewAgenda] = useState("");
  const [fetchingId, setFetchingId] = useState(null);

  // Request availability form state
  const [reqTitle, setReqTitle] = useState("");
  const [reqVessel, setReqVessel] = useState("");
  
  const [reqAgenda, setReqAgenda] = useState("");
  const [reqDates, setReqDates] = useState([]);
  const [reqTimes, setReqTimes] = useState([]);
  const [reqEmailOverride, setReqEmailOverride] = useState(null);

  // --- NEW: Pagination & Stats State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const [stats, setStats] = useState({ scheduled: 0, completed: 0, cancelled: 0, pending: 0 });
  const itemsPerPage = 10;

  // Reset to page 1 whenever a filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, vesselFilter, statusFilter]);

  // Fetch data whenever page, search, or filters change
  useEffect(() => {
    fetchMeetings();
  }, [currentPage, searchQuery, vesselFilter, statusFilter]);

  const fetchMeetings = async () => {
    try {
      const rawToken = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!rawToken) return;
      const cleanToken = rawToken.replace(/^"|"$/g, "");

      // Pass all parameters to the backend
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        vessel: vesselFilter,
        status: statusFilter
      });

      const response = await fetch(`http://127.0.0.1:8000/teams/meetings?${queryParams}`, {
        headers: { Authorization: `Bearer ${cleanToken}` },
      });

      if (!response.ok) throw new Error("Failed to fetch meetings");
      const data = await response.json();
      
      // Update pagination & stats from backend
      setTotalPages(data.pages);
      setTotalMeetings(data.total);
      setStats({
        scheduled: data.scheduled_count,
        completed: data.completed_count,
        cancelled: data.cancelled_count,
        pending: data.pending_count
      });

      const formattedMeetings = data.items.map((m) => {
        const startDate = new Date(m.start_time);
        const endDate = new Date(m.end_time);
        const now = new Date();
        let displayStatus = m.status;
        // ONLY auto-complete if it was actually scheduled!
        if (displayStatus === "scheduled" && endDate < now) {
          displayStatus = "completed";
        }
        return {
          id: m.id,
          title: m.title,
          vessel: m.vessel || "Unknown Vessel",
          date: startDate.toISOString().split("T")[0],
          startTime: startDate.toTimeString().slice(0, 5),
          endTime: endDate.toTimeString().slice(0, 5),
          attendees: m.participants || [],
          status: displayStatus,
          meetingLink: m.join_url,
          agenda: m.description || "",
          recording_url: m.recording_url,
          proposedDates: m.proposed_slots?.dates || [],  // <-- ADDED THIS
          proposedTimes: m.proposed_slots?.times || [],  // <-- ADDED THIS
        };
      });

      setMeetings(formattedMeetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      showToast("Error", "Failed to load meetings from server.", "destructive");
    }
  };

  const showToast = (title, description, variant = "default") => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Request Availability helpers ──────────────────────────────────────────

  const buildEmailTemplate = () => {
    return `Dear Captain,
Good day.

As part of our ongoing efforts to maintain a cyber-secure environment onboard, 
the AFT Cyber Security Team is organizing a Cyber Security Awareness Session for the Captain and all crew members of ${reqVessel || "[Vessel Name]"}.

This session is mandatory to ensure compliance with IMO cyber security requirements.

The session will be conducted via Microsoft Teams. Kindly review the available date and time slots below and confirm your preferred schedule suitable for the vessel. 
If you are not comfortable with the available time slots kindly share your preferred time slots and we will try to connect during it.

Proposed Dates:
{{DATES_TABLE}}

Available Time Slots:
{{TIMES_TABLE}}

Agenda:
  ${reqAgenda || "(to be discussed)"}

Please reply to this email indicating your preferred date and time, and we will send the formal Teams invite accordingly.

Best regards,
MarineLearn Superuser Desk`;
  };

  const currentEmailBody = reqEmailOverride ?? buildEmailTemplate();

  const toggleDate = (d) => {
    setReqEmailOverride(null);
    setReqDates((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  };

  const toggleTime = (t) => {
    setReqEmailOverride(null);
    setReqTimes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort()
    );
  };

  const resetRequestForm = () => {
    setReqTitle("");
    setReqVessel("");
    
    setReqAgenda("");
    setReqDates([]);
    setReqTimes([]);
    setReqEmailOverride(null);
  };

  const handleSendAvailabilityRequest = async () => {
    if (!reqTitle || !reqVessel || reqDates.length === 0 || reqTimes.length === 0) {
      showToast("Missing Fields", "Title, vessel, at least one date and one time slot are required.", "destructive");
      return;
    }

    const payload = {
      title: reqTitle,
      vessel: reqVessel,
      agenda: reqAgenda,
      proposed_dates: reqDates,
      proposed_times: reqTimes,
      email_body: currentEmailBody
    };

    try {
      const rawToken = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!rawToken) {
        showToast("Auth Error", "You are not logged in!", "destructive");
        return;
      }
      const cleanToken = rawToken.replace(/^"|"$/g, "");

      const response = await fetch("http://127.0.0.1:8000/teams/request-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send request");
      }

      const newMeeting = await response.json();
      
      const formattedMeeting = {
        id: newMeeting.id,
        title: newMeeting.title,
        vessel: newMeeting.vessel,
        date: newMeeting.proposed_slots?.dates[0] || "",
        startTime: newMeeting.proposed_slots?.times[0] || "",
        endTime: "",
        attendees: newMeeting.participants || [],
        status: newMeeting.status,
        meetingLink: "",
        agenda: newMeeting.description || "",
        proposedDates: newMeeting.proposed_slots?.dates || [],
        proposedTimes: newMeeting.proposed_slots?.times || [],
      };

      setMeetings([formattedMeeting, ...meetings]);
      setRequestDialogOpen(false);
      resetRequestForm();
      showToast("Availability Request Sent", `Email sent to ${reqVessel}. Awaiting Captain's reply.`);
    } catch (error) {
      showToast("Error", error.message || "Could not send request.", "destructive");
    }
  };

  const handleResend = (m) => {
    showToast("Email Resent", `Availability request re-sent to ${m.vessel}.`);
  };

  const openConfirmDialog = (m) => {
    setConfirmTarget(m);
    setConfirmDate(m.proposedDates?.[0] ?? "");
    setConfirmStart(m.proposedTimes?.[0] ?? "");
    setConfirmEnd("");
    setConfirmDialogOpen(true);
  };

  const handleConfirmSchedule = async () => {
    if (!confirmTarget || !confirmDate || !confirmStart || !confirmEnd) {
      showToast("Missing Fields", "Please pick the confirmed date, start and end time.", "destructive");
      return;
    }

    const startDateTime = new Date(`${confirmDate}T${confirmStart}:00`).toISOString();
    const endDateTime = new Date(`${confirmDate}T${confirmEnd}:00`).toISOString();

    try {
      const rawToken = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!rawToken) {
        showToast("Auth Error", "You are not logged in!", "destructive");
        return;
      }
      const cleanToken = rawToken.replace(/^"|"$/g, "");

      const response = await fetch(`http://127.0.0.1:8000/teams/meetings/${confirmTarget.id}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
        body: JSON.stringify({
          start_time: startDateTime,
          end_time: endDateTime
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to confirm meeting");
      }

      const updatedMeeting = await response.json();

      // Update the specific meeting in the table with the real data from the backend
      setMeetings(
        meetings.map((m) =>
          m.id === confirmTarget.id
            ? {
                ...m,
                status: "scheduled",
                date: confirmDate,
                startTime: confirmStart,
                endTime: confirmEnd,
                meetingLink: updatedMeeting.join_url,
              }
            : m
        )
      );

      setConfirmDialogOpen(false);
      setConfirmTarget(null);
      showToast("Meeting Scheduled", `Teams invite sent for ${confirmTarget.vessel} on ${confirmDate}.`);
    } catch (error) {
      showToast("Error", error.message || "Could not confirm the meeting.", "destructive");
    }
  };

  // ── Existing handlers ─────────────────────────────────────────────────────

  const { 
    scheduled: scheduledCount, 
    completed: completedCount, 
    cancelled: cancelledCount, 
    pending: pendingCount 
  } = stats;

  const handleScheduleMeeting = async () => {
    if (!newTitle || !newVessel || !newDate || !newStartTime || !newEndTime) {
      showToast("Missing Fields", "Please fill all required fields.", "destructive");
      return;
    }

    const startDateTime = new Date(`${newDate}T${newStartTime}:00`).toISOString();
    const endDateTime = new Date(`${newDate}T${newEndTime}:00`).toISOString();

    const payload = {
      title: newTitle,
      description: newAgenda || `Meeting for ${newVessel}`,
      start_time: startDateTime,
      end_time: endDateTime,
      vessel: newVessel,
    };

    try {
      const rawToken =
        localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!rawToken) {
        showToast("Auth Error", "You are not logged in! Please log in first.", "destructive");
        return;
      }
      const cleanToken = rawToken.replace(/^"|"$/g, "");

      const response = await fetch("http://127.0.0.1:8000/teams/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to schedule meeting");
      }

      const newMeeting = await response.json();

      const formattedMeeting = {
        id: `MTG${newMeeting.id}`,
        title: newMeeting.title,
        vessel: newVessel,
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        attendees: newMeeting.participants,
        status: newMeeting.status,
        meetingLink: newMeeting.join_url,
        agenda: newMeeting.description,
      };

      setMeetings([formattedMeeting, ...meetings]);
      setDialogOpen(false);
      setNewTitle("");
      setNewVessel("");
      setNewDate("");
      setNewStartTime("");
      setNewEndTime("");
      setNewAgenda("");
      showToast("Meeting Scheduled", `Invites sent successfully for ${newTitle}.`);
    } catch (error) {
      showToast("Error", error.message || "Could not schedule the meeting.", "destructive");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this meeting?")) return;

    try {
      const rawToken =
        localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!rawToken) {
        showToast("Auth Error", "You are not logged in!", "destructive");
        return;
      }
      const cleanToken = rawToken.replace(/^"|"$/g, "");

      const response = await fetch(`http://127.0.0.1:8000/teams/meetings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${cleanToken}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to cancel meeting");
      }

      setMeetings(meetings.map((m) => (m.id === id ? { ...m, status: "cancelled" } : m)));
      showToast("Meeting Cancelled", "The meeting has been cancelled successfully.");
    } catch (error) {
      showToast("Error", error.message || "Could not cancel the meeting.", "destructive");
    }
  };

  const handleFetchRecording = async (id) => {
    setFetchingId(id);
    try {
      const rawToken =
        localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!rawToken) {
        showToast("Auth Error", "You are not logged in!", "destructive");
        return;
      }
      const cleanToken = rawToken.replace(/^"|"$/g, "");

      showToast(
        "Processing",
        "Fetching recording from OneDrive to SharePoint... This may take a minute."
      );

      const response = await fetch(
        `http://127.0.0.1:8000/teams/meetings/${id}/fetch-recording`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${cleanToken}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch recording");
      }

      showToast("Success", "Recording successfully uploaded to SharePoint!");
      fetchMeetings();
    } catch (error) {
      showToast("Error", error.message || "Could not fetch the recording.", "destructive");
    } finally {
      setFetchingId(null);
    }
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
      case "pending_confirmation":
        return (
          <span className="tm-badge tm-badge--pending">
            <MailQuestion className="tm-badge-icon" /> Pending Confirmation
          </span>
        );
      default:
        return null;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="tm-page">
      {/* Toast */}
      {toast && (
        <div
          className={`tm-toast ${toast.variant === "destructive" ? "tm-toast--error" : ""}`}
        >
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
        <div className="tm-header-actions">
          <button className="tm-btn-secondary" onClick={() => setRequestDialogOpen(true)}>
            <Mail className="tm-btn-icon" /> Request Availability
          </button>
          <button className="tm-btn-primary" onClick={() => setDialogOpen(true)}>
            <Plus className="tm-btn-icon" /> Direct Schedule
          </button>
        </div>
      </motion.div>

      {/* Schedule Meeting Modal */}
      {dialogOpen && (
        <div className="tm-modal-overlay" onClick={() => setDialogOpen(false)}>
          <div className="tm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <h2 className="tm-modal-title">
                <Video className="tm-modal-title-icon" /> Schedule New Meeting
              </h2>
              <button className="tm-modal-close" onClick={() => setDialogOpen(false)}>
                ×
              </button>
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
                <label className="tm-label">Agenda</label>
                <textarea
                  className="tm-textarea"
                  placeholder="Meeting agenda..."
                  value={newAgenda}
                  onChange={(e) => setNewAgenda(e.target.value)}
                />
              </div>
              <button
                className="tm-btn-primary tm-btn-full"
                onClick={handleScheduleMeeting}
              >
                <Send className="tm-btn-icon" /> Schedule &amp; Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Availability Modal */}
      {requestDialogOpen && (
        <div
          className="tm-modal-overlay"
          onClick={() => {
            setRequestDialogOpen(false);
            resetRequestForm();
          }}
        >
          <div
            className="tm-modal tm-modal--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tm-modal-header">
              <h2 className="tm-modal-title">
                <Mail className="tm-modal-title-icon" /> Request Availability
              </h2>
              <button
                className="tm-modal-close"
                onClick={() => {
                  setRequestDialogOpen(false);
                  resetRequestForm();
                }}
              >
                ×
              </button>
            </div>
            <div className="tm-modal-body tm-modal-body--grid">
              {/* Left: form */}
              <div className="tm-req-form">
                <div className="tm-form-group">
                  <label className="tm-label">Meeting Topic *</label>
                  <input
                    className="tm-input"
                    placeholder="e.g. Safety Compliance Review"
                    value={reqTitle}
                    onChange={(e) => {
                      setReqEmailOverride(null);
                      setReqTitle(e.target.value);
                    }}
                  />
                </div>
                <div className="tm-form-group">
                  <label className="tm-label">Vessel *</label>
                  <select
                    className="tm-select tm-select--full"
                    value={reqVessel}
                    onChange={(e) => {
                      setReqEmailOverride(null);
                      setReqVessel(e.target.value);
                    }}
                  >
                    <option value="">Select vessel</option>
                    {vesselList.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="tm-form-group">
                  <label className="tm-label">Proposed Dates *</label>
                  <input
                    className="tm-input"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      if (e.target.value && !reqDates.includes(e.target.value))
                        toggleDate(e.target.value);
                      e.target.value = "";
                    }}
                  />
                  <div className="tm-tag-row">
                    {reqDates.length === 0 && (
                      <p className="tm-hint">Pick one or more dates</p>
                    )}
                    {reqDates.map((d) => (
                      <button
                        key={d}
                        type="button"
                        className="tm-tag tm-tag--primary"
                        onClick={() => toggleDate(d)}
                      >
                        <Calendar className="tm-tag-icon" /> {d}{" "}
                        <XCircle className="tm-tag-icon" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="tm-form-group">
                  <label className="tm-label">Proposed Time Slots *</label>
                  <div className="tm-timeslot-row">
                    {proposedTimeSlots.map((t) => {
                      const active = reqTimes.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          className={`tm-timeslot-btn ${active ? "tm-timeslot-btn--active" : ""}`}
                          onClick={() => toggleTime(t)}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="tm-form-group">
                  <label className="tm-label">Agenda</label>
                  <textarea
                    className="tm-textarea"
                    placeholder="Brief agenda..."
                    value={reqAgenda}
                    onChange={(e) => {
                      setReqEmailOverride(null);
                      setReqAgenda(e.target.value);
                    }}
                  />
                </div>
              </div>

              {/* Right: email preview */}
              <div className="tm-req-preview">
                <label className="tm-label tm-label--icon">
                  <Mail className="tm-label-icon" /> Email Preview (editable)
                </label>
                <textarea
                  className="tm-email-preview"
                  value={currentEmailBody}
                  onChange={(e) => setReqEmailOverride(e.target.value)}
                />
                <p className="tm-hint">
                  The email auto-updates as you select dates and times. Edits here are kept
                  until you change selections.
                </p>
              </div>
            </div>

            <div className="tm-modal-footer">
              <button
                className="tm-btn-outline"
                onClick={() => {
                  setRequestDialogOpen(false);
                  resetRequestForm();
                }}
              >
                Cancel
              </button>
              <button
                className="tm-btn-primary"
                onClick={handleSendAvailabilityRequest}
              >
                <Send className="tm-btn-icon" /> Send Availability Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm & Schedule Modal */}
      {confirmDialogOpen && (
        <div
          className="tm-modal-overlay"
          onClick={() => setConfirmDialogOpen(false)}
        >
          <div className="tm-modal tm-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <h2 className="tm-modal-title">
                <CalendarPlus className="tm-modal-title-icon" /> Confirm &amp; Schedule
              </h2>
              <button
                className="tm-modal-close"
                onClick={() => setConfirmDialogOpen(false)}
              >
                ×
              </button>
            </div>
            {confirmTarget && (
              <div className="tm-modal-body">
                <div className="tm-confirm-info">
                  <p className="tm-td-title">{confirmTarget.title}</p>
                  <p className="tm-td-agenda">
                    <Ship className="tm-tag-icon" /> {confirmTarget.vessel}
                  </p>
                </div>
                <div className="tm-form-group">
                  <label className="tm-label">Confirmed Date *</label>
                  <select
                    className="tm-select tm-select--full"
                    value={confirmDate}
                    onChange={(e) => setConfirmDate(e.target.value)}
                  >
                    <option value="">Select</option>
                    {confirmTarget.proposedDates?.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="tm-form-row">
                  <div className="tm-form-group">
                    <label className="tm-label">Start *</label>
                    <select
                      className="tm-select tm-select--full"
                      value={confirmStart}
                      onChange={(e) => setConfirmStart(e.target.value)}
                    >
                      <option value="">Select</option>
                      {confirmTarget.proposedTimes?.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="tm-form-group">
                    <label className="tm-label">End *</label>
                    <select
                      className="tm-select tm-select--full"
                      value={confirmEnd}
                      onChange={(e) => setConfirmEnd(e.target.value)}
                    >
                      <option value="">Select</option>
                      {timeSlots
                        .filter((t) => t > confirmStart)
                        .map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                  </div>
                </div>
                <button
                  className="tm-btn-primary tm-btn-full"
                  onClick={handleConfirmSchedule}
                >
                  <Send className="tm-btn-icon" /> Send Teams Invite
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="tm-stats-grid tm-stats-grid--4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="tm-stat-card tm-stat-card--amber"
        >
          <div className="tm-stat-icon tm-stat-icon--amber">
            <MailQuestion className="tm-stat-icon-svg" />
          </div>
          <div>
            <p className="tm-stat-value">{pendingCount}</p>
            <p className="tm-stat-label">Awaiting Reply</p>
          </div>
        </motion.div>

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
            <option value="pending_confirmation">Pending Confirmation</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Meetings Table */}
      <div className="tm-table-card">
        <div className="tm-table-header">
          <h2 className="tm-table-title">Meetings ({totalMeetings})</h2>
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
              {meetings.length === 0 ? (
              
                <tr>
                  <td colSpan={6} className="tm-empty-cell">
                    <Video className="tm-empty-icon" />
                    <p>No meetings found</p>
                  </td>
                </tr>
              ) : (
                meetings.map((meeting) => (
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
                      {meeting.status === "pending_confirmation" ? (
                        <div className="tm-td-pending">
                          <p className="tm-td-pending-label">
                            <MailQuestion className="tm-td-icon-sm" /> Awaiting reply
                          </p>
                          <p className="tm-td-pending-detail">
                            Proposed: {meeting.proposedDates?.join(", ")} ·{" "}
                            {meeting.proposedTimes?.join(", ")}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="tm-td-date">
                            <Calendar className="tm-td-icon" />
                            <span className="tm-td-date-val">{meeting.date}</span>
                          </div>
                          <div className="tm-td-time">
                            <Clock className="tm-td-icon-sm" />
                            {meeting.startTime} - {meeting.endTime}
                          </div>
                        </>
                      )}
                    </td>
                    <td>
                      <div className="tm-td-attendees">
                        <Users className="tm-td-icon" />
                        <span>
                          {meeting.attendees.length} attendee
                          {meeting.attendees.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="tm-td-attendees-list">
                        {meeting.attendees.join(", ")}
                      </p>
                    </td>
                    <td>{getStatusBadge(meeting.status)}</td>
                    <td className="tm-td-actions">
                      <div className="tm-action-btns">
                        {meeting.status === "scheduled" && (
                          <>
                            <button
                              className="tm-action-btn tm-action-btn--primary"
                              title="Join Meeting"
                              onClick={() => window.open(meeting.meetingLink, "_blank")}
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
                        {meeting.status === "completed" && (
                          <>
                            {!meeting.recording_url ? (
                              <button
                                className="tm-action-btn tm-action-btn--primary"
                                title="Fetch Recording to SharePoint"
                                onClick={() => handleFetchRecording(meeting.id)}
                                disabled={fetchingId === meeting.id}
                                style={{ opacity: fetchingId === meeting.id ? 0.5 : 1 }}
                              >
                                <Download className="tm-action-icon" />
                              </button>
                            ) : (
                              <button
                                className="tm-action-btn tm-action-btn--green"
                                title="View Recording"
                                onClick={() =>
                                  window.open(meeting.recording_url, "_blank")
                                }
                                style={{ backgroundColor: "#10b981", color: "white" }}
                              >
                                <Video className="tm-action-icon" />
                              </button>
                            )}
                          </>
                        )}
                        {meeting.status === "pending_confirmation" && (
                          <>
                            <button
                              className="tm-action-btn tm-action-btn--amber"
                              title="Resend Email"
                              onClick={() => handleResend(meeting)}
                            >
                              <RefreshCw className="tm-action-icon" />
                            </button>
                            <button
                              className="tm-action-btn tm-action-btn--amber-outline"
                              title="Schedule Meeting"
                              onClick={() => openConfirmDialog(meeting)}
                            >
                              <CalendarPlus className="tm-action-icon" />
                            </button>
                            <button
                              className="tm-action-btn tm-action-btn--danger"
                              title="Cancel Request"
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
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="tm-pagination">
            <button
              className="tm-btn-outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>
            
            <div className="tm-pagination-numbers">
              {(() => {
                const maxVisible = 5;
                let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                let end = Math.min(totalPages, start + maxVisible - 1);

                if (end - start + 1 < maxVisible) {
                  start = Math.max(1, end - maxVisible + 1);
                }

                const pages = [];
                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }

                return pages.map((page) => (
                  <button
                    key={page}
                    className={`tm-page-num ${currentPage === page ? "tm-page-num--active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ));
              })()}
            </div>

            <button
              className="tm-btn-outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default TeamsMeetPage;