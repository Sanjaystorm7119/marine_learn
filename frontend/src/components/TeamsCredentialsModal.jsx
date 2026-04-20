import { useState } from "react";
import { X, Key, Building2, User, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";
import { saveCredentials } from "../lib/teamsApi";

const FIELDS = [
  { key: "tenant_id",           label: "Tenant ID",            placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", secret: false },
  { key: "client_id",           label: "Client ID",            placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", secret: false },
  { key: "client_secret_value", label: "Client Secret Value",  placeholder: "Your Azure app client secret value",   secret: true  },
  { key: "secret_id",           label: "Secret ID",            placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", secret: false },
  { key: "organizer_user_id",   label: "Organizer UPN / Email",placeholder: "organizer@yourdomain.com",             secret: false },
  { key: "organizer_display_name", label: "Organizer Display Name", placeholder: "e.g. MarineLearn Admin",          secret: false },
];

export default function TeamsCredentialsModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    tenant_id: "", client_id: "", client_secret_value: "",
    secret_id: "", organizer_user_id: "", organizer_display_name: "",
  });
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    for (const f of FIELDS) {
      if (!form[f.key]?.trim()) {
        setError(`"${f.label}" is required.`);
        return;
      }
    }
    setLoading(true);
    setError(null);
    try {
      const status = await saveCredentials(form);
      onSaved(status);
    } catch (err) {
      setError(err.message || "Failed to save credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="audits-modal-overlay" onClick={onClose}>
      <div className="audits-modal teams-creds-modal" onClick={(e) => e.stopPropagation()}>
        <div className="audits-modal-header">
          <h2 className="audits-modal-title">
            <Key size={18} style={{ marginRight: 8 }} />
            Configure Microsoft 365
          </h2>
          <button className="audits-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="audits-modal-body">
          <p className="teams-creds-hint">
            These credentials come from your Azure App Registration.
            They are stored encrypted on the server and never returned to the browser.
          </p>

          {FIELDS.map((f) => (
            <div key={f.key} className="audits-form-group">
              <label className="audits-label">{f.label}</label>
              <div className="teams-input-wrap">
                <input
                  className="audits-input"
                  type={f.secret && !showSecret ? "password" : "text"}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  autoComplete="off"
                />
                {f.secret && (
                  <button
                    type="button"
                    className="teams-eye-btn"
                    onClick={() => setShowSecret((s) => !s)}
                    tabIndex={-1}
                  >
                    {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {error && (
            <div className="teams-error-banner">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <div className="teams-modal-hint-box">
            <Building2 size={14} />
            <span>
              Find these in{" "}
              <strong>Azure Portal → App Registrations → Your App → Overview &amp; Certificates &amp; secrets</strong>.
              Ensure <strong>OnlineMeetings.ReadWrite.All</strong> and <strong>Mail.Send</strong>{" "}
              application permissions are granted with admin consent.
            </span>
          </div>

          <button
            className="audits-btn-primary audits-btn-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Verifying & saving…" : (
              <><CheckCircle2 size={16} /> Save Credentials</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
