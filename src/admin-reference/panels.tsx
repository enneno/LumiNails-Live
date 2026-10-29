import { copyAdminText } from "./lib/clipboard";
import { useHorizontalSwipe } from "./components/use-horizontal-swipe";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./components/admin-studio.module.css";
import { AdminPricesTab } from "./components/admin-prices-tab";
import { AdminGalleryTab } from "./components/admin-gallery-tab";
import { AdminEditorSheet } from "./components/admin-editor-sheet";
import { AdminSearchInput } from "./components/admin-search-input";
import {
  AdminSelectMenu,
  AdminSelectField,
} from "./components/admin-select-menu";
import { AdminAutoTextarea } from "./components/admin-auto-textarea";
import { AdminTemporalInput } from "./components/admin-temporal-input";
import { AdminDetailRow } from "./components/admin-detail-row";
import { AdminListPagination } from "./components/admin-list-pagination";
import {
  AdminAppearanceControls,
  AdminAppearanceBridge,
} from "./components/admin-appearance";
import { AdminSortContext, AdminSortItem } from "./components/admin-sortable";
import { Chevron } from "./components/admin-overview";
import {
  AdminSwitch,
  adminButtonClass,
  adminFieldClass,
  adminHeadingClass,
  adminDescriptionClass,
  adminPrimaryButtonClass,
  adminIconButtonClass,
  adminPressableClass,
} from "./components/admin-ui";
import {
  api,
  clone,
  getPath,
  setPath,
  move,
  priceGroups,
  today,
} from "./model";

const field = `${adminFieldClass} mt-1`;
type Shared = any;
export function PricesPanel({ data, drafts, stage }: Shared) {
  const rows = drafts.prices || data.services || [],
    groups = priceGroups(rows),
    [editing, setEditing] = useState<string | null>(null),
    [newRow, setNewRow] = useState<string | null>(null);
  const edit = (id: string, changes: any) =>
    stage(
      "prices",
      rows.map((row: any) => (row.id === id ? { ...row, ...changes } : row)),
    );
  function add(group?: any) {
    const id = api().createId(),
      base = {
        id,
        name: group ? group.title + " - Új tétel" : "Új kategória - új tétel",
        description: "",
        price_amount: null,
        price_value: "",
        price_text: "",
        price_unit: "Ft",
        duration_minutes: 60,
        sort_order: (rows.length + 1) * 10,
        active: false,
        booking_enabled: false,
        _new: true,
      };
    stage("prices", [...rows, base]);
    setNewRow(id);
    setEditing(group?.id || "group-" + id);
  }
  return (
    <>
      <AdminPricesTab
        priceGroups={groups}
        renderRowExtras={(item) => {
          const row = rows.find((row: any) => row.id === item.id);
          return (
            <div className="mt-2 grid gap-2 border-t border-gold-line pt-2">
              <label className="min-w-0 text-[0.58rem] font-bold text-ink-muted">
                Ár egysége
                <input
                  className={field}
                  value={row.price_unit || "Ft"}
                  onChange={(event) =>
                    edit(row.id, { price_unit: event.target.value })
                  }
                />
              </label>
              {[
                ["active", "Látható az árlistában"],
                ["booking_enabled", "Foglalható"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between gap-3 text-[0.62rem] font-bold text-ink-muted"
                >
                  {label}
                  <AdminSwitch
                    checked={Boolean(row[key])}
                    onChange={(event: any) =>
                      edit(row.id, { [key]: event.target.checked })
                    }
                  />
                </label>
              ))}
            </div>
          );
        }}
        editingPriceGroup={groups.find((group) => group.id === editing)}
        newPriceRowId={newRow}
        onEditingPriceGroupIdChange={setEditing}
        onNewPriceRowIdChange={setNewRow}
        onAddPriceGroup={() => add()}
        onReorderPriceGroups={(from, to) => {
          const a = groups.find((group) => group.id === from),
            b = groups.find((group) => group.id === to);
          if (a && b)
            stage(
              "prices",
              move(groups, from, to)
                .flatMap((group: any) =>
                  group.items.map((item: any) =>
                    rows.find((row: any) => row.id === item.id),
                  ),
                )
                .concat(rows.filter((row: any) => row._delete))
                .map((row: any, index: number) => ({
                  ...row,
                  sort_order: (index + 1) * 10,
                })),
            );
        }}
        onUpdatePriceGroup={(id, key, value) => {
          const group = groups.find((group) => group.id === id);
          if (!group) return;
          if (key === "title")
            stage(
              "prices",
              rows.map((row: any) =>
                group.items.some((item: any) => item.id === row.id)
                  ? {
                      ...row,
                      name:
                        value +
                        (/\s+-\s+/.test(row.name)
                          ? " - " +
                            group.items.find((item: any) => item.id === row.id)
                              .name
                          : ""),
                    }
                  : row,
              ),
            );
        }}
        onAddPriceRow={(id) => add(groups.find((group) => group.id === id))}
        onReorderPriceRows={(_, from, to) =>
          stage(
            "prices",
            move(rows, from, to).map((row: any, index: number) => ({
              ...row,
              sort_order: (index + 1) * 10,
            })),
          )
        }
        onUpdatePriceRow={(groupId, id, key, value) => {
          const group = groups.find((group) => group.id === groupId);
          edit(
            id,
            key === "name"
              ? {
                  name: /\s+-\s+/.test(
                    rows.find((row: any) => row.id === id)?.name || "",
                  )
                    ? group.title + " - " + value
                    : value,
                }
              : { description: value },
          );
        }}
        onUpdatePriceDuration={(_, id, value) =>
          edit(id, { duration_minutes: value })
        }
        onUpdatePriceValue={(_, id, __, value) => {
          const amount = Number(String(value).replace(/[.\s]/g, ""));
          edit(id, {
            price_value: value,
            price_amount: Number.isFinite(amount) && amount > 0 ? amount : null,
            price_text: value ? value + " Ft" : "",
          });
        }}
        onRemovePriceRow={(_, id, name) => {
          if (confirm(`${name}: törlésre jelölöd? A Mentés véglegesíti.`))
            edit(id, { _delete: true });
        }}
        onRemovePriceGroup={(id, title) => {
          if (!confirm(`${title}: törlésre jelölöd a csoportot?`)) return;
          const group = groups.find((group) => group.id === id);
          stage(
            "prices",
            rows.map((row: any) =>
              group.items.some((item: any) => item.id === row.id)
                ? { ...row, _delete: true }
                : row,
            ),
          );
          setEditing(null);
        }}
      />
    </>
  );
}

export function GalleryPanel({ data, drafts, stage, run, report }: Shared) {
  const content = drafts.content || data.cms?.content || {},
    items = content.galeria?.elemek || [],
    [editing, setEditing] = useState<string | null>(null);
  const gallery = items.map((row: any, index: number) => ({
    id: row.id || row.kep || "image-" + index,
    track: "lashes",
    title: row.kepAlt || `Kép ${index + 1}`,
    description: row.kepAlt || "",
    fallbackKey: row.kep,
    storagePath: row.kep || null,
  }));
  const urls = Object.fromEntries(
    gallery
      .filter((row: any) => row.storagePath)
      .map((row: any) => [row.id, row.storagePath]),
  );
  const change = (next: any[]) => {
    const value = clone(content);
    value.galeria ??= {};
    value.galeria.elemek = next;
    stage("content", value);
  };
  const indexOf = (id: string) =>
    gallery.findIndex((row: any) => row.id === id);
  function selection(key: string, id: string, checked: boolean) {
    const path =
        key === "home"
          ? "fooldal.galeriaAtvezeto.kivalasztottKepek"
          : "szolgaltatasOldalak.nailArt.kivalasztottKepek",
      selected = getPath(content, path) || [],
      limit = key === "home" ? 5 : 4;
    if (checked && selected.length >= limit) {
      report(
        `Legfeljebb ${limit} kép választható. A korábbi kijelölések megmaradtak.`,
        "error",
      );
      return;
    }
    const value = clone(content);
    setPath(
      value,
      path,
      checked
        ? [...selected, id]
        : selected.filter((item: string) => item !== id),
    );
    stage("content", value);
  }
  return (
    <AdminGalleryTab
      gallery={gallery}
      previewUrls={urls}
      selectedFiles={{}}
      editingGalleryId={editing}
      onEditingGalleryIdChange={setEditing}
      onAddGalleryItem={() => {
        const id = api().createId();
        change([...items, { id, kep: "", kepAlt: "", magas: false }]);
        setEditing(id);
      }}
      onReorderGallery={(from, to) =>
        change(
          move(
            items.map((row: any, index: number) => ({
              ...row,
              id: gallery[index].id,
            })),
            from,
            to,
          ),
        )
      }
      onUpdateGalleryTrack={() => {}}
      onUpdateGalleryText={(id, _, value) => {
        const next = clone(items);
        next[indexOf(id)].kepAlt = value;
        change(next);
      }}
      onRemoveGalleryItem={(item) => {
        if (!confirm("Törlésre jelölöd a képet? A Mentés véglegesíti.")) return;
        const value = clone(content);
        value.galeria.elemek = items.filter(
          (_: any, index: number) => index !== indexOf(item.id),
        );
        for (const path of [
          "fooldal.galeriaAtvezeto.kivalasztottKepek",
          "szolgaltatasOldalak.nailArt.kivalasztottKepek",
        ])
          setPath(
            value,
            path,
            (getPath(value, path) || []).filter((id: string) => id !== item.id),
          );
        stage("content", value);
        setEditing(null);
      }}
      onSelectPreview={async (id, event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        api();
        const index = indexOf(id);
        await run(async () => {
          (window as any).LumiAdminCms.setData(content);
          const next = await api().upload(`galeria.elemek.${index}.kep`, file);
          stage("content", next.cms.content);
          return next;
        });
      }}
      extraEditorFields={
        editing ? (
          <div className="grid gap-3">
            <label className="min-w-0 text-xs font-bold text-ink-muted">
              Kép URL vagy fájlútvonal
              <input
                className={field}
                value={items[indexOf(editing)]?.kep || ""}
                onChange={(event) => {
                  const next = clone(items);
                  next[indexOf(editing)].kep = event.target.value;
                  change(next);
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-xs font-semibold">
              Magas kép
              <AdminSwitch
                checked={Boolean(items[indexOf(editing)]?.magas)}
                onChange={(event: any) => {
                  const next = clone(items);
                  next[indexOf(editing)].magas = event.target.checked;
                  change(next);
                }}
              />
            </label>
            {[
              [
                "home",
                "Megjelenjen a főoldalon",
                "fooldal.galeriaAtvezeto.kivalasztottKepek",
              ],
              [
                "nail",
                "Megjelenjen a Nail Art oldalon",
                "szolgaltatasOldalak.nailArt.kivalasztottKepek",
              ],
            ].map(([key, label, path]) => (
              <label
                key={key}
                className="flex items-center justify-between gap-3 text-xs font-semibold"
              >
                {label}
                <AdminSwitch
                  checked={(getPath(content, path) || []).includes(editing)}
                  onChange={(event: any) =>
                    selection(key, editing, event.target.checked)
                  }
                />
              </label>
            ))}
          </div>
        ) : null
      }
    />
  );
}

function ImageField({ path, label, value, onChange, onUpload, busy }: any) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-ink-muted">{label}</p>
      <div className="mt-2 flex items-start gap-3">
        <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg bg-admin-field">
          {value ? (
            <img
              src={value}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <label className={`${adminButtonClass} cursor-pointer`}>
            Kép cseréje
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(path, file);
              }}
            />
          </label>
          {value ? (
            <button
              type="button"
              className={`${adminButtonClass} ml-1 text-admin-danger`}
              onClick={() => onChange(path, "")}
            >
              Eltávolítás
            </button>
          ) : null}
        </div>
      </div>
      <label className="mt-2 block min-w-0 text-[0.62rem] font-bold text-ink-muted">
        Kép URL vagy fájlútvonal
        <input
          value={value || ""}
          onChange={(event) => onChange(path, event.target.value)}
          className={field}
        />
      </label>
    </div>
  );
}
export function ContentPanel({ data, drafts, stage, run, busy }: Shared) {
  const cms = data.cms,
    [group, setGroup] = useState(0);
  if (!cms)
    return <p className="text-xs text-ink-muted">Tartalom betöltése…</p>;
  const content = drafts.content || cms.content,
    definition = cms.groups[group] || cms.groups[0];
  function change(path: string, value: any) {
    const next = clone(content);
    setPath(next, path, value);
    stage("content", next);
  }
  function fieldView(def: any) {
    const value = getPath(content, def.path);
    if (def.type === "image")
      return (
        <ImageField
          key={def.path}
          path={def.path}
          label={def.label}
          value={value}
          busy={busy}
          onChange={change}
          onUpload={async (path: string, file: File) =>
            run(async () => {
              (window as any).LumiAdminCms.setData(content);
              const next = await api().upload(path, file);
              stage("content", next.cms.content);
              return next;
            })
          }
        />
      );
    if (def.type === "checkbox")
      return (
        <label
          key={def.path}
          className="flex items-center justify-between gap-3 text-xs font-semibold"
        >
          {def.label}
          <AdminSwitch
            checked={Boolean(value)}
            onChange={(event: any) => change(def.path, event.target.checked)}
          />
        </label>
      );
    return (
      <label
        key={def.path}
        className={`min-w-0 text-xs font-bold text-ink-muted ${def.type === "textarea" ? "sm:col-span-2" : ""}`}
      >
        {def.label}
        {def.type === "textarea" ? (
          <AdminAutoTextarea
            value={value || ""}
            onChange={(event) => change(def.path, event.target.value)}
            className={`${field} py-1.5`}
          />
        ) : (
          <input
            type={def.type === "url" ? "url" : "text"}
            value={value ?? ""}
            onChange={(event) => change(def.path, event.target.value)}
            className={field}
          />
        )}
      </label>
    );
  }
  const sets = cms.fieldsets[group] || [
    ["Tartalom", 0, definition.fields.length - 1],
  ];
  return (
    <section>
      <h1 className={adminHeadingClass}>Weboldal tartalma</h1>
      <div
        className={styles.contentTabs}
        role="tablist"
        aria-label="Szerkeszthető tartalom"
      >
        {cms.groups
          .filter((row: any) => !row.gallery)
          .map((row: any) => {
            const index = cms.groups.indexOf(row);
            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={group === index}
                className={styles.contentTab}
                onClick={() => setGroup(index)}
              >
                {row.title.replace(/^Főoldal\s+[–-]\s+/, "")}
              </button>
            );
          })}
      </div>
      <div className="mt-3 grid gap-4">
        {sets.map(([title, start, end]: any, index: number) => {
          const fields = definition.fields.slice(start, end + 1);
          const body = (
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map(fieldView)}
            </div>
          );
          return index > 0 && /kártya|kép|előny|gyakori kérdés/i.test(title) ? (
            <AdminDetailRow
              key={title}
              title={title}
              description={fields
                .filter((row: any) => row.type !== "image")
                .map((row: any) => getPath(content, row.path))
                .filter(Boolean)
                .slice(0, 2)
                .join(" · ")}
            >
              {body}
            </AdminDetailRow>
          ) : (
            <section
              key={title}
              className="rounded-xl bg-admin-surface p-3 lg:bg-admin-raised"
            >
              <h2 className="mb-3 text-sm font-bold">{title}</h2>
              {body}
            </section>
          );
        })}
      </div>
    </section>
  );
}
export function Publication({ data }: any) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <section className="mt-4 rounded-xl border border-gold-line p-3">
      <p className="text-xs font-semibold">Mentés és közzététel</p>
      <p className="mt-1 text-[0.68rem] text-ink-muted">
        {message ||
          data.publication?.text ||
          "A mentett és a nyilvánosan kiszolgált verzió állapota külön ellenőrizhető."}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {[
          ["status", "Megjelenés ellenőrzése"],
          ["publish", "Közzététel indítása"],
        ].map(([action, label]) => (
          <button
            key={action}
            type="button"
            disabled={busy}
            className={adminButtonClass}
            onClick={async () => {
              setBusy(true);
              try {
                await api().publication(action);
                setMessage(
                  api().snapshot().publication?.text ||
                    "Az ellenőrzés elindult.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

export { SchedulePanel } from "./schedule-panel";

export function CouponsPanel({ data, drafts, stage }: Shared) {
  const rows = drafts.coupons || data.coupons || [],
    [editing, setEditing] = useState<string | null>(null),
    row = rows.find((row: any) => row.id === editing);
  const change = (id: string, key: string, value: any) =>
    stage(
      "coupons",
      rows.map((row: any) => (row.id === id ? { ...row, [key]: value } : row)),
    );
  function add() {
    const id = api().createId();
    stage("coupons", [
      ...rows,
      {
        id,
        code: "",
        title: "Új kupon",
        description: "",
        discount_type: "percent",
        discount_value: 10,
        discount_basis: "service",
        discount_text: "10% kedvezmény",
        customer_scope: "all",
        valid_from: today(),
        valid_until: null,
        active: false,
        show_on_home: false,
        sort_order: (rows.length + 1) * 10,
        _new: true,
      },
    ]);
    setEditing(id);
  }
  return (
    <section>
      <div className="flex items-start justify-between gap-3">
        <h1 className={adminHeadingClass}>Kuponok</h1>
        <button type="button" className={adminButtonClass} onClick={add}>
          + Új kupon
        </button>
      </div>
      <AdminSortContext
        ids={rows.filter((row: any) => !row._delete).map((row: any) => row.id)}
        onMove={(from, to) =>
          stage(
            "coupons",
            move(rows, from, to).map((row: any, index: number) => ({
              ...row,
              sort_order: (index + 1) * 10,
            })),
          )
        }
      >
        <div className="mt-3 divide-y divide-gold-line">
          {rows
            .filter((row: any) => !row._delete)
            .map((row: any) => (
              <AdminSortItem
                key={row.id}
                id={row.id}
                label={row.title}
                className="flex min-w-0 items-center gap-1.5"
              >
                {(handle) => (
                  <>
                    {handle}
                    <button
                      type="button"
                      onClick={() => setEditing(row.id)}
                      className={`${adminPressableClass} flex min-h-12 w-full items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-admin-raised`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold">
                          {row.title}
                        </span>
                        <span className="mt-0.5 block text-[0.68rem] text-ink-muted">
                          {row.code} · {row.discount_text}
                        </span>
                      </span>
                      <span className="text-[0.62rem] text-ink-muted">
                        {row.active ? "Aktív" : "Inaktív"}
                      </span>
                      <Chevron />
                    </button>
                  </>
                )}
              </AdminSortItem>
            ))}
        </div>
      </AdminSortContext>
      <AdminEditorSheet
        open={Boolean(row)}
        title={row?.title || "Kupon"}
        onClose={() => setEditing(null)}
      >
        {row ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["code", "Kuponkód"],
              ["title", "Cím"],
              ["description", "Leírás"],
              ["discount_text", "Kedvezmény felirata"],
            ].map(([key, label]) => (
              <label key={key} className="text-xs font-bold text-ink-muted">
                {label}
                <input
                  className={field}
                  value={row[key] || ""}
                  onChange={(event) => change(row.id, key, event.target.value)}
                />
              </label>
            ))}
            <label className="text-xs font-bold">
              Típus
              <AdminSelectMenu
                value={row.discount_type}
                options={[
                  { value: "percent", label: "Százalék" },
                  { value: "fixed", label: "Fix összeg" },
                  { value: "text", label: "Szöveges kedvezmény" },
                ]}
                onChange={(value) => change(row.id, "discount_type", value)}
                ariaLabel="Kedvezmény típusa"
                buttonClassName="mt-1 w-full"
              />
            </label>
            <label className="text-xs font-bold">
              Érték
              <input
                type="number"
                min="0"
                className={field}
                value={row.discount_value}
                onChange={(event) =>
                  change(row.id, "discount_value", Number(event.target.value))
                }
              />
            </label>
            <label className="text-xs font-bold">
              Kedvezmény alapja
              <AdminSelectMenu
                value={row.discount_basis || "service"}
                options={[
                  { value: "service", label: "Szolgáltatás" },
                  { value: "decoration", label: "Díszítés" },
                  { value: "total", label: "Teljes összeg" },
                ]}
                onChange={(value) => change(row.id, "discount_basis", value)}
                ariaLabel="Kedvezmény alapja"
                buttonClassName="mt-1 w-full"
              />
            </label>
            <label className="text-xs font-bold">
              Kinek szól
              <AdminSelectMenu
                value={row.customer_scope || "all"}
                options={[
                  { value: "all", label: "Mindenkinek" },
                  { value: "new_customer", label: "Új vendégnek" },
                ]}
                onChange={(value) => change(row.id, "customer_scope", value)}
                ariaLabel="Kupon közönsége"
                buttonClassName="mt-1 w-full"
              />
            </label>
            <label className="text-xs font-bold">
              Ettől
              <AdminTemporalInput
                type="date"
                value={row.valid_from || ""}
                onChange={(event) =>
                  change(row.id, "valid_from", event.target.value)
                }
                containerClassName="mt-1"
              />
            </label>
            <label className="text-xs font-bold">
              Eddig
              <AdminTemporalInput
                type="date"
                value={row.valid_until || ""}
                onChange={(event) =>
                  change(row.id, "valid_until", event.target.value || null)
                }
                containerClassName="mt-1"
              />
            </label>
            {[
              ["active", "Aktív"],
              ["show_on_home", "Főoldalon megjelenik"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between gap-3 text-xs font-bold"
              >
                {label}
                <AdminSwitch
                  checked={Boolean(row[key])}
                  onChange={(event: any) =>
                    change(row.id, key, event.target.checked)
                  }
                />
              </label>
            ))}
            <label className="sm:col-span-2 text-xs font-bold">
              Szolgáltatás
              <AdminSelectMenu
                value={
                  row.service_id
                    ? "service:" + row.service_id
                    : row.service_category
                      ? "category:" + row.service_category
                      : "all"
                }
                options={[
                  { value: "all", label: "Minden szolgáltatás" },
                  ...(data.couponScopes || []).filter(
                    (option: any) => option.value !== "all",
                  ),
                ]}
                onChange={(value) =>
                  stage(
                    "coupons",
                    rows.map((item: any) =>
                      item.id === row.id
                        ? {
                            ...item,
                            service_id: String(value).startsWith("service:")
                              ? String(value).slice(8)
                              : null,
                            service_category: String(value).startsWith(
                              "category:",
                            )
                              ? String(value).slice(9)
                              : null,
                          }
                        : item,
                    ),
                  )
                }
                ariaLabel="Kupon szolgáltatása"
                buttonClassName="mt-1 w-full"
              />
            </label>
            <button
              type="button"
              className={`${adminButtonClass} text-admin-danger`}
              onClick={() => {
                if (confirm("Törlésre jelölöd a kupont?")) {
                  change(row.id, "_delete", true);
                  setEditing(null);
                }
              }}
            >
              Kupon törlése
            </button>
          </div>
        ) : null}
      </AdminEditorSheet>
    </section>
  );
}

export function GuestsPanel({
  data,
  bookings,
  onRebook,
  onOpen,
  onLoadHistory,
  report,
}: Shared) {
  const [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [size, setSize] = useState<any>(10),
    [editing, setEditing] = useState<any>(null);
  const rows = (data.guests || []).filter((row: any) =>
      [row.customer_name, row.customer_email, row.customer_phone]
        .join(" ")
        .toLocaleLowerCase("hu")
        .includes(search.toLocaleLowerCase("hu")),
    ),
    pages = size === "all" ? 1 : Math.max(1, Math.ceil(rows.length / size)),
    currentPage = Math.min(page, pages);
  useEffect(() => setPage(value => Math.min(value, pages)), [pages]);
  const swipe = useHorizontalSwipe(direction => {
    const next = Math.max(1, Math.min(pages, currentPage + (direction === "left" ? 1 : -1)));
    if (next === currentPage) return false;
    setPage(next);
  });
  const history = editing
    ? bookings.filter(
        (row: any) =>
          row.source === "online" &&
          ((editing.customer_email &&
            row.email.toLowerCase() === editing.customer_email.toLowerCase()) ||
            (editing.customer_phone &&
              row.phone.replace(/\D/g, "") ===
                editing.customer_phone.replace(/\D/g, ""))),
      )
    : [];
  return (
    <section {...swipe}>
      <h1 className={adminHeadingClass}>Vendégek</h1>
      <div className="mt-3">
        <AdminSearchInput
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Név, e-mail, telefon"
          aria-label="Vendég keresése"
        />
      </div>
      <div className={styles.bookingListControls}>
        <div className={styles.bookingListSummary}>
          <AdminSelectMenu
            value={size}
            options={[10, 20, 50, "all"].map((value) => ({
              value,
              label: value === "all" ? "Összes" : String(value),
            }))}
            onChange={(value) => {
              setSize(value);
              setPage(1);
            }}
            ariaLabel="Megjelenített vendégek száma"
          />
          <span>{rows.length} találat</span>
        </div>
        <AdminListPagination
          page={currentPage}
          pageCount={pages}
          position="top"
          label="Vendégek lapozása"
          onPageChange={setPage}
        />
      </div>
      <div className="mt-2 divide-y divide-gold-line">
        {(size === "all"
          ? rows
          : rows.slice((currentPage - 1) * size, currentPage * size)
        ).map((row: any) => (
          <button
            key={row.user_id || row.customer_email}
            type="button"
            onClick={() => {
              setEditing(row);
              void onLoadHistory?.();
            }}
            className={`${adminPressableClass} flex min-h-12 w-full items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-admin-raised`}
          >
            <span className="min-w-0 flex-1">
              <strong className="block text-xs">{row.customer_name}</strong>
              <span className="mt-0.5 block text-[0.68rem] text-ink-muted">
                {row.customer_email} · {row.customer_phone}
              </span>
            </span>
            <Chevron />
          </button>
        ))}
      </div>
      <AdminEditorSheet
        open={Boolean(editing)}
        title={editing?.customer_name || "Vendég"}
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <div className="grid gap-3">
            <a
              href={"mailto:" + editing.customer_email}
              className="text-xs text-gold-dark"
            >
              {editing.customer_email}
            </a>
            <div className="flex gap-2">
              <a
                href={"tel:" + editing.customer_phone}
                className={adminButtonClass}
              >
                {editing.customer_phone}
              </a>
              <button
                type="button"
                className={adminButtonClass}
                onClick={() => void copyAdminText(editing.customer_phone).then(() => report("Telefonszám másolva.", "success")).catch(() => report("A másolás nem sikerült. Jelöld ki és másold a telefonszámot kézzel.", "error"))}
              >
                Másolás
              </button>
            </div>
            <button
              type="button"
              className={adminButtonClass}
              onClick={() => {
                onRebook({ guestName: editing.customer_name });
                setEditing(null);
              }}
            >
              Új kézi időpont
            </button>
            <p className="mt-2 text-xs font-bold">
              Betöltött online foglalások
            </p>
            {history.map((row: any) => (
              <button
                key={row.id}
                type="button"
                className={`${adminPressableClass} flex items-center justify-between rounded-lg bg-admin-raised p-3 text-left text-xs`}
                onClick={() => {
                  setEditing(null);
                  onOpen(row.id);
                }}
              >
                <span>
                  {row.date} · {row.time}
                  <strong className="mt-1 block">{row.serviceLabel}</strong>
                </span>
                <Chevron />
              </button>
            ))}
            {!history.length ? (
              <p className="text-xs text-ink-muted">
                Nincs betöltött online előzmény.
              </p>
            ) : null}
          </div>
        ) : null}
      </AdminEditorSheet>
    </section>
  );
}

export { LogsPanel } from "./logs-panel";

export { SettingsPanel, CalculatorPanel, Inbox } from "./extensions";
