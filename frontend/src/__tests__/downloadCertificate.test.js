import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock html2pdf.js before importing the module under test
const mockSave = vi.fn().mockResolvedValue(undefined);
const mockFrom = vi.fn().mockReturnThis();
const mockSet  = vi.fn().mockReturnThis();
const mockInstance = { set: mockSet, from: mockFrom, save: mockSave };
mockSet.mockReturnValue(mockInstance);
mockFrom.mockReturnValue(mockInstance);

vi.mock("html2pdf.js", () => ({
  default: vi.fn(() => mockInstance),
}));

import { downloadCertificatePDF } from "../lib/downloadCertificate";
import html2pdf from "html2pdf.js";

describe("downloadCertificatePDF", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSet.mockReturnValue(mockInstance);
    mockFrom.mockReturnValue(mockInstance);
    mockSave.mockResolvedValue(undefined);
  });

  it("calls html2pdf() factory", async () => {
    const el = document.createElement("div");
    await downloadCertificatePDF(el, "test.pdf");
    expect(html2pdf).toHaveBeenCalledTimes(1);
  });

  it("sets landscape A4 jsPDF options", async () => {
    const el = document.createElement("div");
    await downloadCertificatePDF(el, "test.pdf");
    const options = mockSet.mock.calls[0][0];
    expect(options.jsPDF.orientation).toBe("landscape");
    expect(options.jsPDF.format).toBe("a4");
  });

  it("sets high-quality image options", async () => {
    const el = document.createElement("div");
    await downloadCertificatePDF(el, "cert.pdf");
    const options = mockSet.mock.calls[0][0];
    expect(options.image.quality).toBeGreaterThanOrEqual(0.9);
    expect(options.html2canvas.scale).toBeGreaterThanOrEqual(2);
  });

  it("uses the provided filename", async () => {
    const el = document.createElement("div");
    await downloadCertificatePDF(el, "certificate-MAR-A1B2C3D4.pdf");
    const options = mockSet.mock.calls[0][0];
    expect(options.filename).toBe("certificate-MAR-A1B2C3D4.pdf");
  });

  it("defaults to 'certificate.pdf' when no filename given", async () => {
    const el = document.createElement("div");
    await downloadCertificatePDF(el);
    const options = mockSet.mock.calls[0][0];
    expect(options.filename).toBe("certificate.pdf");
  });

  it("passes the DOM element to .from()", async () => {
    const el = document.createElement("div");
    el.id = "cert-root";
    await downloadCertificatePDF(el, "out.pdf");
    expect(mockFrom).toHaveBeenCalledWith(el);
  });

  it("calls .save() to trigger the download", async () => {
    const el = document.createElement("div");
    await downloadCertificatePDF(el, "out.pdf");
    expect(mockSave).toHaveBeenCalledTimes(1);
  });
});
