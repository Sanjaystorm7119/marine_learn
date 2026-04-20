import { useState } from "react";
import { X, Calendar, Clock, Users, Plus, Trash2, Video, CheckCircle2, AlertTriangle } from "lucide-react";
import { createMeeting } from "../lib/teamsApi";

const DURATION_OPTIONS = [
  { label: "15 min",   minutes: 15  },
  { label: "30 min",   minutes: 30  },
  { label: "1 hour",   minutes: 60  },
  { label: "1.5 hrs",  minutes: 90  },
  { label: "2 hours",  minutes: 120 },
];

function addMinutes(isoDate, isoTime, minutes) {
  const dt = new Date(`${isoDate}T${isoTime}`);
  dt.setMinutes(dt.getMinutes() + minutes);
  return dt;
}

export default function ScheduleMeetingModal({ onClose, onScheduled }) {
  const [title, setTitle]           = useState("");
  const [description, setDesc]      = useState("");
  const [date, setDate]             = useState("");
  const [time, setTime]             = useState("");
  const [duration, setDuration]     = useState(60);
  const [emailInput, setEmailInput] = useState("");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);

  const addParticipant = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError("Enter a valid email address."); return; }
    if (participants.includes(email)) { setError("Email already added."); return; }
    setParticipants((p) => [...p, email]);
    setEmailInput("");
    setError(null);
  };

  const removeParticipant = (email) =>
    setParticipants((p) => p.filter((e) => e !== email));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addParticipant(); }
  };

  const handleSubmit = async () => {
    if (!title.trim())        { setError("Meeting title is required.");  return; }
    if (!date || !time)       { setError("Date and time are required.");  return; }
    if (participants.length === 0) { setError("Add at least one participant."); return; }

    const startDt = new Date(`${date}T${time}`);
    if (startDt <= new Date()) { setError("Start time must be in the future."); return; }
    const endDt = addMinutes(date, time, duration);

    setLoading(true);
    setError(null);
    try {
      const meeting = await createMeeting({
        title,
        description: description || null,
        start_time: startDt.toISOString(),
        end_time:   endDt.toISOString(),
        participants,
      });
      setSuccess(meeting);
    } catch (err) {
      setError(err.message || "Failed to schedule meeting.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="audits-modal-overlay" onClick={onClose}>
        <div className="audits-modal" onClick={(e) => e.stopPropagation()}>
          <div className="audits-modal-header">
            <h2 className="audits-modal-title">Meeting Scheduled!</h2>
            <button className="audits-modal-close" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="audits-modal-body teams-success-body">
            <CheckCircle2 size={48} className="teams-success-icon" />
            <p className="teams-success-title">{success.title}</p>
            <p className="teams-success-sub">
              {success.email_status === "sent"
                ? success.join_url
                  ? "Teams meeting created and invitations sent."
                  : "Invitations sent to all participants."
                : "Could not send invitations — copy link below."}
            </p>
            {success.join_url && (
              <div className="teams-join-link-box">
                <input readOnly value={success.join_url} className="audits-input" />
                <button
                  className="audits-btn-primary"
                  onClick={() => navigator.clipboard.writeText(success.join_url)}
                >
                  Copy
                </button>
              </div>
            )}
            <button
              className="audits-btn-primary audits-btn-full"
              style={{ marginTop: 16 }}
              onClick={() => { onScheduled(success); onClose(); }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="audits-modal-overlay" onClick={onClose}>
      <div className="audits-modal teams-schedule-modal" onClick={(e) => e.stopPropagation()}>
        <div className="audits-modal-header">
          <h2 className="audits-modal-title">
            <Video size={18} style={{ marginRight: 8 }} />
            Schedule Teams Meeting
          </h2>
          <button className="audits-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="audits-modal-body">
          <div className="audits-form-group">
            <label className="audits-label">Meeting Title *</label>
            <input
              className="audits-input"
              placeholder="e.g., Q2 Safety Briefing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="audits-form-group">
            <label className="audits-label">Description (optional)</label>
            <textarea
              className="audits-input teams-textarea"
              placeholder="Agenda, notes, or context…"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
            />
          </div>

          <div className="teams-row-2col">
            <div className="audits-form-group">
              <label className="audits-label"><Calendar size={14} /> Date *</label>
              <input
                className="audits-input"
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="audits-form-group">
              <label className="audits-label"><Clock size={14} /> Start Time *</label>
              <input
                className="audits-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="audits-form-group">
            <label className="audits-label">Duration</label>
            <div className="teams-duration-btns">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d.minutes}
                  className={`audits-type-btn ${duration === d.minutes ? "audits-type-btn--active" : ""}`}
                  onClick={() => setDuration(d.minutes)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="audits-form-group">
            <label className="audits-label"><Users size={14} /> Participants *</label>
            <div className="teams-email-input-row">
              <input
                className="audits-input"
                placeholder="participant@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="audits-btn-primary teams-add-btn" onClick={addParticipant}>
                <Plus size={16} />
              </button>
            </div>
            {participants.length > 0 && (
              <div className="teams-chips">
                {participants.map((email) => (
                  <span key={email} className="teams-chip">
                    {email}
                    <button className="teams-chip-remove" onClick={() => removeParticipant(email)}>
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="teams-error-banner">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <button
            className="audits-btn-primary audits-btn-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Sending invitations…" : <><Video size={16} /> Schedule Meeting</>}
          </button>
        </div>
      </div>
    </div>
  );
}
