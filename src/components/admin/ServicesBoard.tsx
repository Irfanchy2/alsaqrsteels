"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import SortableList from "./SortableList";
import { reorderServices, setServiceVisible } from "@/app/admin/actions";

type Row = { id: string; slug: string; title: string; summary: string | null; published: boolean; image_url: string | null };

export default function ServicesBoard({ services }: { services: Row[] }) {
  return (
    <SortableList
      items={services}
      onReorder={(ids) => reorderServices(ids.map((id) => services.find((s) => s.id === id)!.slug))}
      render={(s) => <ServiceRow s={s} />}
    />
  );
}

function ServiceRow({ s }: { s: Row }) {
  const [visible, setVisible] = useState(s.published);
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="h-14 w-20 flex-none overflow-hidden rounded bg-paper-2">
        {s.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center text-[0.65rem] text-steel-text">No photo</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/admin/services/${s.slug}`} className="font-semibold hover:underline">
          {s.title}
        </Link>
        <p className="truncate text-sm text-steel-text">{s.summary || "No summary yet"}</p>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const next = !visible;
            setVisible(next);
            const err = await setServiceVisible(s.slug, next);
            if (err) setVisible(!next);
          })
        }
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
          visible ? "bg-ok-bg text-ok hover:bg-ok/20" : "bg-paper-2 text-steel-text hover:bg-line"
        }`}
        title={visible ? "Click to hide from the website" : "Click to show on the website"}
      >
        {visible ? "● On website" : "○ Hidden"}
      </button>
      <Link href={`/admin/services/${s.slug}`} className="btn btn-sm btn-secondary">
        Edit
      </Link>
    </div>
  );
}
