// Every page and section staff can edit from Admin → Pages, with the text the
// site shows when nothing has been changed. Admin builds its forms from this
// list and the site merges saved values over these defaults, so adding a field
// here makes it editable everywhere at once.
//
// Saved values live in the public.site_content table (key "page:<page>").

export type FieldType = "text" | "textarea" | "image";
export type FieldDef = { key: string; label: string; type: FieldType; default: string; hint?: string };
export type SectionDef = { key: string; label: string; hideable?: boolean; fields: FieldDef[]; note?: string };
export type PageDef = { key: string; label: string; path: string; sections: SectionDef[] };

const t = (key: string, label: string, d: string, hint?: string): FieldDef => ({ key, label, type: "text", default: d, hint });
const ta = (key: string, label: string, d: string, hint?: string): FieldDef => ({ key, label, type: "textarea", default: d, hint });
const img = (key: string, label: string, hint = "Leave empty to use the built-in photo."): FieldDef => ({ key, label, type: "image", default: "", hint });

/** Standard header block used by every inner page. */
const hero = (label: string, title: string, lede: string): SectionDef => ({
  key: "hero",
  label: "Page header",
  fields: [t("label", "Small label above the title", label), t("title", "Title", title), ta("lede", "Introduction", lede), img("image", "Background photo")],
});

export const PAGES: PageDef[] = [
  {
    key: "home",
    label: "Home",
    path: "/",
    sections: [
      {
        key: "hero",
        label: "Hero (top of page)",
        note: "The big headline and introduction are edited in Company details.",
        fields: [
          t("eyebrow", "Small label above the headline", "", "Leave empty to show “Est. year · workshop address”."),
          t("primaryCta", "Main button", "Request a Quote"),
          t("secondaryCta", "Second button", "Explore Our Projects"),
          img("image", "Background photo"),
        ],
      },
      { key: "ticker", label: "Moving services strip", hideable: true, fields: [] },
      { key: "clients", label: "Client logos", hideable: true, fields: [t("title", "Heading", "Trusted by teams across UAE industry"), t("subtitle", "Line under heading", "Across oil & gas, real estate and MEP.")] },
      {
        key: "about",
        label: "About the yard",
        hideable: true,
        note: "The heading and paragraphs are edited in Company details.",
        fields: [t("label", "Small label", "About the yard"), t("cta", "Button", "About the company"), t("link", "Link next to button", "Visit the workshop")],
      },
      {
        key: "services",
        label: "Services cards",
        hideable: true,
        fields: [
          t("label", "Small label", "Capabilities"),
          t("title", "Heading", "What we fabricate"),
          ta("intro", "Introduction", "Structural steel for residential and industrial buildings, plant structures, workshops and warehouses — with pipeline, CNC, storage and stainless work alongside."),
          t("ctaTitle", "“Not sure” card heading", "Send us the drawings"),
          ta("ctaText", "“Not sure” card text", "Describe the job or attach drawings and our team will tell you which discipline — or combination — it needs."),
        ],
      },
      {
        key: "band",
        label: "Photo statement band",
        hideable: true,
        fields: [
          t("label", "Small label", "From drawing to installation"),
          t("title", "Heading (first part)", "Cut, welded and"),
          t("highlight", "Heading (orange part)", "erected by one team."),
          ta("text", "Text", "Detailing, CNC profiling, fabrication and site erection stay under one roof — so the steel that arrives on site is the steel that was drawn."),
          img("image", "Background photo"),
        ],
      },
      {
        key: "projects",
        label: "Selected projects",
        hideable: true,
        fields: [t("label", "Small label", "Field work"), t("title", "Heading", "Selected projects"), ta("intro", "Introduction", "Structural steel fabrication and erection on projects across the UAE.")],
      },
      {
        key: "process",
        label: "How a project runs",
        hideable: true,
        note: "The steps themselves are edited in Company details → Project process.",
        fields: [
          t("label", "Small label", "How a project runs"),
          t("title", "Heading", "From your drawings to installation"),
          ta("intro", "Introduction", "A typical sequence. Every quotation confirms the exact scope, programme and responsibilities in writing."),
        ],
      },
      {
        key: "quality",
        label: "Certifications",
        hideable: true,
        fields: [
          t("label", "Small label", "Quality & compliance"),
          t("title", "Heading", "Our certifications"),
          ta("intro", "Introduction", "Fabrication follows drawings you have approved, and CNC cutting runs from the same detailed information."),
        ],
      },
      { key: "faq", label: "Questions", hideable: true, fields: [t("label", "Small label", "Questions"), t("title", "Heading", "Before you send a request")] },
      { key: "contact", label: "Contact and quick quote", hideable: true, fields: [ta("text", "Contact text", "Get in touch for quotations, site surveys and fabrication schedules."), t("quoteTitle", "Quote box heading", "Start your request")] },
    ],
  },
  {
    key: "services",
    label: "Services",
    path: "/services",
    sections: [
      hero(
        "Services",
        "Engineered in steel. Built to last.",
        "From detailing and CNC profiling through welding, fabrication and site installation — handled in-house at our Musaffah workshop for contractors, engineers and industrial clients across the UAE."
      ),
      { key: "capabilities", label: "Explore our capabilities", hideable: true, fields: [t("title", "Heading", "Explore our capabilities")] },
      { key: "faq", label: "Questions", hideable: true, fields: [t("title", "Heading", "Common questions")] },
    ],
  },
  {
    key: "projects",
    label: "Projects",
    path: "/projects",
    sections: [
      hero(
        "Projects",
        "Project portfolio",
        "Projects where Al Saqr Al Ahmar carried out structural steel fabrication and erection. Each entry states our contribution and its current status."
      ),
      { key: "showcase", label: "Fabrication showcase", hideable: true, fields: [t("title", "Heading", "Fabrication showcase"), ta("intro", "Introduction", "Typical items we fabricate and install for villas, compounds and industrial sites across the UAE. Open any item to see more photos, then request a quotation for your own design.")] },
      { key: "cta", label: "Closing call to action", hideable: true, fields: [t("title", "Heading", "Planning something similar?"), t("button", "Button", "Discuss a Similar Project")] },
    ],
  },
  {
    key: "about",
    label: "About",
    path: "/about",
    sections: [
      hero("About", "", "Structural steel, pipeline, CNC, storage and stainless steel fabrication — detailed, cut, fabricated and installed from one workshop in Musaffah."),
      {
        key: "workshop",
        label: "The workshop",
        hideable: true,
        fields: [
          t("label", "Small label", "The workshop"),
          t("title", "Heading", "Detailing, cutting, fabrication and installation"),
          ta("intro", "Introduction", "Our engineering personnel work on current design and detailing software, and profiling runs on CNC equipment in the workshop — so drawings and cut parts are prepared before fabrication begins."),
        ],
      },
      { key: "clients", label: "Who we work with", hideable: true, fields: [t("label", "Small label", "Who we work with"), t("title", "Heading", "Built for people who buy steelwork")] },
      { key: "process", label: "Project process", hideable: true, fields: [t("label", "Small label", "How a project runs"), t("title", "Heading", "Our project process")] },
    ],
  },
  {
    key: "quality",
    label: "Quality",
    path: "/quality",
    sections: [
      hero("Quality and certifications", "Quality that starts at the drawing board", "How we control quality on a fabrication job — and how to obtain the certification documents your tender or pre-qualification needs."),
      { key: "approach", label: "How quality is controlled", hideable: true, fields: [t("label", "Small label", "Our approach"), t("title", "Heading", "How quality is controlled")] },
      {
        key: "certificates",
        label: "Certificates",
        hideable: true,
        fields: [t("label", "Small label", "Certification"), t("title", "Heading", "Certificates"), ta("intro", "Introduction", "We publish a certificate here only once a current copy in the company's name has been checked.")],
      },
    ],
  },
  {
    key: "contact",
    label: "Contact",
    path: "/contact",
    sections: [
      hero("Contact", "Talk to the workshop", "Call or WhatsApp for a quick conversation, or send your drawings through the quote form for a written response."),
      { key: "visit", label: "Visit us", hideable: true, fields: [t("label", "Small label", "Workshop"), t("title", "Heading", "Visit us in Musaffah")] },
      { key: "faq", label: "Questions", hideable: true, fields: [t("title", "Heading", "About sending an enquiry")] },
    ],
  },
  {
    key: "quote",
    label: "Request a quote",
    path: "/quote",
    sections: [
      hero(
        "Request a quote",
        "Tell us what you need fabricated",
        "A few details and any drawings you have. Our team reviews every request and contacts you — pricing, programme and terms are always confirmed by our staff."
      ),
    ],
  },
  {
    key: "blog",
    label: "Blog",
    path: "/blog",
    sections: [
      hero(
        "Blog",
        "Notes from the workshop",
        "Practical background on structural steel, welding, inspection and fabrication schedules — the questions that come up in real enquiries. For advice on your project, talk to our team."
      ),
    ],
  },
];

export type PageValues = Record<string, Record<string, string | boolean>>;

/** Read helper the site uses: saved text if set, otherwise the default. */
export function pageReader(pageKey: string, saved: PageValues | null) {
  const def = PAGES.find((p) => p.key === pageKey);
  return {
    text(section: string, field: string, fallback?: string): string {
      const v = saved?.[section]?.[field];
      if (typeof v === "string" && v.trim()) return v;
      const f = def?.sections.find((s) => s.key === section)?.fields.find((x) => x.key === field);
      return fallback ?? f?.default ?? "";
    },
    image(section: string, field = "image"): string | null {
      const v = saved?.[section]?.[field];
      return typeof v === "string" && v.trim() ? v : null;
    },
    visible(section: string): boolean {
      return saved?.[section]?._hidden !== true;
    },
  };
}
export type PageReader = ReturnType<typeof pageReader>;

// ---------------------------------------------------------------------------
// Motion settings (Admin → Motion & effects), key "motion".

export type MotionSettings = {
  enabled: boolean;
  speed: number; // 0.5 (slow) … 2 (fast)
  cursor: boolean;
  sparks: boolean;
  heroSparks: boolean;
  ticker: boolean;
  reveals: boolean;
  tilt: boolean;
  trail: boolean;
  headingSpark: boolean;
  scrollFx: boolean;
  progress: boolean;
  countUp: boolean;
  magnetic: boolean;
};

export const MOTION_DEFAULTS: MotionSettings = {
  enabled: true,
  speed: 1,
  cursor: true,
  sparks: true,
  heroSparks: true,
  ticker: true,
  reveals: true,
  tilt: true,
  trail: true,
  headingSpark: true,
  scrollFx: true,
  progress: true,
  countUp: true,
  magnetic: true,
};

export function readMotion(saved: Partial<MotionSettings> | null): MotionSettings {
  const m = { ...MOTION_DEFAULTS, ...(saved ?? {}) };
  m.speed = Math.min(2, Math.max(0.5, Number(m.speed) || 1));
  return m;
}
