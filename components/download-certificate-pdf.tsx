"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadCertificatePdf({ filename, label = "Download draft PDF" }: {
  filename: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    const certificate = document.querySelector<HTMLElement>(".certificate-designed");
    if (!certificate || busy) return;
    setBusy(true);
    setError("");
    try {
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
        const image = await toPng(copy, {
          backgroundColor: "#ffffff",
          cacheBust: true,
          pixelRatio: 2.5,
        });
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
        pdf.setProperties({ title: "Draft certificate", subject: "Certificate preview", creator: "Prudential ISO" });
        pdf.addImage(image, "PNG", 0, 0, 210, 297);
        pdf.save(filename);
      } finally {
        frame.remove();
      }
    } catch (cause) {
      console.error("Could not create certificate PDF", cause);
      setError("Could not create the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="flex flex-col items-end gap-1">
    <Button type="button" variant="outline" onClick={download} disabled={busy} aria-busy={busy}>
      <Download />{busy ? "Preparing PDF..." : label}
    </Button>
    {error ? <span role="alert" className="text-xs text-[#9b3e32]">{error}</span> : null}
  </div>;
}
