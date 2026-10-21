// Page builder: the blocks a page is made of.
//
// A page layout is an ordered list of blocks, saved in site_content under
// "layout:<page>" (built-in pages) or "layout:c:<slug>" (custom pages).
// "section" blocks are the website's own built-in sections (hero, services
// grid, projects…) and can be moved or hidden; every other block type is a
// free block staff can add, edit, move and delete.

export type BlockType =
  | "section"
  | "heading"
  | "text"
  | "image"
  | "imageText"
  | "gallery"
  | "cards"
  | "stats"
  | "banner"
  | "spacer"
  | "servicesGrid"
  | "projectsGrid"
  | "quickQuote";

export type CardItem = { title: string; text: string; image: string };
export type StatItem = { value: string; label: string };

export type Block = {
  id: string;
  type: BlockType;
  hidden?: boolean;
  props: Record<string, unknown>;
};

export type Layout = { blocks: Block[] };

export type PropField =
  | { key: string; label: string; kind: "text" | "textarea" | "image" | "link"; hint?: string }
  | { key: string; label: string; kind: "select"; options: { value: string; label: string }[] }
  | { key: string; label: string; kind: "images" }
  | { key: string; label: string; kind: "cards" }
  | { key: string; label: string; kind: "stats" };

export type BlockDef = {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  group: "Text & media" | "Layout" | "Live content";
  defaults: Record<string, unknown>;
  fields: PropField[];
};

const BG = { key: "background", label: "Background", kind: "select" as const, options: [
  { value: "dark", label: "Dark" },
  { value: "darker", label: "Darker" },
  { value: "orange", label: "Orange" },
] };
const ALIGN = { key: "align", label: "Alignment", kind: "select" as const, options: [
  { value: "left", label: "Left" },
  { value: "center", label: "Centre" },
] };

export const BLOCK_DEFS: BlockDef[] = [
  {
    type: "heading",
    label: "Heading",
    description: "Small label, big title and a line of text.",
    icon: "H",
    group: "Text & media",
    defaults: { eyebrow: "Section label", title: "A clear heading", text: "One or two sentences that explain this part of the page.", align: "left", background: "dark" },
    fields: [
      { key: "eyebrow", label: "Small label", kind: "text" },
      { key: "title", label: "Title", kind: "text" },
      { key: "text", label: "Text", kind: "textarea" },
      ALIGN,
      BG,
    ],
  },
  {
    type: "text",
    label: "Text",
    description: "Paragraphs of text with an optional title.",
    icon: "¶",
    group: "Text & media",
    defaults: { title: "", body: "Write your text here. Leave an empty line between paragraphs.", background: "dark" },
    fields: [
      { key: "title", label: "Title (optional)", kind: "text" },
      { key: "body", label: "Text", kind: "textarea", hint: "Leave an empty line between paragraphs." },
      BG,
    ],
  },
  {
    type: "image",
    label: "Photo",
    description: "One large photo with a caption.",
    icon: "▣",
    group: "Text & media",
    defaults: { url: "/images/stock/factory-hall.jpg", caption: "", size: "wide" },
    fields: [
      { key: "url", label: "Photo", kind: "image" },
      { key: "caption", label: "Caption", kind: "text" },
      { key: "size", label: "Size", kind: "select", options: [{ value: "wide", label: "Page width" }, { value: "full", label: "Edge to edge" }] },
    ],
  },
  {
    type: "imageText",
    label: "Photo + text",
    description: "Photo on one side, text and a button on the other.",
    icon: "◧",
    group: "Text & media",
    defaults: {
      url: "/images/stock/welding-sparks.jpg",
      eyebrow: "",
      title: "Built in our Musaffah workshop",
      body: "Explain this work in a few sentences.",
      buttonLabel: "Request a quote",
      buttonHref: "/quote",
      side: "left",
      background: "dark",
    },
    fields: [
      { key: "url", label: "Photo", kind: "image" },
      { key: "eyebrow", label: "Small label", kind: "text" },
      { key: "title", label: "Title", kind: "text" },
      { key: "body", label: "Text", kind: "textarea" },
      { key: "buttonLabel", label: "Button text (leave empty for no button)", kind: "text" },
      { key: "buttonHref", label: "Button link", kind: "link" },
      { key: "side", label: "Photo side", kind: "select", options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }] },
      BG,
    ],
  },
  {
    type: "gallery",
    label: "Gallery",
    description: "A grid of photos that open full screen.",
    icon: "▦",
    group: "Text & media",
    defaults: {
      title: "Gallery",
      images: ["/images/showcase/gate-1.jpg", "/images/showcase/fence-1.jpg", "/images/showcase/pergola-1.jpg", "/images/showcase/stair-1.jpg"],
    },
    fields: [
      { key: "title", label: "Title (optional)", kind: "text" },
      { key: "images", label: "Photos", kind: "images" },
    ],
  },
  {
    type: "cards",
    label: "Cards",
    description: "Two to six boxes, each with a photo, title and text.",
    icon: "▤",
    group: "Layout",
    defaults: {
      title: "What we offer",
      items: [
        { title: "Fabrication", text: "Cut, welded and finished in our workshop.", image: "/images/stock/grinder-sparks.jpg" },
        { title: "Installation", text: "Erected on site by our own team.", image: "/images/stock/steel-roof-frame.jpg" },
        { title: "Detailing", text: "Shop drawings prepared before steel is cut.", image: "/images/stock/laser-cutter.jpg" },
      ],
      background: "darker",
    },
    fields: [{ key: "title", label: "Title (optional)", kind: "text" }, { key: "items", label: "Cards", kind: "cards" }, BG],
  },
  {
    type: "stats",
    label: "Numbers",
    description: "A row of big numbers with labels.",
    icon: "#",
    group: "Layout",
    defaults: {
      items: [
        { value: "2010", label: "Established" },
        { value: "5", label: "Core disciplines" },
        { value: "UAE", label: "Projects across the Emirates" },
      ],
      background: "orange",
    },
    fields: [{ key: "items", label: "Numbers", kind: "stats" }, BG],
  },
  {
    type: "banner",
    label: "Photo banner",
    description: "Full-width photo with a big title and a button.",
    icon: "▬",
    group: "Layout",
    defaults: {
      url: "/images/stock/steel-erection.jpg",
      title: "Ready to start your project?",
      text: "Send your drawings and our team will reply with a quotation.",
      buttonLabel: "Request a quote",
      buttonHref: "/quote",
    },
    fields: [
      { key: "url", label: "Background photo", kind: "image" },
      { key: "title", label: "Title", kind: "text" },
      { key: "text", label: "Text", kind: "textarea" },
      { key: "buttonLabel", label: "Button text", kind: "text" },
      { key: "buttonHref", label: "Button link", kind: "link" },
    ],
  },
  {
    type: "spacer",
    label: "Space",
    description: "Empty space or a divider line between blocks.",
    icon: "↕",
    group: "Layout",
    defaults: { size: "medium", line: "no" },
    fields: [
      { key: "size", label: "Height", kind: "select", options: [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }] },
      { key: "line", label: "Divider line", kind: "select", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
    ],
  },
  {
    type: "servicesGrid",
    label: "Services",
    description: "Your services as photo cards. Updates automatically.",
    icon: "⚙",
    group: "Live content",
    defaults: { title: "Our services" },
    fields: [{ key: "title", label: "Title", kind: "text" }],
  },
  {
    type: "projectsGrid",
    label: "Projects",
    description: "Your latest projects. Updates automatically.",
    icon: "◫",
    group: "Live content",
    defaults: { title: "Recent projects", count: "3" },
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "count", label: "How many", kind: "select", options: [{ value: "3", label: "3" }, { value: "6", label: "6" }, { value: "9", label: "9" }] },
    ],
  },
  {
    type: "quickQuote",
    label: "Quote form",
    description: "Short request form that leads to the full quote page.",
    icon: "✉",
    group: "Live content",
    defaults: { title: "Start your request", text: "Tell us what you need and we will get back to you." },
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "text", label: "Text", kind: "textarea" },
    ],
  },
];

export const blockDef = (type: BlockType) => BLOCK_DEFS.find((d) => d.type === type);

/** The built-in sections each page is made of, in their original order. */
export const BUILT_IN: Record<string, { key: string; label: string }[]> = {
  home: [
    { key: "hero", label: "Hero (big photo and headline)" },
    { key: "ticker", label: "Moving services strip" },
    { key: "clients", label: "Client logos" },
    { key: "about", label: "About the yard" },
    { key: "services", label: "Services cards" },
    { key: "band", label: "Photo statement band" },
    { key: "projects", label: "Selected projects" },
    { key: "process", label: "How a project runs" },
    { key: "quality", label: "Certifications" },
    { key: "faq", label: "Questions" },
    { key: "contact", label: "Contact and quick quote" },
  ],
  services: [
    { key: "hero", label: "Page header" },
    { key: "main", label: "Service list" },
    { key: "capabilities", label: "Explore our capabilities" },
    { key: "faq", label: "Questions" },
    { key: "cta", label: "Contact banner" },
  ],
  projects: [
    { key: "hero", label: "Page header" },
    { key: "main", label: "Project list with filters" },
    { key: "showcase", label: "Fabrication showcase" },
    { key: "cta", label: "Contact banner" },
  ],
  about: [
    { key: "hero", label: "Page header" },
    { key: "main", label: "Company, workshop, clients and process" },
    { key: "cta", label: "Contact banner" },
  ],
  quality: [
    { key: "hero", label: "Page header" },
    { key: "main", label: "Quality approach and certificates" },
    { key: "cta", label: "Contact banner" },
  ],
  contact: [
    { key: "hero", label: "Page header" },
    { key: "main", label: "Contact details, map and questions" },
  ],
};

export function defaultLayout(page: string): Layout {
  return { blocks: (BUILT_IN[page] ?? []).map((s) => ({ id: `s-${s.key}`, type: "section", props: { key: s.key } })) };
}

/** Saved layout merged with code: built-in sections missing from it are added at the end. */
export function resolveLayout(page: string, saved: Layout | null): Block[] {
  const base = saved?.blocks?.length ? saved.blocks : defaultLayout(page).blocks;
  const present = new Set(base.filter((b) => b.type === "section").map((b) => String(b.props.key)));
  const missing = (BUILT_IN[page] ?? [])
    .filter((s) => !present.has(s.key))
    .map((s) => ({ id: `s-${s.key}`, type: "section" as const, props: { key: s.key } }));
  return [...base, ...missing];
}

// ---------------------------------------------------------------------------
// Custom pages ("Add a page" in the builder), list saved under "pages:custom".

export type CustomPage = { slug: string; title: string; description: string; inMenu: boolean };

export const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
