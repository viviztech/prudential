export const CERTIFICATION_CATALOG = [
  { code: "9001", name: "ISO 9001", description: "Quality management", prefix: "PASQM" },
  { code: "14001", name: "ISO 14001", description: "Environmental management", prefix: "PASEM" },
  { code: "18001", name: "OHSAS 18001", description: "Occupational health and safety", prefix: "PASOH" },
  { code: "22000", name: "ISO 22000", description: "Food safety management", prefix: "PASFS" },
  { code: "27001", name: "ISO 27000", description: "Information security management", prefix: "PASIS" },
  { code: "GMP", name: "GMP", description: "Good manufacturing practice", prefix: "PASGM" },
  { code: "HACCP", name: "HACCP", description: "Food safety hazard control", prefix: "PASHA" },
  { code: "CE", name: "CE", description: "European conformity", prefix: "PASCE" },
  { code: "ROHS", name: "ROHS", description: "Restriction of hazardous substances", prefix: "PASRO" },
  { code: "GREEN", name: "GREEN", description: "Green certification", prefix: "PASGR" },
  { code: "13485", name: "ISO 13485", description: "Medical devices quality management", prefix: "PASMD" },
  { code: "SA8000", name: "SA 8000", description: "Social accountability", prefix: "PASSA" },
  { code: "45001", name: "ISO 45001", description: "Occupational health and safety", prefix: "PASOH" },
  { code: "20001", name: "ISO 20001", description: "Information technology service management", prefix: "PASIT" },
  { code: "17024", name: "ISO 17024:2017", description: "Personnel certification", prefix: "PASCS" },
] as const;

export const CERTIFICATION_NAMES = CERTIFICATION_CATALOG.map((item) => item.name);
