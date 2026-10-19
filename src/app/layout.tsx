import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL, INDEXABLE } from "@/lib/site";
import "./globals.css";
import "./motion.css";
import "./motion2.css";
import "./motion3.css";

const archivo = localFont({
  src: "../../node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

const plex = localFont({
  src: [
    { path: "../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-plex",
  display: "swap",
});

const plexMono = localFont({
  src: [
    { path: "../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
});

// Bundled for the Arabic (RTL) version; not preloaded, so it costs nothing
// until Arabic text is actually rendered.
const plexArabic = localFont({
  src: [
    { path: "../../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: false,
});

const NAME = "Al Saqr Al Ahmar Welding and Blacksmith LLC";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Steel Fabrication in Musaffah, Abu Dhabi | ${NAME}`,
    template: `%s | Al Saqr Al Ahmar`,
  },
  description:
    "Structural steel, pipeline welding, laser and CNC cutting, storage containers and stainless steel fabrication from Musaffah Industrial 44, Abu Dhabi.",
  applicationName: "Al Saqr Al Ahmar",
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: NAME,
    locale: "en_AE",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: NAME }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0c0d10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${archivo.variable} ${plex.variable} ${plexMono.variable} ${plexArabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Marks JS-capable browsers so scroll reveals never hide content without JS. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        {children}
        {/* Enable Web Analytics in the Vercel dashboard first, then set this flag. */}
        {process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "true" ? <Analytics /> : null}
      </body>
    </html>
  );
}
