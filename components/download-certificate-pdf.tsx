"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveCertificatePdf } from "@/lib/client-certificate-pdf";

export function DownloadCertificatePdf({ filename, label = "Download draft PDF" }: {
  filename: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await saveCertificatePdf(filename);
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
