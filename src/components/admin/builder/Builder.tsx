"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { BLOCK_DEFS, blockDef, type Block, type BlockType } from "@/lib/content/blocks";
import BlockView, { type BlockData } from "@/components/blocks/BlockView";
import { saveLayout, resetLayout } from "@/app/admin/actions";
import Inspector from "./Inspector";
import Layers from "./Layers";

// Drop target = the block under the pointer (not the nearest centre, which is
// unpredictable with tall sections); fall back to the nearest one in gaps.
const collide: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  return hits.length ? hits : closestCenter(args);
};

const newId = () => Math.random().toString(36).slice(2, 10);
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export default function Builder({
  pageKey,
  pageLabel,
  pagePath,
  initial,
  sectionLabels,
  editableSections,
  data,
}: {
  pageKey: string;
  pageLabel: string;
  pagePath: string;
  initial: Block[];
  sectionLabels: Record<string, string>;
  editableSections: string[];
  data: BlockData;
}) {
  const [blocks, setBlocks] = useState<Block[]>(initial);
  const [history, setHistory] = useState<Block[][]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error"; msg?: string }>({ kind: "idle" });
  const [dragging, setDragging] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState<"add" | "layers">("add");
  // Where a dragged block will land: index in the list (0 = very top).
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dropRef = useRef<number | null>(null);
  const [, start] = useTransition();
  const canvasRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

  // Every change goes through here so it can be undone.
  const change = useCallback((next: Block[] | ((prev: Block[]) => Block[])) => {
    setBlocks((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      setHistory((h) => [...h.slice(-49), prev]);
      return value;
    });
    setDirty(true);
    setStatus({ kind: "idle" });
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      setBlocks(h[h.length - 1]);
      setDirty(true);
      return h.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    const keys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !(e.target as HTMLElement)?.closest("input,textarea")) {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("beforeunload", warn);
    window.addEventListener("keydown", keys);
    return () => {
      window.removeEventListener("beforeunload", warn);
      window.removeEventListener("keydown", keys);
    };
  }, [dirty, undo]);

  const insertAt = (type: BlockType, index: number) => {
    const def = blockDef(type)!;
    const b: Block = { id: newId(), type, props: clone(def.defaults) };
    change((prev) => [...prev.slice(0, index), b, ...prev.slice(index)]);
    setSelected(b.id);
    window.setTimeout(() => document.getElementById(`blk-${b.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const addBlock = (type: BlockType) => {
    const i = selected ? blocks.findIndex((b) => b.id === selected) + 1 : blocks.length;
    insertAt(type, i || blocks.length);
  };

  const setDrop = (i: number | null) => {
    dropRef.current = i;
    setDropIndex(i);
  };
  const onDragStart = (e: DragStartEvent) => setDragging(String(e.active.id));
  // Work out the insertion point from the pointer: over the top half of a
  // block = above it, bottom half = below it. Run on every move and again on
  // release, so even a very quick drag lands in the right place.
  const dropFor = (e: DragMoveEvent | DragEndEvent): number | null => {
    const over = e.over ? String(e.over.id) : null;
    if (!over) return null;
    if (over === "canvas-end") return blocks.length;
    const idx = blocks.findIndex((b) => b.id === over);
    if (idx < 0) return null;
    const start = e.activatorEvent as PointerEvent;
    const rect = document.getElementById(`blk-${over}`)?.getBoundingClientRect();
    if (!rect || typeof start.clientY !== "number") return idx;
    const y = start.clientY + e.delta.y;
    return idx + (y > rect.top + rect.height / 2 ? 1 : 0);
  };
  const onDragMove = (e: DragMoveEvent) => setDrop(dropFor(e));
  const onDragEnd = (e: DragEndEvent) => {
    const target = dropFor(e) ?? dropRef.current;
    setDragging(null);
    setDrop(null);
    const active = String(e.active.id);
    if (target === null || !e.over) return;
    if (active.startsWith("new:")) {
      insertAt(active.slice(4) as BlockType, target);
      return;
    }
    const from = blocks.findIndex((b) => b.id === active);
    if (from < 0) return;
    const to = target > from ? target - 1 : target;
    if (to !== from) change((prev) => arrayMove(prev, from, to));
  };
  const onDragCancel = () => {
    setDragging(null);
    setDrop(null);
  };

  // Typing in the settings panel: consecutive edits to the same block within
  // a second count as one step for Undo.
  const lastEdit = useRef<{ id: string; t: number } | null>(null);
  const update = (id: string, props: Record<string, unknown>) => {
    const now = Date.now();
    const same = lastEdit.current && lastEdit.current.id === id && now - lastEdit.current.t < 1000;
    lastEdit.current = { id, t: now };
    if (same) {
      setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, props } : b)));
      setDirty(true);
    } else change((prev) => prev.map((b) => (b.id === id ? { ...b, props } : b)));
  };
  const move = (id: string, d: -1 | 1) =>
    change((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      const j = i + d;
      return j < 0 || j >= prev.length ? prev : arrayMove(prev, i, j);
    });
  const duplicate = (id: string) =>
    change((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      const copy = { ...clone(prev[i]), id: newId() };
      return [...prev.slice(0, i + 1), copy, ...prev.slice(i + 1)];
    });
  const toggle = (id: string) => change((prev) => prev.map((b) => (b.id === id ? { ...b, hidden: !b.hidden } : b)));
  const remove = (id: string) => {
    change((prev) => prev.filter((b) => b.id !== id));
    setSelected(null);
  };

  const save = () => {
    setStatus({ kind: "saving" });
    start(async () => {
      const err = await saveLayout(pageKey, blocks);
      if (err) setStatus({ kind: "error", msg: err });
      else {
        setStatus({ kind: "saved" });
        setDirty(false);
      }
    });
  };

  const reset = () => {
    if (!window.confirm("Put this page back to how it was originally? Your added blocks will be removed.")) return;
    setStatus({ kind: "saving" });
    start(async () => {
      const err = await resetLayout(pageKey);
      if (err) setStatus({ kind: "error", msg: err });
      else window.location.reload();
    });
  };

  const sel = blocks.find((b) => b.id === selected) ?? null;
  const labelOf = (b: Block) => (b.type === "section" ? sectionLabels[String(b.props.key)] ?? "Section" : blockDef(b.type)?.label ?? b.type);
  const groups = useMemo(() => {
    const g: Record<string, typeof BLOCK_DEFS> = {};
    for (const d of BLOCK_DEFS) (g[d.group] ??= []).push(d);
    return g;
  }, []);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-paper-2 text-ink">
      {/* Top bar */}
      <header className="flex h-14 flex-none items-center justify-between gap-3 border-b border-line bg-white px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin/builder"
            onClick={(e) => {
              if (dirty && !window.confirm("Leave without saving your changes?")) e.preventDefault();
            }}
            className="rounded-md px-2 py-1.5 text-sm text-steel-text hover:bg-paper-2 hover:text-ink"
          >
            ← Pages
          </Link>
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">{pageLabel}</p>
            <p className="truncate font-mono text-xs text-steel-text">{pagePath}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm sm:inline" aria-live="polite">
            {status.kind === "saving" ? <span className="text-steel-text">Saving…</span> : null}
            {status.kind === "saved" ? <span className="font-medium text-ok">✓ Saved, live within a minute</span> : null}
            {status.kind === "error" ? <span className="font-medium text-danger">{status.msg}</span> : null}
            {status.kind === "idle" && dirty ? <span className="text-warn">Unsaved changes</span> : null}
          </span>
          <button type="button" onClick={() => setAddOpen(true)} className="btn btn-sm btn-secondary md:hidden">
            + Add block
          </button>
          <button type="button" onClick={undo} disabled={!history.length} className="btn btn-sm btn-secondary disabled:opacity-40" title="Undo (Ctrl/Cmd + Z)">
            ↶ Undo
          </button>
          <a href={pagePath} target="_blank" className="btn btn-sm btn-secondary hidden md:inline-flex">
            View page ↗
          </a>
          <button type="button" onClick={save} disabled={!dirty || status.kind === "saving"} className="btn btn-sm btn-primary disabled:opacity-50">
            Save
          </button>
        </div>
      </header>

      <DndContext
        id="page-builder"
        sensors={sensors}
        collisionDetection={collide}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className="flex min-h-0 flex-1">
          {/* Blocks palette */}
          {addOpen ? <button type="button" aria-label="Close" onClick={() => setAddOpen(false)} className="fixed inset-0 z-[85] bg-black/40 md:hidden" /> : null}
          <aside
            className={`w-64 flex-none overflow-y-auto border-e border-line bg-white p-4 md:static md:block ${
              addOpen ? "fixed inset-y-0 start-0 z-[90] block shadow-2xl" : "hidden"
            }`}
          >
            <div className="mb-4 grid grid-cols-2 rounded-lg bg-paper-2 p-1 text-sm font-semibold" role="tablist">
              {(["add", "layers"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`rounded-md py-1.5 ${tab === t ? "bg-white shadow-sm" : "text-steel-text hover:text-ink"}`}
                >
                  {t === "add" ? "Add" : `Layers (${blocks.length})`}
                </button>
              ))}
            </div>
            {tab === "layers" ? (
              <>
                <p className="mb-3 text-xs text-steel-text">Drag ⠿ to reorder exactly. Click a row to edit that block.</p>
                <Layers
                  blocks={blocks}
                  labels={Object.fromEntries(blocks.map((b) => [b.id, labelOf(b)]))}
                  selected={selected}
                  onSelect={(id) => {
                    setSelected(id);
                    setAddOpen(false);
                    document.getElementById(`blk-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  onReorder={(from, to) => change((prev) => arrayMove(prev, from, to))}
                  onToggle={toggle}
                />
              </>
            ) : (
            <>
            <p className="text-xs text-steel-text">Drag a block onto the page (an orange line shows where it lands), or click it to add it below the selected block.</p>
            {Object.entries(groups).map(([group, defs]) => (
              <div key={group} className="mt-5">
                <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-steel-text">{group}</p>
                <ul className="grid grid-cols-2 gap-2">
                  {defs.map((d) => (
                    <PaletteItem key={d.type} type={d.type} icon={d.icon} label={d.label} description={d.description} onAdd={() => {
                        addBlock(d.type);
                        setAddOpen(false);
                      }} />
                  ))}
                </ul>
              </div>
            ))}
            </>
            )}
            {pageKey.startsWith("c:") ? null : (
              <button type="button" onClick={reset} className="mt-8 w-full rounded-md border border-line px-3 py-2 text-xs text-steel-text hover:border-danger hover:text-danger">
                Reset page to original
              </button>
            )}
          </aside>

          {/* Canvas */}
          <main ref={canvasRef} className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-6" onClick={() => setSelected(null)}>
            <div className="site-theme builder-canvas mx-auto max-w-[1280px] overflow-hidden rounded-lg shadow-[0_10px_40px_-15px_rgba(0,0,0,0.4)]" style={{ cursor: "default" }}>
                {blocks.map((b, i) => (
                  <BlockFrame
                    key={b.id}
                    block={b}
                    index={i}
                    count={blocks.length}
                    selected={selected === b.id}
                    onSelect={() => setSelected(b.id)}
                    onMove={(d) => move(b.id, d)}
                    onDuplicate={() => duplicate(b.id)}
                    onToggle={() => toggle(b.id)}
                    onRemove={() => remove(b.id)}
                    label={labelOf(b)}
                    lineAbove={dropIndex === i}
                    lineBelow={i === blocks.length - 1 && dropIndex === blocks.length}
                  >
                    {b.type === "section" ? (
                      <SectionCard
                        label={sectionLabels[String(b.props.key)] ?? "Built-in section"}
                        editHref={editableSections.includes(String(b.props.key)) ? `/admin/pages/${pageKey}#sec-${String(b.props.key)}` : null}
                      />
                    ) : (
                      <div className="pointer-events-none">
                        <BlockView block={b} data={data} editing />
                      </div>
                    )}
                  </BlockFrame>
                ))}
              <DropEnd active={!!dragging?.startsWith("new:")} empty={!blocks.length} />
            </div>
          </main>

          {/* Settings */}
          <aside
            className={`w-80 max-w-[90vw] flex-none overflow-y-auto border-s border-line bg-white lg:static lg:block ${
              sel ? "fixed inset-y-0 end-0 z-[90] block shadow-2xl lg:shadow-none" : "hidden"
            }`}
          >
            {sel ? (
              <button type="button" onClick={() => setSelected(null)} className="sticky top-0 z-10 flex w-full items-center justify-end border-b border-line bg-white px-4 py-2 text-sm text-steel-text hover:text-ink lg:hidden">
                Close ✕
              </button>
            ) : null}
            {sel ? (
              <Inspector
                key={sel.id}
                block={sel}
                sectionLabel={sel.type === "section" ? sectionLabels[String(sel.props.key)] : undefined}
                editHref={sel.type === "section" && editableSections.includes(String(sel.props.key)) ? `/admin/pages/${pageKey}#sec-${String(sel.props.key)}` : null}
                onChange={(props) => update(sel.id, props)}
                onToggle={() => toggle(sel.id)}
                onRemove={() => remove(sel.id)}
                index={blocks.findIndex((b) => b.id === sel.id)}
                count={blocks.length}
                onMove={(d) => move(sel.id, d)}
                onDuplicate={sel.type === "section" ? undefined : () => duplicate(sel.id)}
              />
            ) : (
              <div className="p-5 text-sm text-steel-text">
                <p className="font-semibold text-ink">How to use the builder</p>
                <ol className="mt-3 list-decimal space-y-2 ps-5">
                  <li>Drag blocks from the left onto the page.</li>
                  <li>Drag the ⠿ handle to move a block up or down.</li>
                  <li>Click a block to change its text and photos here.</li>
                  <li>Use 👁 to hide a block without deleting it.</li>
                  <li>
                    Press <strong>Save</strong>. The website updates within a minute.
                  </li>
                </ol>
                <p className="mt-4">Made a mistake? Press Undo, or Ctrl/Cmd + Z.</p>
              </div>
            )}
          </aside>
        </div>

        <DragOverlay dropAnimation={null}>
          {dragging ? (
            <div className="rounded-lg border-2 border-flame bg-white px-4 py-3 text-sm font-semibold shadow-2xl">
              {dragging.startsWith("new:")
                ? `+ ${blockDef(dragging.slice(4) as BlockType)?.label}`
                : `⠿ ${labelOf(blocks.find((b) => b.id === dragging) ?? blocks[0])}`}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function PaletteItem({ type, icon, label, description, onAdd }: { type: BlockType; icon: string; label: string; description: string; onAdd: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `new:${type}` });
  return (
    <li>
      <button
        type="button"
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={onAdd}
        title={description}
        className={`flex w-full cursor-grab touch-none flex-col items-center gap-1 rounded-lg border bg-paper-2/50 px-2 py-3 text-center transition hover:border-flame hover:bg-white active:cursor-grabbing ${
          isDragging ? "border-flame opacity-50" : "border-line"
        }`}
      >
        <span aria-hidden="true" className="text-xl leading-none">
          {icon}
        </span>
        <span className="text-xs font-medium">{label}</span>
      </button>
    </li>
  );
}

function BlockFrame({
  block,
  index,
  count,
  selected,
  label,
  children,
  onSelect,
  onMove,
  onDuplicate,
  onToggle,
  onRemove,
  lineAbove,
  lineBelow,
}: {
  block: Block;
  index: number;
  count: number;
  selected: boolean;
  label: string;
  lineAbove: boolean;
  lineBelow: boolean;
  children: React.ReactNode;
  onSelect: () => void;
  onMove: (d: -1 | 1) => void;
  onDuplicate: () => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  // The block stays in place while it is dragged (a small label follows the
  // pointer), and an orange line shows exactly where it will be dropped.
  const drag = useDraggable({ id: block.id });
  const drop = useDroppable({ id: block.id });
  const { attributes, listeners, setActivatorNodeRef, isDragging } = drag;
  const setNodeRef = (el: HTMLElement | null) => {
    drag.setNodeRef(el);
    drop.setNodeRef(el);
  };
  const isSection = block.type === "section";
  return (
    <div
      id={`blk-${block.id}`}
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`group/blk relative ${isDragging ? "opacity-40" : ""} ${block.hidden ? "opacity-40" : ""}`}
    >
      {lineAbove ? <DropLine edge="top" /> : null}
      {lineBelow ? <DropLine edge="bottom" /> : null}
      <div
        className={`pointer-events-none absolute inset-0 z-20 border-2 transition-colors ${
          selected ? "border-flame" : "border-transparent group-hover/blk:border-flame/50"
        }`}
      />
      <div
        className={`absolute end-2 top-2 z-30 flex items-center gap-0.5 rounded-md bg-white p-0.5 text-ink shadow-lg transition-opacity ${
          selected ? "opacity-100" : "opacity-0 group-hover/blk:opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="px-2 text-xs font-semibold">{label}</span>
        <button type="button" ref={setActivatorNodeRef} {...attributes} {...listeners} className="tb cursor-grab touch-none active:cursor-grabbing" title="Drag to move">
          ⠿
        </button>
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="tb" title="Move up">
          ↑
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} className="tb" title="Move down">
          ↓
        </button>
        {!isSection ? (
          <button type="button" onClick={onDuplicate} className="tb" title="Duplicate">
            ⧉
          </button>
        ) : null}
        <button type="button" onClick={onToggle} className="tb" title={block.hidden ? "Show on website" : "Hide from website"}>
          {block.hidden ? "◌" : "👁"}
        </button>
        {!isSection ? (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete this ${label} block?`)) onRemove();
            }}
            className="tb hover:!bg-danger-bg hover:!text-danger"
            title="Delete"
          >
            🗑
          </button>
        ) : null}
      </div>
      {block.hidden ? (
        <div className="absolute start-2 top-2 z-30 rounded bg-ink px-2 py-1 text-xs font-semibold text-on-ink">Hidden on website</div>
      ) : null}
      {children}
    </div>
  );
}

function DropLine({ edge }: { edge: "top" | "bottom" }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 z-40 flex justify-center ${edge === "top" ? "-top-[3px]" : "-bottom-[3px]"}`}>
      <div className="h-[6px] w-full rounded-full bg-flame shadow-[0_0_0_3px_rgba(255,90,31,0.25)]" />
      <span className="absolute -top-3 rounded-full bg-flame px-3 py-0.5 text-xs font-semibold text-black shadow">Drop here</span>
    </div>
  );
}

function SectionCard({ label, editHref }: { label: string; editHref: string | null }) {
  return (
    <div className="flex min-h-28 items-center justify-between gap-4 border-b border-line-ink bg-ink-2 px-6 py-6 text-on-ink">
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-md bg-flame/15 text-xl text-flame">
          ★
        </span>
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-on-ink-muted">Website section</p>
          <p className="font-display text-xl font-extrabold uppercase [font-stretch:80%]">{label}</p>
        </div>
      </div>
      {editHref ? (
        <Link href={editHref} onClick={(e) => e.stopPropagation()} className="rounded-md border border-white/20 px-3 py-1.5 text-sm hover:border-flame hover:text-flame">
          Edit text & photo
        </Link>
      ) : null}
    </div>
  );
}

function DropEnd({ active, empty }: { active: boolean; empty: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-end" });
  return (
    <div
      ref={setNodeRef}
      className={`flex items-center justify-center border-2 border-dashed text-sm transition-colors ${
        empty ? "h-60" : "h-24"
      } ${isOver ? "border-flame bg-flame/10 text-flame" : active ? "border-flame/50 text-steel-text" : "border-line-ink text-on-ink-muted"}`}
    >
      {empty ? "Drag a block here to start building this page" : "Drop here to add at the end"}
    </div>
  );
}
