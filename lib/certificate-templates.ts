export type CertificateTemplate = {
  backgroundUrl: string;
  standardLabel: string;
  systemName: string;
};

const CERTIFICATE_TEMPLATES: Record<string, CertificateTemplate> = {
  "9001": {
    backgroundUrl: "/certificates/iso-9001.png",
    standardLabel: "ISO 9001:2015",
    systemName: "Quality Management System",
  },
  "14001": {
    backgroundUrl: "/certificates/iso-14001.png",
    standardLabel: "ISO 14001",
    systemName: "Environmental Management System",
  },
  "18001": {
    backgroundUrl: "/certificates/ohsas-18001.png",
    standardLabel: "OHSAS 18001",
    systemName: "Occupational Health and Safety Management System",
  },
  "22000": {
    backgroundUrl: "/certificates/iso-22000.png",
    standardLabel: "ISO 22000",
    systemName: "Food Safety Management System",
  },
  "27001": {
    backgroundUrl: "/certificates/iso-27001.png",
    standardLabel: "ISO 27001",
    systemName: "Information Security Management System",
  },
  GMP: {
    backgroundUrl: "/certificates/gmp.png",
    standardLabel: "GMP",
    systemName: "Good Manufacturing Practices",
  },
  HACCP: {
    backgroundUrl: "/certificates/haccp.png",
    standardLabel: "HACCP",
    systemName: "Food Safety Management System",
  },
  CE: {
    backgroundUrl: "/certificates/ce.png",
    standardLabel: "CE",
    systemName: "Product Conformity System",
  },
  ROHS: {
    backgroundUrl: "/certificates/rohs.png",
    standardLabel: "RoHS",
    systemName: "Product Compliance System",
  },
  GREEN: {
    backgroundUrl: "/certificates/green.png",
    standardLabel: "GREEN",
    systemName: "Environmental Sustainability Management System",
  },
  "13485": {
    backgroundUrl: "/certificates/iso-13485.png",
    standardLabel: "ISO 13485",
    systemName: "Medical Devices Quality Management System",
  },
  SA8000: {
    backgroundUrl: "/certificates/sa-8000.png",
    standardLabel: "SA 8000",
    systemName: "Social Accountability Management System",
  },
  "45001": {
    backgroundUrl: "/certificates/iso-45001.png",
    standardLabel: "ISO 45001",
    systemName: "Occupational Health and Safety Management System",
  },
  "20001": {
    backgroundUrl: "/certificates/iso-20001.png",
    standardLabel: "ISO 20001",
    systemName: "Information Technology Service Management System",
  },
  "17024": {
    backgroundUrl: "/certificates/iso-17024.png",
    standardLabel: "ISO 17024:2017",
    systemName: "Personnel Certification Management System",
  },
};

export function getCertificateTemplate(code: string): CertificateTemplate | null {
  return CERTIFICATE_TEMPLATES[code.toUpperCase()] ?? null;
}
