"use client";


import { AdminDurationInput } from "@/components/admin-duration-input";
import { AdminEditorSheet } from "@/components/admin-editor-sheet";
import { AdminPriceInput } from "@/components/admin-price-input";
import { AdminSelectField } from "@/components/admin-select-menu";
import { AdminSortContext, AdminSortItem } from "@/components/admin-sortable";
import { AdminDangerButton, adminDescriptionClass, adminFieldClass, adminHeadingClass, adminPressableClass } from "@/components/admin-ui";
import type { PriceGroup } from "@/data/site-content";
import styles from "./admin-studio.module.css";

const inputClassName = `${adminFieldClass} mt-1`;
const sectionTitleClassName = adminHeadingClass;
const sectionDescriptionClassName = adminDescriptionClass;

const priceTrackSections = [
  { id: "lashes", label: "Köröm", description: "A LumiNails szolgáltatásai" },

] as const;

type AdminPricesTabProps = {
  priceGroups: PriceGroup[];
  renderRowExtras?: (item: any) => React.ReactNode;
  editingPriceGroup: PriceGroup | undefined;
  newPriceRowId: string | null;
  onEditingPriceGroupIdChange: (id: string | null) => void;
  onNewPriceRowIdChange: (id: string | null) => void;
  onAddPriceGroup: (track: PriceGroup["track"]) => void;
  onReorderPriceGroups: (fromId: string, toId: string) => void;
  onUpdatePriceGroup: (groupId: string, field: "title" | "description" | "track", value: string) => void;
  onAddPriceRow: (groupId: string) => void;
  onReorderPriceRows: (groupId: string, fromId: string, toId: string) => void;
  onUpdatePriceRow: (groupId: string, rowId: string, field: "name" | "note", value: string) => void;
  onUpdatePriceDuration: (groupId: string, rowId: string, value: number, size?: "regular" | "small") => void;
  onUpdatePriceValue: (groupId: string, rowId: string, columnId: string, value: string) => void;
  onRemovePriceRow: (groupId: string, rowId: string, rowName: string) => void;
  onRemovePriceGroup: (groupId: string, groupTitle: string) => void;
};

export function AdminPricesTab({
  renderRowExtras,
  priceGroups,
  editingPriceGroup,
  newPriceRowId,
  onEditingPriceGroupIdChange: setEditingPriceGroupId,
  onNewPriceRowIdChange: setNewPriceRowId,
  onAddPriceGroup: addPriceGroup,
  onReorderPriceGroups: reorderPriceGroups,
  onUpdatePriceGroup: updatePriceGroup,
  onAddPriceRow: addPriceRow,
  onReorderPriceRows: reorderPriceRows,
  onUpdatePriceRow: updatePriceRow,
  onUpdatePriceDuration: updatePriceDuration,
  onUpdatePriceValue: updatePriceValue,
  onRemovePriceRow: removePriceRow,
  onRemovePriceGroup: removePriceGroup,
}: AdminPricesTabProps) {
  return (
    <section aria-labelledby="admin-prices-title">
      <h1 id="admin-prices-title" className={sectionTitleClassName}>
        Árak és időtartamok
      </h1>
      <p className={sectionDescriptionClassName}>
        Ez az egyetlen szolgáltatáslista: az itt szereplő tételek jelennek meg az árlistán és a foglalóban is.
      </p>
      <div className="mt-3 grid gap-4">
        {priceTrackSections.map((section) => {
          const groups = priceGroups.filter((group) => group.track === section.id);

          return (
            <section key={section.id} aria-labelledby={`price-track-${section.id}`}>
              <div className="flex items-center justify-between gap-3 border-b border-gold-line pb-1.5">
                <div className="min-w-0">
                  <h2 id={`price-track-${section.id}`} className="text-sm font-extrabold">
                    {section.label}
                  </h2>
                  <p className="truncate text-[0.6rem] font-medium text-ink-muted">
                    {section.description} · {groups.length} kategória
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addPriceGroup(section.id)}
                  className={`${adminPressableClass} inline-flex min-h-8 shrink-0 items-center justify-center rounded-md border border-gold-line bg-admin-raised px-2.5 text-[0.64rem] font-extrabold text-gold-dark hover:border-gold-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark`}
                >
                  + Kategória
                </button>
              </div>
              <AdminSortContext ids={groups.map((group) => group.id)} onMove={reorderPriceGroups}>
              <div className="divide-y divide-gold-line">
                {groups.map((group, groupIndex) => (
                  <AdminSortItem key={group.id} id={group.id} label={group.title} className="flex min-w-0 items-center gap-1.5">
                  {(handle) => <>
                  <span className="w-4 shrink-0 text-center text-[0.56rem] font-extrabold tabular-nums text-ink-muted" aria-label={`${groupIndex + 1}. hely`}>{groupIndex + 1}</span>
                  {handle}
                  <button
                    type="button"
                    onClick={() => setEditingPriceGroupId(group.id)}
                    className={`${adminPressableClass} flex min-h-10 min-w-0 flex-1 items-center gap-2.5 rounded-md px-1 py-1.5 text-left hover:bg-gold-soft/70 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-dark`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-extrabold">{group.title}</span>
                      <span className="block truncate text-[0.6rem] font-medium text-ink-muted">
                        {group.items.length} szolgáltatás
                      </span>
                    </span>
                    <span className="shrink-0 rounded-md bg-gold-soft px-1.5 py-1 text-[0.56rem] font-bold text-gold-dark">
                      {group.columns.length === 1 ? "1 ár" : `${group.columns.length} ár`}
                    </span>
                    <span className="text-base text-gold-dark" aria-hidden="true">›</span>
                  </button>
                  </>}
                  </AdminSortItem>
                ))}
                {groups.length === 0 ? (
                  <p className="px-1 py-3 text-[0.66rem] font-medium text-ink-muted">
                    Még nincs kategória ebben a csoportban.
                  </p>
                ) : null}
              </div>
              </AdminSortContext>
            </section>
          );
        })}
      </div>

      <AdminEditorSheet
        open={Boolean(editingPriceGroup)}
        title={editingPriceGroup?.title ?? "Árlista"}
        description={editingPriceGroup?.description}
        onClose={() => { setEditingPriceGroupId(null); setNewPriceRowId(null); }}
      >
        {editingPriceGroup ? (
          <div className="grid gap-3">
            <div className="grid gap-1.5 sm:grid-cols-3">
              <label className="text-xs font-bold text-ink-muted">
                Csoport neve
                <input
                  value={editingPriceGroup.title}
                  onChange={(event) => updatePriceGroup(editingPriceGroup.id, "title", event.target.value)}
                  className={inputClassName}
                />
              </label>
              
              
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-gold-line pb-1.5">
              <p className="text-[0.62rem] font-bold text-ink-muted">
                {editingPriceGroup.items.length} szolgáltatás
              </p>
              <button
                type="button"
                onClick={() => addPriceRow(editingPriceGroup.id)}
                className={`${adminPressableClass} inline-flex min-h-8 items-center justify-center rounded-md border border-gold-line bg-admin-raised px-2.5 text-[0.64rem] font-extrabold text-gold-dark hover:border-gold-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-dark`}
              >
                + Szolgáltatás
              </button>
            </div>

            <AdminSortContext ids={editingPriceGroup.items.map((item) => item.id)} onMove={(fromId, toId) => reorderPriceRows(editingPriceGroup.id, fromId, toId)}>
            <div className="divide-y divide-gold-line border-b border-gold-line">
              {editingPriceGroup.items.map((item, itemIndex) => {
                const hasSinglePrice = editingPriceGroup.columns.length === 1;
                const hasLashSizes = editingPriceGroup.id === "lashes";

                return (
                  <AdminSortItem key={item.id} id={item.id} label={item.name} isNew={item.id === newPriceRowId} className={`relative py-2 pl-9 ${item.id === newPriceRowId ? styles.newItem : ""}`}>
                    {(handle) => <>
                    <span className="absolute left-0 top-0.5 w-8 text-center text-[0.52rem] font-extrabold tabular-nums text-ink-muted" aria-label={`${itemIndex + 1}. hely`}>{itemIndex + 1}</span>
                    <div className="absolute left-0 top-6">{handle}</div>
                    {hasSinglePrice ? (
                      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2rem] gap-1.5 min-[360px]:grid-cols-[minmax(0,1fr)_2.75rem_4.75rem_2rem]">
                        <label className="col-span-2 row-start-1 min-w-0 text-[0.58rem] font-bold text-ink-muted min-[360px]:col-span-1 min-[360px]:col-start-1">
                          Szolgáltatás
                          <input
                            value={item.name}
                            onChange={(event) => updatePriceRow(editingPriceGroup.id, item.id, "name", event.target.value)}
                            className={inputClassName}
                          />
                        </label>
                        <label className="col-start-1 row-start-2 min-w-0 text-[0.58rem] font-bold text-ink-muted min-[360px]:col-start-2 min-[360px]:row-start-1">
                          Idő
                          <AdminDurationInput
                            value={item.durationMinutes}
                            onCommit={(nextValue) => updatePriceDuration(editingPriceGroup.id, item.id, nextValue)}
                            className={`${inputClassName} px-2 text-center`}
                          />
                        </label>
                        <label className="col-start-2 row-start-2 w-[4.75rem] min-w-0 text-[0.58rem] font-bold text-ink-muted min-[360px]:col-start-3 min-[360px]:row-start-1">
                          {editingPriceGroup.columns[0].label}
                          <AdminPriceInput
                            value={item.prices[editingPriceGroup.columns[0].id] ?? ""}
                            onChange={(value) => updatePriceValue(editingPriceGroup.id, item.id, editingPriceGroup.columns[0].id, value)}
                            className={`${inputClassName} px-2 text-right`}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removePriceRow(editingPriceGroup.id, item.id, item.name)}
                          className="col-start-3 row-start-1 mt-[1.05rem] inline-flex size-8 items-center justify-center rounded-md border border-admin-danger/30 bg-admin-danger/10 text-base leading-none text-admin-danger hover:bg-admin-danger/15 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-admin-danger min-[360px]:col-start-4"
                          aria-label={`${item.name} szolgáltatás törlése`}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className={`grid gap-1.5 ${hasLashSizes ? "grid-cols-[minmax(0,1fr)_2.6rem_2.6rem_2rem]" : "grid-cols-[minmax(0,1fr)_2.75rem_2rem]"}`}>
                          <label className="min-w-0 text-[0.58rem] font-bold text-ink-muted">
                            Szolgáltatás
                            <input
                              value={item.name}
                              onChange={(event) => updatePriceRow(editingPriceGroup.id, item.id, "name", event.target.value)}
                              className={inputClassName}
                            />
                          </label>
                          {hasLashSizes ? (
                            <label className="min-w-0 text-center text-[0.55rem] font-bold text-ink-muted">
                              S idő
                              <AdminDurationInput
                                value={item.durationMinutesS ?? 90}
                                onCommit={(nextValue) => updatePriceDuration(editingPriceGroup.id, item.id, nextValue, "small")}
                                aria-label={`${item.name} S méret ideje percben`}
                                className={`${inputClassName} px-1 text-center`}
                              />
                            </label>
                          ) : null}
                          <label className="min-w-0 text-center text-[0.55rem] font-bold text-ink-muted">
                            {hasLashSizes ? "M idő" : "Idő"}
                            <AdminDurationInput
                              value={item.durationMinutes}
                              onCommit={(nextValue) => updatePriceDuration(editingPriceGroup.id, item.id, nextValue)}
                              aria-label={`${item.name} ${hasLashSizes ? "M méret " : ""}ideje percben`}
                              className={`${inputClassName} px-1 text-center`}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => removePriceRow(editingPriceGroup.id, item.id, item.name)}
                            className="mt-[1.05rem] inline-flex size-8 items-center justify-center rounded-md border border-admin-danger/30 bg-admin-danger/10 text-base leading-none text-admin-danger hover:bg-admin-danger/15 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-admin-danger"
                            aria-label={`${item.name} szolgáltatás törlése`}
                          >
                            ×
                          </button>
                        </div>
                        <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                          {editingPriceGroup.columns.map((column) => (
                            <label key={column.id} className="min-w-0 text-[0.55rem] font-bold leading-3 text-ink-muted">
                              <span className="block truncate">{column.label}</span>
                              <AdminPriceInput
                                value={item.prices[column.id] ?? ""}
                                onChange={(value) => updatePriceValue(editingPriceGroup.id, item.id, column.id, value)}
                                className={`${inputClassName} ml-auto max-w-[4.75rem] px-1.5 text-center`}
                              />
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                    {true ? (
                      <label className="mt-1.5 block text-[0.58rem] font-bold text-ink-muted">
                        Rövid név a foglalóban
                        <input
                          value={item.note}
                          onChange={(event) => updatePriceRow(editingPriceGroup.id, item.id, "note", event.target.value)}
                          className={inputClassName}
                        />
                      </label>
                    ) : null}
                    {renderRowExtras?.(item)}
                    </>}
                  </AdminSortItem>
                );
              })}
              {editingPriceGroup.items.length === 0 ? (
                <p className="py-3 text-[0.66rem] font-medium text-ink-muted">
                  Adj hozzá legalább egy szolgáltatást a mentéshez.
                </p>
              ) : null}
            </div>
            </AdminSortContext>

            <div className="flex justify-end">
              <AdminDangerButton
                onClick={() => removePriceGroup(editingPriceGroup.id, editingPriceGroup.title)}
              >
                Kategória törlése
              </AdminDangerButton>
            </div>
          </div>
        ) : null}
      </AdminEditorSheet>
    </section>
  );
}
