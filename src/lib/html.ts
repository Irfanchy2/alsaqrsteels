import sanitizeHtml from "sanitize-html";

// Blog articles are written by staff in the admin editor (or pasted from Word
// / Google Docs). Everything is reduced to a small set of article tags before
// it is stored and again before it is shown, so pasted styles, scripts or
// tracking markup never reach the public site.
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "b", "i", "u", "a",
    "blockquote", "br", "hr", "code", "pre", "figure", "figcaption", "img",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "width", "height", "loading"],
    th: ["scope", "colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["https", "http", "mailto", "tel"],
  allowedSchemesByTag: { img: ["https"] },
  allowProtocolRelative: false,
  transformTags: {
    h1: "h2",
    b: "strong",
    i: "em",
    div: "p",
    a: (tagName, attribs) => {
      const href = attribs.href ?? "";
      const external = /^https?:\/\//i.test(href) && !/alsaqrsteels\.com/i.test(href);
      const out: sanitizeHtml.Attributes = { href };
      if (attribs.title) out.title = attribs.title;
      if (external) {
        out.target = "_blank";
        out.rel = "noopener noreferrer";
      }
      return { tagName, attribs: out };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
  },
  exclusiveFilter: (frame) => ["p", "h2", "h3", "li"].includes(frame.tag) && !frame.text.trim() && !frame.mediaChildren?.length,
};

export function sanitizeArticle(html: string): string {
  return sanitizeHtml(html ?? "", OPTIONS).trim();
}
