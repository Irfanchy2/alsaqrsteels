"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import SafeImage from "@/components/SafeImage";
import SparkField from "@/components/motion/SparkField";
import type { SiteSettings } from "@/lib/types";

const wrap = "max-w-[1240px] mx-auto px-5 sm:px-10";

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const STATS = [
  { value: "15+", label: "Years in structural steel" },
  { value: "3×ISO", label: "9001 · 14001 · 45001" },
  { value: "ICV", label: "ADNOC certified" },
  { value: "2", label: "Onshore & offshore scope" },
];

export default function Hero({ settings }: { settings: SiteSettings | null }) {
  const reduceMotion = useReducedMotion();
  const region = settings?.address?.split(",").slice(-2).join(",").trim() || "Abu Dhabi, UAE";

  return (
    <section className="relative bg-ink text-white overflow-hidden">
      {settings?.hero_image && (
        <div className="absolute inset-0">
          <SafeImage
            src={settings.hero_image}
            alt=""
            fill
            priority
            variant="photo"
            imgClassName="object-cover saturate-[0.55] contrast-[1.08] brightness-[0.55]"
            className="opacity-0"
          />
        </div>
      )}
      {/* Scrim: heavier at the text edge (left) and along the foot, like the
          live site's hero-media treatment, so the photo still reads through. */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
      <SparkField density={34} className="opacity-80" />

      <div className={`${wrap} relative pt-28 sm:pt-40 pb-24 sm:pb-32`}>
        <motion.span
          className="eyebrow font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-torch-dim block"
          initial={reduceMotion ? undefined : "hidden"}
          animate="visible"
          custom={0}
          variants={item}
        >
          {region}
        </motion.span>
        <motion.h1
          className="font-display font-extrabold uppercase tracking-[-0.02em] text-[2.6rem] sm:text-[4.2rem] leading-[0.98] mt-6 max-w-[16ch]"
          initial={reduceMotion ? undefined : "hidden"}
          animate="visible"
          custom={0.1}
          variants={item}
        >
          {settings?.hero_title || "Structural steel, engineered for the field"}
        </motion.h1>
        {settings?.hero_subtitle && (
          <motion.p
            className="mt-7 text-[1.1rem] sm:text-[1.25rem] leading-relaxed text-white/80 max-w-[62ch]"
            initial={reduceMotion ? undefined : "hidden"}
            animate="visible"
            custom={0.2}
            variants={item}
          >
            {settings.hero_subtitle}
          </motion.p>
        )}
        <motion.div
          className="flex flex-wrap items-center gap-3.5 mt-10"
          initial={reduceMotion ? undefined : "hidden"}
          animate="visible"
          custom={0.32}
          variants={item}
        >
          <Link
            href="/projects"
            className="inline-flex items-center bg-torch text-white font-mono text-[0.85rem] font-semibold uppercase tracking-wide px-7 py-4 hover:bg-torch-dim transition-colors"
          >
            View our work →
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center border border-white/30 text-white font-mono text-[0.85rem] font-semibold uppercase tracking-wide px-7 py-4 hover:border-white transition-colors"
          >
            Request a quote
          </Link>
        </motion.div>

        <motion.dl
          className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-7 mt-16 sm:mt-20 max-w-[720px] border-t border-white/15 pt-8"
          initial={reduceMotion ? undefined : "hidden"}
          animate="visible"
          custom={0.44}
          variants={item}
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="font-display font-extrabold text-[1.6rem] sm:text-[1.9rem] leading-none text-white">
                {s.value}
              </dt>
              <dd className="font-mono text-[0.68rem] uppercase tracking-wide text-white/60 mt-2 leading-snug">
                {s.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
