import type {
  Company,
  Service,
  Project,
  Faq,
  Highlight,
  ProcessStep,
  Certification,
  CompanyDocument,
  BlogPost,
  ClientLogo,
} from "./types";

// Single source for the initial content. `scripts/seed-sql.ts` turns this
// file into the SQL seed that loads Supabase, and CONTENT_SOURCE=seed makes
// the site read it directly (offline builds and automated tests).
//
// Every statement here is traceable to company material (the original
// WordPress copy, the live site's own data) — see docs/AUDIT.md. Items that
// still need the owner's confirmation are listed in docs/CHECKLIST.md.

// Photos are served from the CMS media bucket when NEXT_PUBLIC_MEDIA_BASE is
// set (deployments); the local copies in /public keep offline builds working.
const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE?.replace(/\/$/, "");
const media = (local: string, remote: string) => (MEDIA_BASE ? `${MEDIA_BASE}/${remote}` : local);

export const WORK_PHOTOS = {
  steelFrame: {
    src: media("/images/work/steel-frame-yard.webp", "site/steel-frame-yard.jpg"),
    alt: "Fabricated steel frame with a vertical tank in the workshop yard",
    width: 640,
    height: 853,
  },
  tankFrame: {
    src: media("/images/work/tank-frame-yard.webp", "site/tank-frame-yard.jpg"),
    alt: "Blue tank installed in a fabricated steel support frame in the workshop yard",
    width: 576,
    height: 768,
  },
} as const;

export const company: Company = {
  name: "Al Saqr Al Ahmar Welding and Blacksmith LLC",
  tagline:
    "Structural steel, pipeline welding, CNC cutting, storage containers and stainless steel fabrication from Musaffah Industrial 44, Abu Dhabi.",
  heroTitle: "Precision Steelwork. Built Around Your Project.",
  heroSubtitle:
    "Structural steel, pipeline welding, laser and CNC cutting, storage containers and stainless steel fabrication — from our workshop in Musaffah Industrial 44, Abu Dhabi, for contractors, engineers and industrial clients across the UAE.",
  aboutTitle: "A steel fabrication workshop in Musaffah, established in 2010",
  aboutBody:
    "Al Saqr Al Ahmar Welding and Blacksmith LLC was established in 2010 to provide engineering services focused on steel structures. From our workshop in the Elite Business Investment Zone, Musaffah Industrial 44, we fabricate and install structural steelwork and provide CNC profiling.\n\nOur engineering personnel prepare drawings and detailing on current design software, and our workshop team carries the work through cutting, fabrication and installation.",
  establishedYear: 2010,
  address:
    "Elite Business Investment Zone, Plot 10, Store B59, Musaffah Industrial 44, Abu Dhabi, UAE",
  phones: [
    { display: "+971 55 927 0303", e164: "+971559270303" },
    { display: "+971 52 756 0303", e164: "+971527560303" },
  ],
  whatsapp: "971559270303",
  email: "quotes@alsaqrsteels.com",
  hours: "Saturday to Thursday, 08:00–18:00. Friday by appointment.",
  facebookUrl: "https://www.facebook.com/profile.php?id=61575231033422",
  instagramUrl: "https://www.instagram.com/alsaqrsteels",
  mapsUrl: "https://www.google.com/maps?q=Musaffah+Industrial+44,+Abu+Dhabi,+UAE",
  logoUrl: "/brand/logo-horizontal.png",
};

export const services: Service[] = [
  {
    slug: "steel-structures",
    number: "01",
    title: "Steel Structures",
    summary:
      "Fabrication and installation of structural steelwork for industrial and residential buildings, plant structures, workshops and warehouses.",
    intro:
      "We fabricate and install structural steel for residential and industrial buildings, plant structures, workshops and warehouses. Drawings and detailing are prepared before fabrication, and our team carries the work through to installation on site.",
    scope: [
      "Platforms and saddles",
      "Monorails and crane girders",
      "Column shutters and handrails",
      "Gratings and ladders",
      "Steel beams",
    ],
    applications: [
      "Industrial buildings",
      "Plant structures",
      "Workshops and warehouses",
      "Residential buildings",
    ],
    illustration: "ibeam",
    image: WORK_PHOTOS.steelFrame,
    seoTitle: "Structural Steel Fabrication & Installation in Abu Dhabi",
    seoDescription:
      "Structural steel fabrication and installation — platforms, saddles, crane girders, monorails, handrails, gratings, ladders and beams — from our Musaffah workshop.",
  },
  {
    slug: "pipeline-welding",
    number: "02",
    title: "Pipeline Welding",
    summary:
      "Welding and fabrication of pipeline components, supports, clamps, hangers and pipe racks for onshore and offshore oil and gas facilities.",
    intro:
      "We weld and fabricate pipeline components and the steel that carries them — supports, brackets, clamps, hangers and pipe racks — for onshore and offshore oil and gas fields and facilities.",
    scope: [
      "Pipeline components",
      "Supports and brackets",
      "Clamps and hangers",
      "Pipeline racks",
    ],
    applications: [
      "Onshore oil and gas fields and facilities",
      "Offshore oil and gas fields and facilities",
    ],
    illustration: "pipe",
    image: null,
    seoTitle: "Pipeline Welding, Pipe Supports & Pipe Racks — Abu Dhabi",
    seoDescription:
      "Pipeline components, supports, brackets, clamps, hangers and pipe racks welded and fabricated for onshore and offshore oil and gas facilities.",
  },
  {
    slug: "laser-cnc-cutting",
    number: "03",
    title: "Laser & CNC Cutting",
    summary:
      "CNC water jet, laser, sheet perforation and oxy-fuel cutting of plate and sheet to your drawings.",
    intro:
      "Profiling is done on CNC equipment in our workshop, so cut parts go straight into fabrication. We cut plate and sheet to drawing using water jet, laser, perforation and oxy-fuel processes.",
    scope: [
      "CNC water jet cutting",
      "CNC laser cutting",
      "CNC sheet perforation",
      "CNC oxy/fuel cutting",
    ],
    applications: [
      "Components for structural and pipeline fabrication",
      "Plate and sheet cut to drawing",
      "Perforated sheet",
    ],
    illustration: "cnc",
    image: null,
    seoTitle: "CNC Laser, Water Jet & Oxy-Fuel Cutting — Musaffah, Abu Dhabi",
    seoDescription:
      "CNC water jet, laser, sheet perforation and oxy-fuel cutting of plate and sheet to drawing, in our Musaffah workshop.",
  },
  {
    slug: "storage-containers",
    number: "04",
    title: "Storage Containers",
    summary:
      "Fabrication of fuel tanks, cement silos, skips, tube tanks and related storage items, including items for onshore and offshore use.",
    intro:
      "We fabricate tanks, silos, skips and other storage items, including DNV onshore and offshore items where a project calls for them.",
    scope: [
      "Fuel tanks and cement silos",
      "Skips and tube tanks",
      "Water foundation facilities",
      "DNV onshore and offshore items",
    ],
    applications: [
      "Industrial and construction sites",
      "Onshore and offshore facilities",
    ],
    illustration: "tank",
    image: WORK_PHOTOS.tankFrame,
    seoTitle: "Fuel Tanks, Silos, Skips & Storage Containers — Abu Dhabi",
    seoDescription:
      "Fabrication of fuel tanks, cement silos, skips, tube tanks, water foundation facilities and DNV onshore and offshore items.",
  },
  {
    slug: "stainless-steel",
    number: "05",
    title: "Stainless Steel",
    summary:
      "Stainless steel handrails, ladders, table panels and gratings, plus containers, tanks, baskets and skids.",
    intro:
      "Our stainless steel work covers architectural and access items — handrails, ladders, table panels and gratings — and containers, tanks, baskets and skids, including DNV items.",
    scope: [
      "Handrails and ladders",
      "Table panels and gratings",
      "DNV containers and tanks",
      "DNV baskets and skids",
    ],
    applications: ["Industrial facilities", "Onshore and offshore facilities"],
    illustration: "rail",
    image: null,
    seoTitle: "Stainless Steel Fabrication — Handrails, Gratings, Tanks & Skids",
    seoDescription:
      "Stainless steel handrails, ladders, table panels, gratings, containers, tanks, baskets and skids fabricated in Abu Dhabi.",
  },
];

const STEEL_SCOPE = "Structural steel fabrication and erection";

export const projects: Project[] = [
  {
    slug: "taweelah-gas-compressor-station",
    code: "PRJ-01",
    title: "Taweelah Gas Compressor Station",
    location: "Taweelah, Abu Dhabi",
    emirate: "Abu Dhabi",
    sector: "Oil & gas",
    status: "completed",
    scope: STEEL_SCOPE,
    description:
      "Structural steel fabrication and erection for a gas compressor station at Taweelah.",
    services: ["steel-structures"],
    clientName: null,
    year: null,
    featured: true,
    images: [],
  },
  {
    slug: "al-hayl-road-improvement",
    code: "PRJ-02",
    title: "Al Hayl Road Improvement",
    location: "Al Hayl, Fujairah",
    emirate: "Fujairah",
    sector: "Infrastructure",
    status: "completed",
    scope: STEEL_SCOPE,
    description:
      "Structural steel fabrication and erection for the Al Hayl road improvement project in Fujairah.",
    services: ["steel-structures"],
    clientName: null,
    year: null,
    featured: true,
    images: [],
  },
  {
    slug: "al-raha-beach-development",
    code: "PRJ-03",
    title: "Al Raha Beach Development",
    location: "Al Raha Beach, Abu Dhabi",
    emirate: "Abu Dhabi",
    sector: "Residential & commercial",
    status: "completed",
    scope: STEEL_SCOPE,
    description:
      "Structural steel fabrication and erection for the Al Raha Beach development.",
    services: ["steel-structures"],
    clientName: null,
    year: null,
    featured: true,
    images: [],
  },
  {
    slug: "burj-vista",
    code: "PRJ-04",
    title: "Burj Vista",
    location: "Dubai",
    emirate: "Dubai",
    sector: "Residential & commercial",
    status: "ongoing",
    scope: STEEL_SCOPE,
    description: "Structural steel fabrication and erection at Burj Vista, Dubai.",
    services: ["steel-structures"],
    clientName: null,
    year: null,
    featured: false,
    images: [],
  },
  {
    slug: "ittihad-paper-mill",
    code: "PRJ-05",
    title: "Ittihad Paper Mill",
    location: "Abu Dhabi",
    emirate: "Abu Dhabi",
    sector: "Industrial",
    status: "completed",
    scope: STEEL_SCOPE,
    description: "Structural steel fabrication and erection for Ittihad Paper Mill.",
    services: ["steel-structures"],
    clientName: null,
    year: null,
    featured: true,
    images: [],
  },
  {
    slug: "zirku-island-development",
    code: "PRJ-06",
    title: "Zirku Island Development",
    location: "Zirku Island, Abu Dhabi",
    emirate: "Abu Dhabi",
    sector: "Oil & gas",
    status: "completed",
    scope: STEEL_SCOPE,
    description:
      "Structural steel fabrication and erection for the Zirku Island development.",
    services: ["steel-structures"],
    clientName: null,
    year: null,
    featured: false,
    images: [],
  },
  {
    slug: "dmcc-cluster-car-park-extension",
    code: "PRJ-07",
    title: "DMCC Cluster Car Park Extension",
    location: "Dubai",
    emirate: "Dubai",
    sector: "Residential & commercial",
    status: "ongoing",
    scope: STEEL_SCOPE,
    description:
      "Structural steel fabrication and erection for a cluster car park extension in DMCC, Dubai.",
    services: ["steel-structures"],
    clientName: null,
    year: null,
    featured: false,
    images: [],
  },
];

export const faqs: Faq[] = [
  {
    id: "faq-what",
    scope: "general",
    question: "What does Al Saqr Al Ahmar fabricate?",
    answer:
      "Structural steel, pipeline components and supports, CNC-cut plate and sheet, storage containers such as tanks and silos, and stainless steel items such as handrails, ladders and gratings. Each service page lists the full scope.",
  },
  {
    id: "faq-where",
    scope: "general",
    question: "Where is your workshop, and which areas do you cover?",
    answer:
      "Our workshop is in the Elite Business Investment Zone, Musaffah Industrial 44, Abu Dhabi. We work on projects across the UAE — include your site location when you request a quote.",
  },
  {
    id: "faq-price",
    scope: "general",
    question: "Do you publish prices?",
    answer:
      "No. Every project is priced individually from its drawings and scope. Send a request and our team will review it and contact you.",
  },
  {
    id: "faq-design",
    scope: "general",
    question: "Can you prepare drawings and detailing?",
    answer:
      "Yes. Our engineering personnel prepare drawings and detailing on current design software before fabrication. Design responsibility for your project is agreed with our team as part of the quotation.",
  },
  {
    id: "faq-survey",
    scope: "general",
    question: "Do you visit the site before quoting?",
    answer:
      "For larger or more complex scopes we can arrange a site visit. Mention it in your request and our team will confirm.",
  },
  {
    id: "faq-include",
    scope: "quote",
    question: "What should I include in a quotation request?",
    answer:
      "The service you need, the project location and a short description of the scope. Drawings, a bill of quantities (BOQ), site photographs, dimensions, quantities and your target date all help our team respond accurately.",
  },
  {
    id: "faq-files",
    scope: "quote",
    question: "Which files can I attach?",
    answer:
      "PDF, JPG and PNG files — up to 5 files, 10 MB each and 25 MB in total. For larger drawing sets, attach the key sheets and mention that more are available.",
  },
  {
    id: "faq-after",
    scope: "quote",
    question: "What happens after I submit?",
    answer:
      "You receive a reference number straight away. Our team reviews your request and contacts you by phone or email. For urgent work, call us directly.",
  },
  {
    id: "faq-steel-install",
    scope: "steel-structures",
    question: "Do you install as well as fabricate?",
    answer:
      "Yes. Our scope covers fabrication and erection of structural steelwork. Describe the site conditions and access in your request.",
  },
  {
    id: "faq-steel-drawings",
    scope: "steel-structures",
    question: "Can I send architectural drawings rather than shop drawings?",
    answer:
      "Yes. Send the drawings you have; our team will tell you what further information is needed for detailing and pricing.",
  },
  {
    id: "faq-pipe-sites",
    scope: "pipeline-welding",
    question: "Do you work on onshore and offshore facilities?",
    answer:
      "Yes. Our pipeline work covers onshore and offshore oil and gas fields and facilities. Include the project specification with your request.",
  },
  {
    id: "faq-cnc-methods",
    scope: "laser-cnc-cutting",
    question: "Which cutting method will you use?",
    answer:
      "CNC water jet, laser, sheet perforation or oxy-fuel cutting, depending on the material and thickness. Tell us the material, thickness and quantity and our team will advise.",
  },
  {
    id: "faq-storage-types",
    scope: "storage-containers",
    question: "Which storage items do you fabricate?",
    answer:
      "Fuel tanks, cement silos, skips, tube tanks and water foundation facilities, including DNV onshore and offshore items. Share the specification your project requires.",
  },
  {
    id: "faq-ss-items",
    scope: "stainless-steel",
    question: "Which stainless steel items do you fabricate?",
    answer:
      "Handrails, ladders, table panels and gratings, as well as containers, tanks, baskets and skids.",
  },
];

export const highlights: Highlight[] = [
  { label: "Established", value: "2010", detail: "Fabricating from Musaffah, Abu Dhabi" },
  { label: "Workshop", value: "Musaffah Industrial 44", detail: "Elite Business Investment Zone" },
  { label: "Core disciplines", value: "5", detail: "Structural, pipeline, CNC, storage, stainless" },
  { label: "In-house", value: "Detailing & CNC", detail: "Drawings and profiling before fabrication" },
];

export const processSteps: ProcessStep[] = [
  {
    title: "Enquiry and documents",
    body: "Send the scope, site location and any drawings, BOQ or site photographs you have.",
  },
  {
    title: "Review and site visit",
    body: "Our team reviews the information and, where the scope needs it, arranges a site visit.",
  },
  {
    title: "Quotation",
    body: "We prepare a quotation. Price, programme and terms are confirmed by our team in writing.",
  },
  {
    title: "Detailing and approval",
    body: "Drawings and detailing are prepared and submitted for your approval before fabrication.",
  },
  {
    title: "Cutting and fabrication",
    body: "CNC profiling and fabrication in our Musaffah workshop.",
  },
  {
    title: "Delivery and installation",
    body: "Delivery to site, and installation where it forms part of the agreed scope.",
  },
];

// No certification is published until a current certificate in the company's
// name has been uploaded and marked verified in the CMS. See docs/AUDIT.md.
export const certifications: Certification[] = [];

export const documents: CompanyDocument[] = [];

export const blogPosts: BlogPost[] = [];

// Client logos already shown on the current alsaqrsteels.com ("Trusted by teams
// across UAE industry"). Staff can hide or reorder them in /admin/clients.
export const clientLogos: ClientLogo[] = (
  [
    ["ADNOC", "adnoc", 270, 120],
    ["Emaar", "emaar", 360, 72],
    ["GASCO", "gasco", 320, 82],
    ["SDIC", "sdic", 320, 114],
    ["Takreer", "takreer", 206, 120],
    ["Trane", "trane", 360, 73],
    ["Mada International", "mada", 320, 95],
  ] as const
).map(([name, file, width, height]) => ({
  name,
  logo: { src: `/images/clients/${file}.webp`, alt: `${name} logo`, width, height },
}));
