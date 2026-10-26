"use client";

import { useEffect, useRef, useState } from "react";
import { saveCertificatePdf } from "@/lib/client-certificate-pdf";

export function FinalCertificateOutput({ mode, filename, returnHref }: {
  mode: "print" | "download";
  filename: string;
  returnHref: string;
}) {
  const started = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    async function output() {
      if (mode === "download") {
        await saveCertificatePdf(filename, { title: "Final certificate", subject: "Certificate of registration" });
      } else {
        await document.fonts.ready;
        await Promise.all(Array.from(document.querySelectorAll<HTMLImageElement>(".certificate-designed img"), (image) => image.decode().catch(() => undefined)));
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        window.print();
      }
      window.location.replace(`${returnHref}?output_complete=1`);
    }
    void output().catch((error) => {
      console.error("Could not prepare final certificate", error);
      setFailed(true);
    });
  }, [filename, mode, returnHref]);

  return failed
    ? <p role="alert" className="text-sm text-[#9b3e32]">Could not prepare this copy. <a className="underline" href={returnHref}>Return to the certificate record</a> to request another copy.</p>
    : <p role="status" className="text-sm font-semibold text-[#0d2a3d]">{mode === "download" ? "Preparing final PDF…" : "Preparing final print…"}</p>;
}
