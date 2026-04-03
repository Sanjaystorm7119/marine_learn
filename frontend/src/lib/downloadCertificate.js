import html2pdf from "html2pdf.js";

export async function downloadCertificatePDF(domElement, fileName = "certificate.pdf") {
  const options = {
    margin: 5,
    filename: fileName,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
  };
  await html2pdf().set(options).from(domElement).save();
}
