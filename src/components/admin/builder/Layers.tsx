"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "@/lib/content/blocks";

// A compact outline of the page: one small row per block. Reordering here is
// precise because the rows are short, unlike the full-size sections on the
// canvas. Click a row to select that block and scroll to it.
export default function Layers({
  blocks,
  labels,
  selected,
  onSelect,
  onReorder,
  onToggle,
}: {
  blocks: Block[];
  labels: Record<string, string>;
  selected: string | null;
  onSelect: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onToggle: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = blocks.findIndex((b) => b.id === e.active.id);
    const to = blocks.findIndex((b) => b.id === e.over!.id);
    if (from >= 0 && to >= 0) onReorder(from, to);
  };

  if (!blocks.length) return <p className="text-xs text-steel-text">This page has no blocks yet. Add some from the Add tab.</p>;
  return (
    <DndContext id="builder-layers" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <ol className="space-y-1">
          {blocks.map((b, i) => (
            <Row
              key={b.id}
              block={b}
              index={i}
              label={labels[b.id] ?? b.type}
              selected={selected === b.id}
              onSelect={() => onSelect(b.id)}
              onToggle={() => onToggle(b.id)}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

function Row({
  block,
  index,
  label,
  selected,
  onSelect,
  onToggle,
}: {
  block: Block;
  index: number;
  label: string;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-1 rounded-lg border bg-white text-sm ${isDragging ? "z-10 border-flame shadow-lg" : selected ? "border-flame" : "border-line"} ${
        block.hidden ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="flex h-9 w-7 flex-none cursor-grab touch-none items-center justify-center text-steel-text active:cursor-grabbing"
        aria-label={`Drag to move ${label}`}
      >
        ⠿
      </button>
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left">
        <span className="w-5 flex-none text-xs tabular-nums text-steel-text">{index + 1}</span>
        <span className="truncate font-medium">{label}</span>
        {block.type === "section" ? <span className="flex-none rounded bg-paper-2 px-1.5 text-[0.65rem] text-steel-text">built-in</span> : null}
      </button>
      <button type="button" onClick={onToggle} className="flex h-9 w-8 flex-none items-center justify-center text-steel-text hover:text-ink" title={block.hidden ? "Show on website" : "Hide from website"}>
        {block.hidden ? "◌" : "👁"}
      </button>
    </li>
  );
}
