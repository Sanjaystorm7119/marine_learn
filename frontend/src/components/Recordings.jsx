import { useMemo, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, Clock, Download,
  FileVideo, Folder, FolderOpen, HardDrive,
  Play, Search
} from "lucide-react";
import "../pages/Recordings.css";

const MONTHS =["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(iso) {
  const d = new Date(iso);
  const time = d.toTimeString().slice(0, 5);
  return {
    month: MONTHS[d.getMonth()],
    day:   String(d.getDate()).padStart(2, "0"),
    year:  d.getFullYear(),
    time,
  };
}

export default function Recordings() {
  const[openVessel, setOpenVessel] = useState(null);
  const [query, setQuery]           = useState("");
  const[meetings, setMeetings]     = useState([]);

  // Fetch meetings from backend
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const rawToken = localStorage.getItem("access_token") || localStorage.getItem("token");
        if (!rawToken) return;
        const cleanToken = rawToken.replace(/^"|"$/g, '');

        const response = await fetch("http://127.0.0.1:8000/teams/meetings", {
          headers: { "Authorization": `Bearer ${cleanToken}` }
        });
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        // Only keep meetings that have a recording URL generated
        setMeetings(data.filter(m => m.recording_url));
      } catch (error) {
        console.error("Error fetching recordings:", error);
      }
    };
    fetchRecordings();
  },[]);

  // Dynamically group recordings by vessel
  const RECORDINGS_BY_VESSEL = useMemo(() => {
    const grouped = {};
    meetings.forEach(m => {
      const v = m.vessel || "Unknown Vessel";
      if (!grouped[v]) grouped[v] =[];
      
      const start = new Date(m.start_time);
      const end = new Date(m.end_time);
      const durationMinutes = Math.round((end - start) / 60000);

      grouped[v].push({
        id: m.id,
        title: m.title,
        recordedAt: m.start_time,
        durationMinutes: durationMinutes > 0 ? durationMinutes : 0,
        sizeMb: "Cloud", // Streaming from SharePoint
        recordingUrl: m.recording_url
      });
    });
    return grouped;
  }, [meetings]);

  const VESSELS = Object.keys(RECORDINGS_BY_VESSEL);

  const recordings = openVessel ? (RECORDINGS_BY_VESSEL[openVessel] ?? []) :[];
  const filteredRecordings = useMemo(
    () => recordings.filter((r) => r.title.toLowerCase().includes(query.toLowerCase())),
    [recordings, query],
  );

  return (
    <div className="rec-page">

      {/* ── Breadcrumb ── */}
      <div className="rec-breadcrumb">
        <NavLink to="/teams-meet" className="rec-bc-link">Teams Meet</NavLink>
        <ChevronRight className="rec-bc-arrow" />
        <span
          className={openVessel ? "rec-bc-link rec-bc-clickable" : "rec-bc-current"}
          onClick={() => setOpenVessel(null)}
        >
          Recordings
        </span>
        {openVessel && (
          <>
            <ChevronRight className="rec-bc-arrow" />
            <span className="rec-bc-current">{openVessel}</span>
          </>
        )}
      </div>

      {/* ── Page header ── */}
      <div className="rec-header-row">
        <div>
          <h1 className="rec-title">
            <FolderOpen className="rec-title-icon" />
            {openVessel ?? "Recordings"}
          </h1>
          <p className="rec-subtitle">
            {openVessel
              ? "All meeting recordings for this vessel"
              : "Browse meeting recordings organized by vessel"}
          </p>
        </div>
        {openVessel && (
          <button className="rec-back-btn" onClick={() => setOpenVessel(null)}>
            <ArrowLeft className="rec-back-icon" /> Back to vessels
          </button>
        )}
      </div>

      {/* ── Vessel grid ── */}
      {!openVessel ? (
        <div className="rec-vessel-grid">
          {VESSELS.map((v) => {
            const list = RECORDINGS_BY_VESSEL[v] ?? [];
            const last = list.length > 0 ? formatDate(list[0].recordedAt) : null;
            return (
              <button key={v} className="rec-vessel-btn" onClick={() => setOpenVessel(v)}>
                <div className="rec-vessel-card">
                  <div className="rec-vessel-bg-circle" />
                  <div className="rec-vessel-top">
                    <div className="rec-vessel-icon-wrap nav-gradient">
                      <Folder className="rec-vessel-icon" />
                    </div>
                    <span className="rec-vessel-count">{list.length} files</span>
                  </div>
                  <div className="rec-vessel-info">
                    <h3 className="rec-vessel-name">{v}</h3>
                    <p className="rec-vessel-date">
                      {last ? `Last recorded ${last.month} ${last.day}` : "No recordings yet"}
                    </p>
                  </div>
                  <div className="rec-vessel-open">
                    Open folder <ChevronRight className="rec-vessel-open-arrow" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          {/* ── Search bar ── */}
          <div className="rec-search-card">
            <div className="rec-search-wrap">
              <Search className="rec-search-icon" />
              <input
                className="rec-search-input"
                placeholder="Search recordings..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* ── Recording cards ── */}
          <div className="rec-list-grid">
            {filteredRecordings.map((r) => {
              const d = formatDate(r.recordedAt);
              return (
                <div key={r.id} className="rec-card">
                  <div className="rec-date-badge nav-gradient">
                    <span className="rec-date-month">{d.month}</span>
                    <span className="rec-date-day">{d.day}</span>
                    <span className="rec-date-year">{d.year}</span>
                  </div>
                  <div className="rec-card-body">
                    <div className="rec-card-title-row">
                      <FileVideo className="rec-file-icon" />
                      <h3 className="rec-card-title">{r.title}</h3>
                    </div>
                    <div className="rec-card-meta">
                      <span className="rec-meta-item">
                        <Clock className="rec-meta-icon" />{d.time}
                      </span>
                      <span className="rec-meta-item">{r.durationMinutes} min</span>
                      <span className="rec-meta-item">
                        <HardDrive className="rec-meta-icon" />{r.sizeMb} MB
                      </span>
                    </div>
                     <div className="rec-card-actions">
                      <button 
                        className="rec-play-btn nav-gradient"
                        onClick={() => window.open(r.recordingUrl, "_blank")}
                      >
                        <Play className="rec-action-icon" /> Play
                      </button>
                      <button 
                        className="rec-dl-btn"
                        onClick={() => window.open(r.recordingUrl, "_blank")}
                      >
                        <Download className="rec-action-icon" /> View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredRecordings.length === 0 && (
              <div className="rec-empty">No recordings found.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}