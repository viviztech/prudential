import Link from "@/components/native-link";
import QRCode from "qrcode";
import { CertificateDocument } from "@/components/certificate-document";
import { DownloadCertificatePdf } from "@/components/download-certificate-pdf";
import { getCertificate, getCertificateDesignTemplate, getCertificateSettings } from "../../../../../db/runtime";
import PrintButton from "./print-button";
import { getAdminUser } from "@/app/admin-user";

type PrintProps = { params: Promise<{ id: string }> };

export default async function CertificatePrintPage({ params }: PrintProps) {
  const { id } = await params;
  await getAdminUser(`/admin/certificates/${id}/print`);
  const certificate = await getCertificate(id);
  if (!certificate) return <p>Certificate not found.</p>;
  const [settings, template] = await Promise.all([
    getCertificateSettings(),
    getCertificateDesignTemplate(certificate.certification_code),
  ]);
  if (!template) return <p>Certificate template not found for {certificate.certification_name}.</p>;
  const isFinal = certificate.status === "printed" && Boolean(certificate.certificate_number);
  const qrCode = isFinal
    ? await QRCode.toDataURL(`https://prudentialiso.com/verify?certificate=${encodeURIComponent(certificate.certificate_number!)}`, { margin: 1, width: 240 })
    : null;

  return <main className="print-page">
    <div className="print-toolbar"><Link href={`/admin/certificates/${id}`}>Back to record</Link><div className="flex flex-wrap items-center gap-3">{!isFinal ? <DownloadCertificatePdf filename={`draft-certificate-${certificate.certification_code.toLowerCase()}-${id}.pdf`} /> : null}<PrintButton /></div></div>
    <CertificateDocument data={certificate} template={template} settings={settings} isFinal={isFinal} qrCode={qrCode} />
  </main>;
}
