"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Generic drag-to-reorder list. Grab the ⠿ handle (or focus it and use the
// arrow keys + space) and the new order is saved straight away.
export default function SortableList<T extends { id: string }>({
  items: initial,
  onReorder,
  render,
}: {
  items: T[];
  onReorder: (ids: string[]) => Promise<string | null>;
  render: (item: T) => React.ReactNode;
}) {
  const [items, setItems] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, start] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = items.findIndex((i) => i.id === e.active.id);
    const to = items.findIndex((i) => i.id === e.over!.id);
    const next = arrayMove(items, from, to);
    setItems(next);
    setStatus("saving");
    start(async () => {
      const err = await onReorder(next.map((i) => i.id));
      setStatus(err ? "error" : "saved");
      if (!err) window.setTimeout(() => setStatus("idle"), 2000);
    });
  };

  return (
    <div>
      <p className="mb-2 h-5 text-sm" aria-live="polite">
        {status === "saving" ? <span className="text-steel-text">Saving new order…</span> : null}
        {status === "saved" ? <span className="font-medium text-ok">✓ New order saved</span> : null}
        {status === "error" ? <span className="font-medium text-danger">Could not save the order. Reload and try again.</span> : null}
      </p>
      <DndContext id="sortable-list" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {items.map((item) => (
              <SortableRow key={item.id} id={item.id}>
                {render(item)}
              </SortableRow>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-lg border bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${
        isDragging ? "z-10 border-flame shadow-xl" : "border-line"
      }`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="flex h-10 w-8 flex-none cursor-grab touch-none items-center justify-center rounded text-xl leading-none text-steel-text hover:bg-paper-2 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}
