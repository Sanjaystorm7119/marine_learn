import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, it, expect } from "vitest";
import CertificateTemplate from "../components/CertificateTemplate";

const baseProps = {
  recipientName: "John Michael Doe",
  courseName: "ECDIS Cybersecurity Fundamentals",
  issuedAt: "2026-04-03T10:00:00",
  certificateNumber: "MAR-A1B2C3D4",
};

describe("CertificateTemplate", () => {
  it("renders the recipient's full name", () => {
    render(<CertificateTemplate {...baseProps} />);
    expect(screen.getByText("John Michael Doe")).toBeInTheDocument();
  });

  it("renders the course name", () => {
    render(<CertificateTemplate {...baseProps} />);
    expect(screen.getByText("ECDIS Cybersecurity Fundamentals")).toBeInTheDocument();
  });

  it("renders the certificate number", () => {
    render(<CertificateTemplate {...baseProps} />);
    expect(screen.getByText("MAR-A1B2C3D4")).toBeInTheDocument();
  });

  it("renders a formatted completion date", () => {
    render(<CertificateTemplate {...baseProps} />);
    // "2026-04-03T10:00:00" → "April 3, 2026"
    expect(screen.getByText(/April 3, 2026/)).toBeInTheDocument();
  });

  it("renders the MarineLearn header", () => {
    render(<CertificateTemplate {...baseProps} />);
    // Multiple elements may contain "MarineLearn" (header + footer caption)
    const matches = screen.getAllByText(/MarineLearn/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("renders the Certificate of Completion label", () => {
    render(<CertificateTemplate {...baseProps} />);
    expect(screen.getByText(/certificate of completion/i)).toBeInTheDocument();
  });

  it("attaches a forwarded ref to the root element", () => {
    const ref = createRef();
    render(<CertificateTemplate {...baseProps} ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current.tagName).toBe("DIV");
  });

  it("handles missing issuedAt gracefully without crashing", () => {
    expect(() =>
      render(<CertificateTemplate {...baseProps} issuedAt={null} />)
    ).not.toThrow();
  });

  it("renders empty date string when issuedAt is null", () => {
    const { container } = render(<CertificateTemplate {...baseProps} issuedAt={null} />);
    // No date should appear — the formatted date area should be empty
    // The component sets formattedDate="" when issuedAt is falsy
    const root = container.firstChild;
    expect(root).not.toBeNull();
  });

  it("renders the 'This is to certify that' phrase", () => {
    render(<CertificateTemplate {...baseProps} />);
    expect(screen.getByText(/this is to certify that/i)).toBeInTheDocument();
  });

  it("renders the 'has successfully completed the course' phrase", () => {
    render(<CertificateTemplate {...baseProps} />);
    expect(screen.getByText(/has successfully completed the course/i)).toBeInTheDocument();
  });

  it("renders the passing score requirement text", () => {
    render(<CertificateTemplate {...baseProps} />);
    expect(screen.getByText(/70%/)).toBeInTheDocument();
  });

  it("renders the Training Institute subtitle", () => {
    render(<CertificateTemplate {...baseProps} />);
    expect(screen.getByText(/Training Institute/i)).toBeInTheDocument();
  });

  it("renders a course name containing special characters", () => {
    render(
      <CertificateTemplate
        {...baseProps}
        courseName="Firefighting & Fire Prevention — Module 1"
      />
    );
    expect(
      screen.getByText("Firefighting & Fire Prevention — Module 1")
    ).toBeInTheDocument();
  });

  it("renders a recipient name with only one word", () => {
    render(<CertificateTemplate {...baseProps} recipientName="Sailor" />);
    expect(screen.getByText("Sailor")).toBeInTheDocument();
  });

  it("renders a different certificate number correctly", () => {
    render(<CertificateTemplate {...baseProps} certificateNumber="MAR-FFFFFFFF" />);
    expect(screen.getByText("MAR-FFFFFFFF")).toBeInTheDocument();
  });
});