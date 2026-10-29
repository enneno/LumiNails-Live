"use client";

import { type ReactNode, useId, useState } from "react";
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { adminIconButtonClass } from "@/components/admin-ui";

export function AdminSortContext({ ids, onMove, children }: {
  ids: string[];
  onMove: (fromId: string, toId: string) => void;
  children: ReactNode;
}) {
  const id = useId();
  const [dragLabel, setDragLabel] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <DndContext id={id} sensors={sensors} collisionDetection={closestCenter}
      accessibility={{
        screenReaderInstructions: { draggable: "Átrendezés: szóköz, majd a nyilak. Újabb szóközzel elhelyezés, Escape-pel megszakítás." },
        announcements: {
          onDragStart: ({ active }) => `${active.data.current?.label ?? "Elem"} átrendezése.`,
          onDragOver: ({ over }) => over ? `${ids.indexOf(String(over.id)) + 1}. hely.` : undefined,
          onDragEnd: ({ over }) => over ? `Új hely: ${ids.indexOf(String(over.id)) + 1}. A sorrend mentésre vár.` : "A sorrend nem változott.",
          onDragCancel: () => "Átrendezés megszakítva.",
        },
      }}
      onDragStart={({ active }) => setDragLabel(String(active.data.current?.label ?? "Átrendezés"))}
      onDragCancel={() => setDragLabel(null)}
      onDragEnd={({ active, over }) => {
        setDragLabel(null);
        if (over && active.id !== over.id) onMove(String(active.id), String(over.id));
      }}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>{children}</SortableContext>
      <DragOverlay dropAnimation={null}>
        {dragLabel ? <div className="pointer-events-none max-w-xs truncate rounded-lg border border-gold-dark bg-admin-field px-3 py-2 text-xs font-bold text-ink shadow-xl">⠿ {dragLabel}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}

export function AdminSortItem({ id, label, className, children, isNew }: {
  id: string;
  label: string;
  className?: string;
  isNew?: boolean;
  children: (handle: ReactNode) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, data: { label }, transition: null });
  const handle = (
    <button type="button" ref={setActivatorNodeRef} {...attributes} {...listeners}
      aria-label={`${label}: sorrend módosítása`} title="Húzd az új helyére"
      className={`${adminIconButtonClass} cursor-grab text-gold-dark active:cursor-grabbing`}
      style={{ touchAction: "none" }}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 fill-current">
        {[5, 10, 15].flatMap((y) => [7, 13].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" />))}
      </svg>
    </button>
  );
  return <div ref={setNodeRef} data-sort-id={id} data-new-item={isNew || undefined} className={className}
    style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : undefined }}>
    {children(handle)}
  </div>;
}
