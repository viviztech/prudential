export type PublicCertification = {
  slug: string;
  code: string;
  name: string;
  title: string;
  category: "Management systems" | "Food and product assurance" | "People and responsibility";
  purpose: string;
  summary: string;
  outcome: string;
  benefits: string[];
  suitableFor: string[];
  focusAreas: string[];
  readiness: string[];
  related: string[];
  accent: "teal" | "amber" | "blue" | "plum";
  status?: "current" | "transition";
};

export const PUBLIC_CERTIFICATIONS: PublicCertification[] = [
  {
    slug: "iso-9001-quality-management", code: "ISO 9001:2026", name: "Quality management", title: "ISO 9001 Quality Management System Certification", category: "Management systems", accent: "teal",
    purpose: "Build consistent processes, stronger customer confidence and a practical system for continual improvement.",
    summary: "ISO 9001 sets requirements for a quality management system that connects customer needs, leadership, controlled processes, evidence and improvement. It applies to organizations of every size and sector.",
    outcome: "A working quality system that makes responsibilities visible, measures performance and turns recurring problems into managed improvement.",
    benefits: ["More consistent products and services", "Clearer ownership of critical processes", "Better handling of risks and opportunities", "Evidence for customer and tender requirements", "Structured corrective action", "A repeatable approach to continual improvement"],
    suitableFor: ["Manufacturers and engineering firms", "Professional and business services", "Construction and infrastructure", "Exporters and supply-chain vendors", "Healthcare and education providers", "Growing organizations formalizing operations"],
    focusAreas: ["Organizational context", "Leadership and quality policy", "Risk-based planning", "Resources and competence", "Operational control", "Performance evaluation", "Corrective action and improvement"],
    readiness: ["Defined certification scope", "Documented core processes", "Quality objectives and measures", "Internal audit completed", "Management review completed", "Nonconformities addressed"],
    related: ["iso-14001-environmental-management", "iso-45001-health-safety", "iso-13485-medical-devices"],
  },
  {
    slug: "iso-14001-environmental-management", code: "ISO 14001:2026", name: "Environmental management", title: "ISO 14001 Environmental Management System Certification", category: "Management systems", accent: "teal",
    purpose: "Manage environmental impacts, legal obligations, resources and improvement through one measurable system.",
    summary: "ISO 14001 provides a framework for identifying environmental aspects, controlling significant impacts and improving environmental performance across operations and the value chain.",
    outcome: "Environmental commitments become defined responsibilities, operational controls, measurable objectives and reviewable evidence.",
    benefits: ["Better control of waste, emissions and resource use", "Stronger environmental compliance processes", "Reduced exposure to environmental incidents", "Clearer supplier and lifecycle considerations", "Improved stakeholder confidence", "Easier integration with quality and safety systems"],
    suitableFor: ["Manufacturing and process industries", "Construction and infrastructure", "Logistics and warehousing", "Hospitality and healthcare", "Agriculture and food businesses", "Organizations with environmental permits or customer requirements"],
    focusAreas: ["Environmental aspects and impacts", "Compliance obligations", "Climate and business context", "Lifecycle perspective", "Operational controls", "Emergency preparedness", "Environmental performance evaluation"],
    readiness: ["Aspect-impact register", "Applicable legal requirements identified", "Environmental objectives", "Operational and emergency controls", "Monitoring evidence", "Internal audit and management review"],
    related: ["iso-9001-quality-management", "iso-45001-health-safety", "green-certification"],
  },
  {
    slug: "iso-45001-health-safety", code: "ISO 45001:2018", name: "Occupational health and safety", title: "ISO 45001 Occupational Health and Safety Certification", category: "Management systems", accent: "amber",
    purpose: "Create a systematic approach to hazards, worker participation and safer operating conditions.",
    summary: "ISO 45001 helps organizations identify hazards, assess occupational health and safety risks, involve workers and continually improve OH&S performance.",
    outcome: "Health and safety moves from reactive incident handling to planned risk control supported by workers and leadership.",
    benefits: ["Stronger hazard identification", "More consistent operational controls", "Better worker consultation and participation", "Reduced disruption from preventable incidents", "Clearer contractor safety expectations", "Evidence of responsible workplace governance"],
    suitableFor: ["Factories and industrial facilities", "Construction contractors", "Warehouses and logistics operations", "Engineering and maintenance providers", "Healthcare organizations", "Any workplace with material OH&S risks"],
    focusAreas: ["Hazards and OH&S risks", "Worker consultation", "Legal and other requirements", "Operational planning", "Emergency preparedness", "Incident investigation", "Performance monitoring"],
    readiness: ["Hazard and risk register", "Legal register", "Worker consultation evidence", "Emergency arrangements", "Incident and corrective-action records", "Internal audit and management review"],
    related: ["iso-9001-quality-management", "iso-14001-environmental-management", "ohsas-18001-migration"],
  },
  {
    slug: "iso-22000-food-safety", code: "ISO 22000:2018", name: "Food safety management", title: "ISO 22000 Food Safety Management System Certification", category: "Management systems", accent: "amber",
    purpose: "Control food-safety hazards across the food chain through communication, prerequisite programmes and HACCP principles.",
    summary: "ISO 22000 combines management-system discipline with food-safety hazard control for organizations involved directly or indirectly in the food chain.",
    outcome: "A traceable food-safety system linking hazards, controls, monitoring, verification, communication and continual improvement.",
    benefits: ["Systematic control of food-safety hazards", "Clearer communication across the food chain", "Better traceability and incident readiness", "Consistent prerequisite programmes", "Stronger customer and buyer assurance", "Integration with other management systems"],
    suitableFor: ["Food manufacturers", "Processors and packers", "Catering and hospitality", "Storage and transport providers", "Packaging manufacturers", "Feed and ingredient suppliers"],
    focusAreas: ["Food-chain communication", "Prerequisite programmes", "Hazard analysis", "Operational PRPs and CCPs", "Traceability", "Emergency response", "Validation and verification"],
    readiness: ["Defined food-safety team", "Product and process descriptions", "Flow diagrams verified", "Hazard-control plan", "Traceability test", "Internal audit and management review"],
    related: ["haccp-certification", "gmp-certification", "iso-9001-quality-management"],
  },
  {
    slug: "iso-iec-27001-information-security", code: "ISO/IEC 27001:2022", name: "Information security", title: "ISO/IEC 27001 Information Security Certification", category: "Management systems", accent: "blue",
    purpose: "Protect information through risk-led controls covering people, processes, technology and suppliers.",
    summary: "ISO/IEC 27001 defines requirements for an information security management system that identifies information risks and maintains appropriate, evidence-based controls.",
    outcome: "Information security decisions become risk-based, owned, documented and regularly tested rather than dependent on isolated technical measures.",
    benefits: ["Structured information-risk management", "Clear accountability for security controls", "Support for contractual and regulatory obligations", "Improved incident preparedness", "Greater customer and partner confidence", "Continual review of changing threats"],
    suitableFor: ["IT and software companies", "BPO and professional services", "Financial and healthcare organizations", "Cloud and managed-service providers", "Organizations handling customer data", "Businesses facing security clauses in contracts"],
    focusAreas: ["Information-risk assessment", "Statement of Applicability", "Access and identity controls", "Supplier security", "Incident management", "Business continuity alignment", "Monitoring and improvement"],
    readiness: ["Defined ISMS scope", "Asset and risk registers", "Risk-treatment plan", "Statement of Applicability", "Control evidence", "Internal audit and management review"],
    related: ["iso-iec-20000-1-it-service-management", "iso-9001-quality-management"],
  },
  {
    slug: "iso-13485-medical-devices", code: "ISO 13485:2016", name: "Medical-device quality", title: "ISO 13485 Medical Devices Quality Management Certification", category: "Management systems", accent: "blue",
    purpose: "Control medical-device quality across design, production, supplier management and regulatory activities.",
    summary: "ISO 13485 specifies quality-system requirements for organizations involved in one or more stages of the medical-device lifecycle.",
    outcome: "A documented, risk-aware quality system designed around medical-device safety, traceability and regulatory expectations.",
    benefits: ["More consistent lifecycle controls", "Stronger supplier oversight", "Improved traceability and record control", "Support for regulatory market access", "Systematic complaint and feedback handling", "Clear validation and risk-management evidence"],
    suitableFor: ["Medical-device manufacturers", "Component and material suppliers", "Contract manufacturers", "Sterilization providers", "Installation and servicing organizations", "Medical-device software businesses"],
    focusAreas: ["Regulatory requirements", "Risk management", "Design and development", "Supplier controls", "Process validation", "Traceability", "Complaint and advisory-notice processes"],
    readiness: ["Device and regulatory scope defined", "Quality manual and procedures", "Risk-management records", "Validation evidence", "Supplier controls", "Internal audit and management review"],
    related: ["iso-9001-quality-management", "ce-compliance"],
  },
  {
    slug: "iso-iec-20000-1-it-service-management", code: "ISO/IEC 20000-1:2018", name: "IT service management", title: "ISO/IEC 20000-1 IT Service Management Certification", category: "Management systems", accent: "blue",
    purpose: "Design, deliver and improve IT services through a controlled service-management system.",
    summary: "ISO/IEC 20000-1 defines requirements for planning, operating, monitoring and improving a service management system throughout the service lifecycle.",
    outcome: "IT services are governed through defined responsibilities, service agreements, operational controls and measured improvement.",
    benefits: ["More predictable service delivery", "Clearer service ownership", "Better incident and change control", "Stronger supplier coordination", "Evidence for enterprise customers", "Alignment between service objectives and business needs"],
    suitableFor: ["Managed-service providers", "Cloud and hosting providers", "Internal IT departments", "Software support operations", "Data centres", "Technology outsourcing businesses"],
    focusAreas: ["Service-management planning", "Service portfolio and agreements", "Incident and request management", "Change and release management", "Availability and continuity", "Supplier management", "Performance evaluation"],
    readiness: ["SMS scope and services defined", "Service agreements", "Process ownership", "Operational records", "Performance measures", "Internal audit and management review"],
    related: ["iso-iec-27001-information-security", "iso-9001-quality-management"],
  },
  {
    slug: "haccp-certification", code: "HACCP", name: "Food hazard control", title: "HACCP Food Safety Certification", category: "Food and product assurance", accent: "amber",
    purpose: "Identify significant food hazards and control them at the points that matter most.",
    summary: "Hazard Analysis and Critical Control Points is a preventive method for identifying biological, chemical and physical hazards and establishing effective controls.",
    outcome: "A practical hazard-control plan supported by monitoring limits, corrective actions, verification and records.",
    benefits: ["Preventive food-safety control", "Clear critical limits and responsibilities", "Faster response to deviations", "Better process discipline", "Stronger buyer confidence", "A foundation for broader food-safety systems"],
    suitableFor: ["Food processors", "Commercial kitchens", "Caterers", "Cold-chain operators", "Ingredient suppliers", "Packaging and storage operations"],
    focusAreas: ["Hazard analysis", "Critical control points", "Critical limits", "Monitoring", "Corrective action", "Verification", "Records"],
    readiness: ["HACCP team appointed", "Product descriptions", "Verified flow diagrams", "Hazard analysis", "Monitoring records", "Verification schedule"],
    related: ["iso-22000-food-safety", "gmp-certification"],
  },
  {
    slug: "gmp-certification", code: "GMP", name: "Good manufacturing practice", title: "Good Manufacturing Practice Certification", category: "Food and product assurance", accent: "amber",
    purpose: "Demonstrate controlled manufacturing conditions, hygiene, documentation and product consistency.",
    summary: "GMP assessment examines whether manufacturing activities are carried out under controlled conditions appropriate to the applicable product and scheme.",
    outcome: "Daily production practices are supported by defined hygiene, facility, equipment, personnel and documentation controls.",
    benefits: ["More consistent manufacturing controls", "Clear hygiene and housekeeping expectations", "Improved batch and record traceability", "Stronger contamination prevention", "Better staff discipline and competence", "Greater customer assurance"],
    suitableFor: ["Food and ingredient manufacturers", "Cosmetics businesses", "Packaging operations", "Consumer-product manufacturers", "Warehouses supporting controlled products", "Organizations subject to buyer GMP requirements"],
    focusAreas: ["Premises and hygiene", "Personnel practices", "Equipment maintenance", "Material control", "Production records", "Storage and distribution", "Complaints and recalls"],
    readiness: ["Applicable GMP scheme identified", "Facility controls", "Cleaning programme", "Training records", "Batch or production records", "Recall arrangements"],
    related: ["haccp-certification", "iso-22000-food-safety"],
  },
  {
    slug: "ce-compliance", code: "CE", name: "European product compliance", title: "CE Marking Compliance Assessment", category: "Food and product assurance", accent: "blue",
    purpose: "Understand the conformity route, technical evidence and declarations required before placing applicable products on the European market.",
    summary: "CE marking is a manufacturer’s declaration that an applicable product meets relevant European requirements. The required assessment route depends on the product and legislation.",
    outcome: "A clearly defined compliance route supported by applicable requirements, technical documentation, testing evidence and the correct declaration.",
    benefits: ["Clearer identification of applicable legislation", "Structured technical documentation", "Better control of product evidence", "Reduced risk of incomplete declarations", "Improved market-access preparation", "Defined responsibilities across the supply chain"],
    suitableFor: ["Machinery manufacturers", "Electrical and electronic products", "Medical-device businesses", "Importers and exporters", "Product designers", "Manufacturers entering European markets"],
    focusAreas: ["Applicable directives or regulations", "Conformity-assessment route", "Technical file", "Risk assessment", "Testing evidence", "Declaration of Conformity", "Marking and traceability"],
    readiness: ["Product and intended use defined", "Applicable legislation identified", "Standards selected", "Technical evidence assembled", "Economic-operator roles confirmed", "Declaration prepared"],
    related: ["rohs-compliance", "iso-13485-medical-devices"],
  },
  {
    slug: "rohs-compliance", code: "RoHS", name: "Restricted substances compliance", title: "RoHS Product Compliance Assessment", category: "Food and product assurance", accent: "teal",
    purpose: "Build evidence that applicable electrical and electronic products meet restricted-substance requirements.",
    summary: "RoHS compliance depends on product scope, material and supplier evidence, testing where appropriate, technical documentation and ongoing change control.",
    outcome: "Restricted-substance claims are supported by traceable supplier declarations, material evidence and controlled technical records.",
    benefits: ["Clearer product-scope decisions", "Improved supplier evidence", "Traceable material declarations", "Better control of component changes", "Stronger technical documentation", "Support for regulated market access"],
    suitableFor: ["Electronics manufacturers", "Electrical-equipment suppliers", "Component importers", "Contract manufacturers", "Product brands", "Exporters to regulated markets"],
    focusAreas: ["Product scope", "Restricted substances", "Supplier declarations", "Material risk assessment", "Testing strategy", "Technical documentation", "Change control"],
    readiness: ["Bill of materials available", "Supplier evidence collected", "High-risk materials identified", "Testing rationale documented", "Technical file maintained", "Change-notification process defined"],
    related: ["ce-compliance", "iso-14001-environmental-management"],
  },
  {
    slug: "sa-8000-social-accountability", code: "SA 8000", name: "Social accountability", title: "SA 8000 Social Accountability Certification", category: "People and responsibility", accent: "plum",
    purpose: "Strengthen workplace rights, responsible employment practices and supply-chain accountability.",
    summary: "SA 8000 is a social-accountability standard focused on workplace conditions, worker rights, management systems and continual improvement.",
    outcome: "Social commitments are translated into policies, worker communication, grievance mechanisms, monitoring and corrective action.",
    benefits: ["Clearer labour-practice expectations", "Stronger worker communication", "Improved grievance handling", "Better supply-chain oversight", "Evidence for responsible sourcing", "Structured improvement of workplace conditions"],
    suitableFor: ["Manufacturers and exporters", "Labour-intensive operations", "Apparel and consumer-goods supply chains", "Contract manufacturers", "Organizations facing responsible-sourcing requirements", "Businesses managing labour agencies"],
    focusAreas: ["Child and forced labour", "Health and safety", "Freedom of association", "Discrimination", "Working hours", "Remuneration", "Management systems"],
    readiness: ["Labour policies reviewed", "Worker records available", "Grievance process operating", "Health and safety controls", "Supplier expectations defined", "Internal monitoring completed"],
    related: ["iso-45001-health-safety", "iso-9001-quality-management"],
  },
  {
    slug: "green-certification", code: "GREEN", name: "Environmental performance scheme", title: "Green Certification Assessment", category: "People and responsibility", accent: "teal",
    purpose: "Evaluate defined environmental practices and communicate performance against a clearly stated scheme.",
    summary: "Green certification must be tied to a transparent scheme, criteria and scope. The assessment should make clear what has been evaluated and what the certificate does—and does not—claim.",
    outcome: "Environmental claims are connected to documented criteria, evidence, assessment scope and renewal expectations.",
    benefits: ["More disciplined environmental claims", "Visible assessment criteria", "Better collection of performance evidence", "Improved resource-use awareness", "Clear renewal expectations", "Stronger stakeholder communication"],
    suitableFor: ["Offices and service businesses", "Manufacturing facilities", "Hospitality organizations", "Educational institutions", "Retail and commercial premises", "Organizations beginning a sustainability programme"],
    focusAreas: ["Scheme and scope", "Energy and water", "Waste practices", "Purchasing", "Environmental awareness", "Performance evidence", "Claims and communications"],
    readiness: ["Scheme criteria confirmed", "Assessment boundary defined", "Utility and waste data", "Policies and action plans", "Supporting records", "Claims reviewed for accuracy"],
    related: ["iso-14001-environmental-management", "iso-9001-quality-management"],
  },
  {
    slug: "iso-iec-17024-personnel-certification", code: "ISO/IEC 17024:2026", name: "Personnel certification bodies", title: "ISO/IEC 17024 Personnel Certification Framework", category: "People and responsibility", accent: "plum",
    purpose: "Understand the requirements for organizations that operate certification schemes for people.",
    summary: "ISO/IEC 17024 applies to bodies that certify persons. It addresses impartiality, competence, examination, certification decisions and scheme governance; it is not a normal company management-system certificate.",
    outcome: "A personnel-certification scheme built around demonstrable competence, impartial decisions and consistent examination controls.",
    benefits: ["Clear scheme governance", "Consistent competence assessment", "Stronger impartiality controls", "Defensible examination processes", "Transparent certification decisions", "Internationally aligned personnel certification"],
    suitableFor: ["Professional certification bodies", "Trade and skills certification schemes", "Sector competence programmes", "Examination providers developing certification", "Industry associations", "Organizations certifying individual practitioners"],
    focusAreas: ["Impartiality", "Certification scheme governance", "Competence requirements", "Examination development", "Certification decisions", "Surveillance and recertification", "Complaints and appeals"],
    readiness: ["Scheme owner and scope defined", "Competence framework", "Examination controls", "Impartiality mechanism", "Decision process separated", "Appeals and complaints process"],
    related: ["iso-9001-quality-management"],
  },
  {
    slug: "ohsas-18001-migration", code: "OHSAS 18001", name: "Migration to ISO 45001", title: "OHSAS 18001 to ISO 45001 Migration Guidance", category: "People and responsibility", accent: "amber", status: "transition",
    purpose: "Understand why OHSAS 18001 is no longer current and how ISO 45001 changes occupational health and safety management.",
    summary: "OHSAS 18001 was replaced by ISO 45001 and withdrawn. Organizations should use ISO 45001 for current occupational health and safety management-system certification.",
    outcome: "Legacy references are identified and the organization plans against the leadership, context and worker-participation requirements of ISO 45001.",
    benefits: ["Removes obsolete certification references", "Aligns OH&S with a current international standard", "Strengthens leadership involvement", "Expands worker consultation", "Improves risk and opportunity planning", "Supports integration with ISO 9001 and ISO 14001"],
    suitableFor: ["Organizations with historic OHSAS records", "Buyers reviewing old supplier certificates", "Teams updating tender documentation", "Businesses moving to ISO 45001", "Auditors reviewing legacy systems", "Certificate holders checking current validity"],
    focusAreas: ["Current certification status", "Organizational context", "Leadership accountability", "Worker participation", "Risk and opportunity", "Operational control", "Migration evidence"],
    readiness: ["Legacy certificate reviewed", "Gap assessment against ISO 45001", "Leadership roles updated", "Worker consultation strengthened", "Documentation revised", "ISO 45001 audit planned"],
    related: ["iso-45001-health-safety", "iso-14001-environmental-management", "iso-9001-quality-management"],
  },
];

export const PUBLIC_CERTIFICATION_MAP = new Map(PUBLIC_CERTIFICATIONS.map((item) => [item.slug, item]));
export const CERTIFICATION_GROUPS = ["Management systems", "Food and product assurance", "People and responsibility"] as const;
