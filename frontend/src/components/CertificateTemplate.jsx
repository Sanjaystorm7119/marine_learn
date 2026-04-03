import React from "react";

const CertificateTemplate = React.forwardRef(function CertificateTemplate(
  { recipientName, courseName, issuedAt, certificateNumber },
  ref
) {
  const formattedDate = issuedAt
    ? new Date(issuedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        maxWidth: "860px",
        margin: "0 auto",
        padding: "32px",
        border: "4px solid #1a3a5c",
        borderRadius: "4px",
        background: "#ffffff",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Inner border */}
      <div
        style={{
          border: "2px solid #3a7ca5",
          padding: "28px 36px",
          position: "relative",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "22px" }}>⚓</span>
            <span
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#1a3a5c",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              MarineLearn
            </span>
          </div>
          <span
            style={{
              fontSize: "11px",
              color: "#3a7ca5",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Training Institute
          </span>
        </div>

        {/* Gold divider */}
        <div
          style={{
            height: "2px",
            background: "linear-gradient(to right, #b8860b, #d4a843, #b8860b)",
            marginBottom: "24px",
          }}
        />

        {/* Main content */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#3a7ca5",
              marginBottom: "4px",
              margin: "0 0 4px 0",
            }}
          >
            Certificate of Completion
          </p>

          <div
            style={{
              width: "120px",
              height: "2px",
              background: "#3a7ca5",
              margin: "8px auto 20px auto",
            }}
          />

          <p
            style={{
              fontSize: "13px",
              color: "#666",
              fontStyle: "italic",
              margin: "0 0 10px 0",
            }}
          >
            This is to certify that
          </p>

          <p
            style={{
              fontSize: "36px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#1a3a5c",
              fontWeight: "normal",
              margin: "0 0 6px 0",
              paddingBottom: "8px",
              borderBottom: "1px solid #3a7ca5",
              display: "inline-block",
              minWidth: "60%",
            }}
          >
            {recipientName}
          </p>

          <p
            style={{
              fontSize: "13px",
              color: "#666",
              margin: "16px 0 10px 0",
            }}
          >
            has successfully completed the course
          </p>

          <p
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#3a7ca5",
              margin: "0 0 8px 0",
            }}
          >
            {courseName}
          </p>

          <p
            style={{
              fontSize: "12px",
              color: "#888",
              margin: "0 0 20px 0",
            }}
          >
            with a passing score of 70% or above
          </p>
        </div>

        {/* Gold divider */}
        <div
          style={{
            height: "2px",
            background: "linear-gradient(to right, #b8860b, #d4a843, #b8860b)",
            margin: "0 0 14px 0",
          }}
        />

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#555",
              margin: "0",
            }}
          >
            <span style={{ color: "#888" }}>Date of Completion: </span>
            <strong>{formattedDate}</strong>
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#555",
              margin: "0",
            }}
          >
            <span style={{ color: "#888" }}>Certificate No: </span>
            <strong>{certificateNumber}</strong>
          </p>
        </div>

        {/* Bottom caption */}
        <div
          style={{
            marginTop: "10px",
            borderTop: "1px solid #d4e6f1",
            paddingTop: "8px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              color: "#aaa",
              margin: "0",
              letterSpacing: "1px",
            }}
          >
            MarineLearn Training Institute — Official Certification
          </p>
        </div>
      </div>
    </div>
  );
});

export default CertificateTemplate;
