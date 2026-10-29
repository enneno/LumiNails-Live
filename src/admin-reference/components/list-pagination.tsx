"use client";

export function ListPagination({ page, pageCount, position, label, onPageChange, disabled = false,
  showBoundaryButtons = true, announcePage = position === "top", className, controlsClassName, buttonClassName, pageNumberClassName }: {
  page: number; pageCount: number; position: "top" | "bottom"; label: string;
  onPageChange: (page: number) => void; disabled?: boolean; showBoundaryButtons?: boolean; announcePage?: boolean;
  className?: string; controlsClassName?: string; buttonClassName?: string; pageNumberClassName?: string;
}) {
  const firstPage = page <= 1;
  const lastPage = page >= pageCount;
  return <nav className={className} aria-label={`${label} ${position === "top" ? "felül" : "alul"}`}>
    <div className={controlsClassName}>
      {showBoundaryButtons ? <button type="button" onClick={() => onPageChange(1)} disabled={disabled || firstPage} aria-label="Első oldal" title="Első oldal" className={buttonClassName}>«</button> : null}
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={disabled || firstPage} aria-label="Előző oldal" title="Előző oldal" className={buttonClassName}>‹</button>
      <span className={pageNumberClassName} aria-label={`${page}. oldal a(z) ${pageCount} oldalból`} aria-live={announcePage ? "polite" : undefined}>{page} / {pageCount}</span>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={disabled || lastPage} aria-label="Következő oldal" title="Következő oldal" className={buttonClassName}>›</button>
      {showBoundaryButtons ? <button type="button" onClick={() => onPageChange(pageCount)} disabled={disabled || lastPage} aria-label="Utolsó oldal" title="Utolsó oldal" className={buttonClassName}>»</button> : null}
    </div>
  </nav>;
}
