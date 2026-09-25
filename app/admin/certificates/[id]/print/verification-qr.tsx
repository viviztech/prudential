"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function VerificationQr({ url }: { url: string }) {
  const [source, setSource] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(url, {
      margin: 0,
      width: 132,
      color: { dark: "#0b2b3d", light: "#fffdf8" },
      errorCorrectionLevel: "M",
    }).then((value) => {
      if (active) setSource(value);
    });
    return () => { active = false; };
  }, [url]);

  return source
    ? <img src={source} alt="QR code for certificate verification" />
    : <span className="qr-placeholder" aria-hidden="true">PAS</span>;
}
