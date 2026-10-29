"use client";

import { useState, type ReactNode } from "react";
import { AdminEditorSheet } from "@/components/admin-editor-sheet";
import { Chevron } from "@/components/admin-overview";
import { adminPressableClass } from "@/components/admin-ui";

export function AdminDetailRow({ title, description, children }: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${adminPressableClass} flex min-h-12 w-full items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-admin-raised focus-visible:outline-2 focus-visible:outline-gold-dark`}>
        <span className="min-w-0 flex-1"><span className="block text-xs font-semibold leading-relaxed">{title}</span>{description ? <span className="mt-0.5 block truncate text-[0.68rem] text-ink-muted">{description}</span> : null}</span>
        <Chevron />
      </button>
      <AdminEditorSheet open={open} title={title} onClose={() => setOpen(false)}>{children}</AdminEditorSheet>
    </>
  );
}
