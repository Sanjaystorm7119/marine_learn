import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock("../components/sidenav", () => ({ default: () => null }));

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag) =>
        ({ children, ...props }) =>
          React.createElement(tag, props, children),
    }
  ),
  AnimatePresence: ({ children }) => children,
}));

vi.mock("../components/CertificateTemplate", () => ({
  default: React.forwardRef((_props, _ref) => (
    <div data-testid="cert-template" />
  )),
}));

const mockDownloadPDF = vi.fn().mockResolvedValue(undefined);
vi.mock("../lib/downloadCertificate", () => ({
  downloadCertificatePDF: mockDownloadPDF,
}));

// ── Test data ──────────────────────────────────────────────────────────────────

const MOCK_CERTS = [
  {
    id: 1,
    certificate_number: "MAR-A1B2C3D4",
    course_title: "ECDIS Fundamentals",
    user_full_name: "Test Sailor",
    issued_at: "2026-04-03T10:00:00",
  },
  {
    id: 2,
    certificate_number: "MAR-E5F6G7H8",
    course_title: "Firefighting & Fire Prevention",
    user_full_name: "Test Sailor",
    issued_at: "2026-03-15T08:30:00",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function mockFetch(data, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(data),
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

// Import AFTER mocks are registered
let Certificates;
beforeEach(async () => {
  localStorage.setItem("token", "test-token");
  const mod = await import("../components/certificate.jsx");
  Certificates = mod.default;
});

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  localStorage.clear();
});

describe("Certificates page — API integration", () => {
  it("fetches certificates on mount with the stored auth token", async () => {
    mockFetch([]);
    render(<Certificates />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/study/certificates",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });
  });

  it("shows a loading message while fetching", () => {
    // Fetch never resolves
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<Certificates />);
    expect(screen.getByText(/loading certificates/i)).toBeInTheDocument();
  });

  it("shows empty state when API returns no certificates", async () => {
    mockFetch([]);
    render(<Certificates />);
    await waitFor(() =>
      expect(screen.getByText(/no certificates yet/i)).toBeInTheDocument()
    );
  });

  it("renders a card for each certificate", async () => {
    mockFetch(MOCK_CERTS);
    render(<Certificates />);
    await waitFor(() => {
      expect(screen.getByText("ECDIS Fundamentals")).toBeInTheDocument();
      expect(screen.getByText("Firefighting & Fire Prevention")).toBeInTheDocument();
    });
  });

  it("displays certificate number on each card", async () => {
    mockFetch(MOCK_CERTS);
    render(<Certificates />);
    await waitFor(() => {
      expect(screen.getByText(/#MAR-A1B2C3D4/)).toBeInTheDocument();
    });
  });

  it("shows the earned count in the page subtitle", async () => {
    mockFetch(MOCK_CERTS);
    render(<Certificates />);
    await waitFor(() => {
      // The cert-count-earned span specifically holds the count
      const earned = document.querySelector(".cert-count-earned");
      expect(earned).not.toBeNull();
      expect(earned.textContent).toBe("2");
    });
  });

  it("opens the preview modal when the PDF action button is clicked", async () => {
    mockFetch(MOCK_CERTS);
    render(<Certificates />);

    // Expand the first card
    await waitFor(() =>
      expect(screen.getByText("ECDIS Fundamentals")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("ECDIS Fundamentals"));

    // Click the PDF button inside the expanded card
    await waitFor(() => screen.getByText("PDF"));
    fireEvent.click(screen.getByText("PDF"));

    await waitFor(() =>
      expect(screen.getByTestId("cert-template")).toBeInTheDocument()
    );
  });

  it("closes the modal when Close is clicked", async () => {
    mockFetch(MOCK_CERTS);
    render(<Certificates />);

    await waitFor(() =>
      expect(screen.getByText("ECDIS Fundamentals")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("ECDIS Fundamentals"));
    await waitFor(() => screen.getByText("PDF"));
    fireEvent.click(screen.getByText("PDF"));

    await waitFor(() =>
      expect(screen.getByTestId("cert-template")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("Close"));
    await waitFor(() =>
      expect(screen.queryByTestId("cert-template")).not.toBeInTheDocument()
    );
  });

  it("calls downloadCertificatePDF when Download PDF is clicked in modal", async () => {
    mockFetch(MOCK_CERTS);
    render(<Certificates />);

    await waitFor(() =>
      expect(screen.getByText("ECDIS Fundamentals")).toBeInTheDocument()
    );
    fireEvent.click(screen.getByText("ECDIS Fundamentals"));
    await waitFor(() => screen.getByText("PDF"));
    fireEvent.click(screen.getByText("PDF"));

    await waitFor(() => screen.getByText("Download PDF"));
    fireEvent.click(screen.getByText("Download PDF"));

    await waitFor(() => expect(mockDownloadPDF).toHaveBeenCalledTimes(1));
    const [, filename] = mockDownloadPDF.mock.calls[0];
    expect(filename).toContain("MAR-A1B2C3D4");
  });
});
