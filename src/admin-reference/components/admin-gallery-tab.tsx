"use client";

import Image from "next/image";
import { type ChangeEvent, useState } from "react";

import { AdminAutoTextarea } from "@/components/admin-auto-textarea";
import { AdminEditorSheet } from "@/components/admin-editor-sheet";
import { AdminSearchInput } from "@/components/admin-search-input";
import { Chevron } from "@/components/admin-overview";
import { AdminSortContext, AdminSortItem } from "@/components/admin-sortable";
import { adminButtonClass, adminDescriptionClass, adminFieldClass, adminHeadingClass } from "@/components/admin-ui";
import { galleryTrackLabels, type GalleryTrack } from "@/lib/gallery";
import { getFallbackGalleryImage, type AdminDraft } from "@/lib/admin-studio-draft";
import { formatPreparedImageSummary } from "@/lib/admin-image-summary";
import type { PreparedUploadImage } from "@/lib/admin-studio-save";
import styles from "./admin-studio.module.css";

const galleryTracks = ["lashes"] as const satisfies readonly GalleryTrack[];
const inputClassName = `${adminFieldClass} mt-1`;
const textareaClassName = `${inputClassName} py-1.5`;

type AdminGalleryTabProps = {
  gallery: AdminDraft["gallery"];
  extraEditorFields?: React.ReactNode;
  previewUrls: Record<string, string>;
  selectedFiles: Record<string, PreparedUploadImage>;
  editingGalleryId: string | null;
  onEditingGalleryIdChange: (id: string | null) => void;
  onAddGalleryItem: (track: GalleryTrack) => void;
  onReorderGallery: (fromId: string, toId: string) => void;
  onUpdateGalleryTrack: (id: string, track: GalleryTrack) => void;
  onUpdateGalleryText: (id: string, field: "title" | "description", value: string) => void;
  onRemoveGalleryItem: (item: AdminDraft["gallery"][number]) => void;
  onSelectPreview: (id: string, event: ChangeEvent<HTMLInputElement>) => Promise<void>;
};

export function AdminGalleryTab({
  extraEditorFields,
  gallery,
  previewUrls,
  selectedFiles,
  editingGalleryId,
  onEditingGalleryIdChange,
  onAddGalleryItem,
  onReorderGallery,
  onUpdateGalleryTrack,
  onUpdateGalleryText,
  onRemoveGalleryItem,
  onSelectPreview,
}: AdminGalleryTabProps) {
  const [gallerySearch, setGallerySearch] = useState("");
  const editingGallery = gallery.find((item) => item.id === editingGalleryId);
  const editingGallerySource = editingGallery
    ? previewUrls[editingGallery.id] ?? getFallbackGalleryImage(editingGallery.fallbackKey, gallery.indexOf(editingGallery))
    : null;
  const normalizedGallerySearch = gallerySearch.trim().toLocaleLowerCase("hu-HU");
  const visibleGalleryEntries = gallery
    .map((item, index) => ({
      item,
      index,
      categoryIndex: gallery.slice(0, index).filter((candidate) => candidate.track === item.track).length,
    }))
    .filter(({ item, categoryIndex }) => {
      if (!normalizedGallerySearch) return true;
      return `${categoryIndex + 1} ${galleryTrackLabels[item.track]} ${item.title} ${item.description}`
        .toLocaleLowerCase("hu-HU")
        .includes(normalizedGallerySearch);
    });
  const gallerySections = galleryTracks.map((track) => ({
    track,
    entries: visibleGalleryEntries.filter(({ item }) => item.track === track),
    total: gallery.filter((item) => item.track === track).length,
  }));

  return (
    <section aria-labelledby="admin-gallery-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 id="admin-gallery-title" className={adminHeadingClass}>Galéria</h1>
          <p className={adminDescriptionClass}>{gallery.length} kép · kategóriánként rendezhető</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" onClick={() => onAddGalleryItem("lashes")} className="min-h-8 rounded-lg bg-admin-accent px-2.5 text-[0.62rem] font-bold text-admin-bg">
            + Kép
          </button>
          
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <AdminSearchInput
            aria-label="Keresés a galériában"
            value={gallerySearch}
            onValueChange={setGallerySearch}
            placeholder="Kép keresése…"
          />
        </div>
        <span className="shrink-0 rounded-md bg-admin-raised px-2 py-1 text-[0.62rem] font-bold text-ink-muted" aria-live="polite">
          {visibleGalleryEntries.length}/{gallery.length}
        </span>
      </div>
      <div className="mt-3 min-h-48 space-y-4 rounded-xl bg-admin-surface p-2 pr-2.5">
        {gallerySections.map(({ track, entries, total }) => (
          <section key={track} aria-labelledby={`admin-gallery-${track}`}>
            <div className="mb-2 flex items-center gap-2 border-b border-gold-line pb-2">
              <span className={`size-2 rounded-full ${track === "lashes" ? "bg-admin-lashes" : "bg-admin-laser"}`} aria-hidden="true" />
              <h2 id={`admin-gallery-${track}`} className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink">{galleryTrackLabels[track]}</h2>
              <span className="ml-auto rounded-md bg-admin-raised px-1.5 py-0.5 text-[0.58rem] font-bold text-ink-muted">{entries.length}/{total}</span>
            </div>
            <AdminSortContext ids={entries.map(({ item }) => item.id)} onMove={onReorderGallery}>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6">
                {entries.map(({ item, index, categoryIndex }) => {
                  const source = previewUrls[item.id] ?? getFallbackGalleryImage(item.fallbackKey, index);
                  return (
                    <AdminSortItem key={item.id} id={item.id} label={item.title || `${categoryIndex + 1}. kép`} className="relative min-w-0">
                    {(handle) => <>
                    <button type="button" onClick={() => onEditingGalleryIdChange(item.id)} className="group block w-full min-w-0 overflow-hidden rounded-xl bg-admin-raised text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark">
                      <span className="relative block aspect-square overflow-hidden bg-admin-field">
                        {source ? <Image src={source} alt={item.alt} fill unoptimized={Boolean(previewUrls[item.id])} sizes="(max-width: 640px) 30vw, 160px" style={{ objectPosition: item.position }} className="object-cover" /> : <span className="absolute inset-0 grid place-items-center px-1 text-center text-[0.62rem] text-ink-muted">Kép választása</span>}
                        <span className="absolute bottom-1 left-1 rounded-md bg-admin-bg/85 px-1.5 py-0.5 text-[0.55rem] font-bold text-ink" aria-hidden="true">{categoryIndex + 1}</span>
                      </span>
                      <span className="flex min-h-8 items-center gap-1 px-2 py-1.5"><span className="min-w-0 flex-1 truncate text-[0.65rem] font-semibold">{item.title || `${categoryIndex + 1}. kép`}</span><Chevron /></span>
                    </button>
                    <div className="absolute right-1.5 top-1.5">{handle}</div>
                    </>}
                    </AdminSortItem>
                  );
                })}
              </div>
            </AdminSortContext>
            {entries.length === 0 ? <p className="rounded-lg bg-admin-raised px-3 py-5 text-center text-[0.65rem] text-ink-muted">{normalizedGallerySearch && total ? "Nincs találat ebben a kategóriában." : `Még nincs ${galleryTrackLabels[track].toLocaleLowerCase("hu-HU")} kép.`}</p> : null}
          </section>
        ))}
      </div>
      <AdminEditorSheet open={Boolean(editingGallery)} title="Kép szerkesztése" onClose={() => onEditingGalleryIdChange(null)}>
        {editingGallery ? (
          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-admin-field">
                {editingGallerySource ? <Image src={editingGallerySource} alt={editingGallery.alt} fill unoptimized={Boolean(previewUrls[editingGallery.id])} sizes="80px" className="object-cover" style={{ objectPosition: editingGallery.position }} /> : null}
              </div>
              <div className="grid min-w-0 flex-1 gap-2">
                <label className={`${adminButtonClass} cursor-pointer focus-within:outline-2 focus-within:outline-gold-dark`}>{editingGallery.storagePath || editingGallery.fallbackKey || previewUrls[editingGallery.id] ? "Kép cseréje" : "Kép kiválasztása"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void onSelectPreview(editingGallery.id, event)} className="sr-only" /></label>
                {selectedFiles[editingGallery.id] ? <p className="line-clamp-3 text-[0.6rem] leading-4 text-ink-muted">{formatPreparedImageSummary(selectedFiles[editingGallery.id])}</p> : null}
              </div>
            </div>
            {galleryTracks.length>1?<div>
              <p className="mb-1.5 text-xs font-semibold text-ink-muted">Kategória</p>
              <div className={styles.segmented} role="group" aria-label="Galériakép kategóriája">
                {galleryTracks.map((track) => (
                  <button key={track} type="button" aria-pressed={editingGallery.track === track} onClick={() => onUpdateGalleryTrack(editingGallery.id, track)}>{galleryTrackLabels[track]}</button>
                ))}
              </div>
            </div>:null}
            <label className="text-xs font-semibold text-ink-muted">Képleírás / alternatív szöveg<AdminAutoTextarea maxLength={500} value={editingGallery.description} onChange={(event) => onUpdateGalleryText(editingGallery.id, "description", event.target.value)} className={textareaClassName} /></label>
            {extraEditorFields}
            <button type="button" onClick={() => onRemoveGalleryItem(editingGallery)} className="mt-1 min-h-8 rounded-lg bg-admin-danger/10 px-3 text-xs font-semibold text-admin-danger">Kép törlése</button>
          </div>
        ) : null}
      </AdminEditorSheet>
    </section>
  );
}
