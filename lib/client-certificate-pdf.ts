export async function saveCertificatePdf(filename: string, metadata: { title?: string; subject?: string } = {}) {
  const certificate = document.querySelector<HTMLElement>(".certificate-designed");
  if (!certificate) throw new Error("Certificate document is unavailable.");
  await document.fonts.ready;
  const frame = document.createElement("div");
  frame.setAttribute("aria-hidden", "true");
  Object.assign(frame.style, {
    position: "fixed", left: "-10000px", top: "0", width: "210mm", height: "297mm", pointerEvents: "none",
  });
  const copy = certificate.cloneNode(true) as HTMLElement;
  Object.assign(copy.style, { width: "210mm", height: "297mm", margin: "0", boxShadow: "none" });
  frame.appendChild(copy);
  document.body.appendChild(frame);
  try {
    await Promise.all(Array.from(copy.querySelectorAll("img"), (image) => image.decode().catch(() => undefined)));
    const [{ toPng }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
    const image = await toPng(copy, { backgroundColor: "#ffffff", cacheBust: true, pixelRatio: 2.5 });
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    pdf.setProperties({
      title: metadata.title ?? "Draft certificate", subject: metadata.subject ?? "Certificate preview", creator: "Prudential ISO",
    });
    pdf.addImage(image, "PNG", 0, 0, 210, 297);
    pdf.save(filename);
  } finally {
    frame.remove();
  }
}
