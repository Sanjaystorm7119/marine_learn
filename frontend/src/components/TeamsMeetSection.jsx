import { useState } from "react";
import { Video, Plus } from "lucide-react";
import ScheduleMeetingModal from "./ScheduleMeetingModal";

export default function TeamsMeetSection({ showToast }) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const handleMeetingScheduled = (meeting) => {
    const msg = meeting.email_status === "sent"
      ? "Invitations sent to all participants."
      : "Meeting saved — emails could not be sent.";
    showToast("Meeting scheduled ✅", msg);
  };

  return (
    <div className="teams-section">
      <div className="teams-email-only-state">
        <Video size={40} className="teams-empty-icon" />
        <p>Schedule a meeting and send email invitations to participants.</p>
        <button className="audits-btn-primary" onClick={() => setShowScheduleModal(true)}>
          <Plus size={16} /> Schedule Meeting
        </button>
      </div>

      {showScheduleModal && (
        <ScheduleMeetingModal
          onClose={() => setShowScheduleModal(false)}
          onScheduled={handleMeetingScheduled}
        />
      )}
    </div>
  );
}
