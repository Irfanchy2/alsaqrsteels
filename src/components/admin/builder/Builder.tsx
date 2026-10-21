"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BLOCK_DEFS, blockDef, type Block, type BlockType } from "@/lib/content/blocks";
import BlockView, { type BlockData } from "@/components/blocks/BlockView";
import { saveLayout, resetLayout } from "@/app/admin/actions";
import Inspector from "./Inspector";

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
  const [, start] = useTransition();
  const canvasRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  const onDragStart = (e: DragStartEvent) => setDragging(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setDragging(null);
    const active = String(e.active.id);
    const over = e.over ? String(e.over.id) : null;
    if (active.startsWith("new:")) {
      if (!over) return;
      const type = active.slice(4) as BlockType;
      const idx = over === "canvas-end" ? blocks.length : blocks.findIndex((b) => b.id === over);
      insertAt(type, idx < 0 ? blocks.length : idx);
      return;
    }
    if (!over || active === over || over === "canvas-end") return;
    const from = blocks.findIndex((b) => b.id === active);
    const to = blocks.findIndex((b) => b.id === over);
    if (from < 0 || to < 0) return;
    change((prev) => arrayMove(prev, from, to));
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

      <DndContext id="page-builder" sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex min-h-0 flex-1">
          {/* Blocks palette */}
          {addOpen ? <button type="button" aria-label="Close" onClick={() => setAddOpen(false)} className="fixed inset-0 z-[85] bg-black/40 md:hidden" /> : null}
          <aside
            className={`w-64 flex-none overflow-y-auto border-e border-line bg-white p-4 md:static md:block ${
              addOpen ? "fixed inset-y-0 start-0 z-[90] block shadow-2xl" : "hidden"
            }`}
          >
            <p className="text-sm font-semibold">Add blocks</p>
            <p className="mt-1 text-xs text-steel-text">Drag a block onto the page, or click it to add it below the selected block.</p>
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
            {pageKey.startsWith("c:") ? null : (
              <button type="button" onClick={reset} className="mt-8 w-full rounded-md border border-line px-3 py-2 text-xs text-steel-text hover:border-danger hover:text-danger">
                Reset page to original
              </button>
            )}
          </aside>

          {/* Canvas */}
          <main ref={canvasRef} className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-6" onClick={() => setSelected(null)}>
            <div className="site-theme builder-canvas mx-auto max-w-[1280px] overflow-hidden rounded-lg shadow-[0_10px_40px_-15px_rgba(0,0,0,0.4)]" style={{ cursor: "default" }}>
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
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
                    label={b.type === "section" ? sectionLabels[String(b.props.key)] ?? "Section" : blockDef(b.type)?.label ?? b.type}
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
              </SortableContext>
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
          {dragging?.startsWith("new:") ? (
            <div className="rounded-lg border-2 border-flame bg-white px-4 py-3 text-sm font-semibold shadow-2xl">
              + {blockDef(dragging.slice(4) as BlockType)?.label}
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
}: {
  block: Block;
  index: number;
  count: number;
  selected: boolean;
  label: string;
  children: React.ReactNode;
  onSelect: () => void;
  onMove: (d: -1 | 1) => void;
  onDuplicate: () => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging, isOver } = useSortable({ id: block.id });
  const isSection = block.type === "section";
  return (
    <div
      id={`blk-${block.id}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`group/blk relative ${isDragging ? "z-20 opacity-60" : ""} ${block.hidden ? "opacity-40" : ""}`}
    >
      {isOver ? <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-1 bg-flame" /> : null}
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
