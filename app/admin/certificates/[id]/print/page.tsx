import Link from "@/components/native-link";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { CertificateDocument } from "@/components/certificate-document";
import { DownloadCertificatePdf } from "@/components/download-certificate-pdf";
import { CertificateOutputControls } from "@/components/certificate-output-controls";
import { FinalCertificateOutput } from "@/components/final-certificate-output";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { can } from "@/db/auth";
import { certificateOutputCookieName, consumeCertificateOutputTicket, getCertificateOutputAccess } from "@/db/certificate-outputs";
import { getCertificate, getCertificateDesignTemplate, getCertificateSettings } from "../../../../../db/runtime";
import PrintButton from "./print-button";
import { getAdminUser } from "@/app/admin-user";

type PrintProps = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CertificatePrintPage({ params }: PrintProps) {
  const { id } = await params;
  const user = await getAdminUser(`/admin/certificates/${id}/print`);
  const certificate = await getCertificate(id);
  if (!certificate) return <p>Certificate not found.</p>;
  const recordUrl = `/admin/certificates/${encodeURIComponent(id)}`;
  const isFinal = certificate.status === "printed" && Boolean(certificate.certificate_number);
  let outputMode: "print" | "download" | null = null;
  if (certificate.certificate_number || ["issued", "printed"].includes(certificate.status)) {
    if (!isFinal || !can(user, "print")) {
      return <Card className="mx-auto max-w-3xl"><CardHeader><CardTitle>Final certificate access</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-[#526b73]">{isFinal ? "Only an operator or admin can open a final certificate copy." : "Complete finalization from the certificate record before opening a final copy."}</p><Link className="font-semibold text-[#08766f] underline" href={recordUrl}>Back to certificate record</Link></CardContent></Card>;
    }
    const cookieName = certificateOutputCookieName(id);
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie")?.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith(`${cookieName}=`));
    const ticket = cookie?.slice(cookieName.length + 1);
    const grant = ticket ? await consumeCertificateOutputTicket(id, user, ticket) : null;
    if (!grant) {
      const access = await getCertificateOutputAccess(id, user);
      return <Card className="mx-auto max-w-3xl"><CardHeader><CardTitle>Final certificate copy</CardTitle></CardHeader><CardContent className="grid gap-5"><p className="m-0 text-sm text-[#526b73]">{certificate.company_name} · {certificate.certificate_number}</p><CertificateOutputControls certificateId={id} access={access} /><Link className="text-sm font-semibold text-[#08766f] underline" href={recordUrl}>Back to certificate record</Link></CardContent></Card>;
    }
    outputMode = grant.mode;
  }
  const [settings, template] = await Promise.all([
    getCertificateSettings(),
    getCertificateDesignTemplate(certificate.certification_code),
  ]);
  if (!template) return <p>Certificate template not found for {certificate.certification_name}.</p>;
  const qrCode = isFinal
    ? await QRCode.toDataURL(`https://prudentialiso.com/verify?certificate=${encodeURIComponent(certificate.certificate_number!)}`, { margin: 1, width: 240 })
    : null;

  return <main className="print-page">
    <div className="print-toolbar"><Link href={recordUrl}>Back to record</Link><div className="flex flex-wrap items-center gap-3">{outputMode ? <FinalCertificateOutput mode={outputMode} filename={`certificate-${certificate.certificate_number!.replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`} returnHref={recordUrl} /> : <><DownloadCertificatePdf filename={`draft-certificate-${certificate.certification_code.toLowerCase()}-${id}.pdf`} /><PrintButton /></>}</div></div>
    <CertificateDocument data={certificate} template={template} settings={settings} isFinal={isFinal} qrCode={qrCode} />
  </main>;
}
