import type { PriceGroup, PriceRow, ServiceTrackId } from "@/data/site-content";
import { formatPrice } from "@/lib/price-format";
import { orderPriceGroups } from "@/lib/list-order";

export type CatalogBookingService = {
  id: string;
  track: ServiceTrackId;
  category: string;
  name: string;
  durationMinutes: number;
  durationLabel: string;
  priceLabel: string;
  displayOrder: number;
};

export function formatDuration(minutes: number) {
  const safeMinutes = normalizeDurationMinutes(minutes);
  return `${safeMinutes} perc`;
}

export function normalizeDurationMinutes(value: unknown, fallback = 60) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(480, Math.max(5, Math.round(value)));
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value.replace(/\D+/g, ""), 10);
    if (Number.isFinite(parsed)) return Math.min(480, Math.max(5, parsed));
  }

  return fallback;
}

export function formatPriceLabel(group: PriceGroup, item: PriceRow) {
  const values = group.columns
    .map((column) => ({ label: column.label, value: item.prices[column.id]?.trim() }))
    .filter((entry) => entry.value);

  if (values.length === 0) return "Ár egyeztetés szerint";
  if (values.length === 1) return formatPrice(values[0].value!);

  return values.map((entry) => `${entry.label}: ${formatPrice(entry.value!)}`).join(" · ");
}

export function catalogToBookingServices(priceGroups: PriceGroup[]): CatalogBookingService[] {
  return orderPriceGroups(priceGroups).flatMap((group, groupIndex) =>
    group.items.flatMap((item, itemIndex) => {
      const baseOrder = (groupIndex + 1) * 1000 + (itemIndex + 1) * 20;
      const common = {
        track: group.track,
        category: group.title,
        priceLabel: formatPriceLabel(group, item),
      };

      if (group.id !== "lashes") {
        return [{
          id: item.id,
          ...common,
          name: item.name,
          durationMinutes: normalizeDurationMinutes(item.durationMinutes),
          durationLabel: formatDuration(item.durationMinutes),
          displayOrder: baseOrder,
        }];
      }

      const smallDuration = normalizeDurationMinutes(item.durationMinutesS, 90);
      const mediumDuration = normalizeDurationMinutes(item.durationMinutes, 110);
      const priceVariants = group.columns
        .map((column, priceIndex) => ({
          id: column.id,
          label: column.label,
          price: item.prices[column.id]?.trim(),
          displayOrderOffset: priceIndex * 2,
        }))
        .filter((variant) => variant.price);

      return priceVariants.flatMap((variant) => {
        const category = `${group.title} · ${variant.label}`;
        const priceLabel = formatPrice(variant.price!);
        const isFullPrice = variant.id === "full";
        const idSuffix = isFullPrice ? "" : `-${variant.id}`;

        return [
          {
            id: isFullPrice ? `${item.id}-s` : `${item.id}${idSuffix}-s`,
            track: group.track,
            category,
            name: `${item.name} · S`,
            durationMinutes: smallDuration,
            durationLabel: formatDuration(smallDuration),
            priceLabel,
            displayOrder: baseOrder + variant.displayOrderOffset,
          },
          {
            id: isFullPrice ? item.id : `${item.id}${idSuffix}`,
            track: group.track,
            category,
            name: `${item.name} · M`,
            durationMinutes: mediumDuration,
            durationLabel: formatDuration(mediumDuration),
            priceLabel,
            displayOrder: baseOrder + variant.displayOrderOffset + 1,
          },
        ];
      });
    }),
  );
}

export function getMinimumCatalogDuration(priceGroups: PriceGroup[], track: ServiceTrackId) {
  const durations = catalogToBookingServices(priceGroups)
    .filter((service) => service.track === track)
    .map((service) => service.durationMinutes);

  return durations.length ? Math.min(...durations) : 0;
}

export function normalizeCatalogPriceGroups(
  saved: PriceGroup[] | undefined,
  fallback: PriceGroup[],
) {
  if (!Array.isArray(saved) || saved.length === 0) return structuredClone(fallback);

  const fallbackById = new Map(fallback.map((group) => [group.id, group]));
  const normalizedSaved = saved.flatMap((group) => {
    if (!group || typeof group.id !== "string" || !group.id.trim()) return [];

    const fallbackGroup = fallbackById.get(group.id);
    const columns = Array.isArray(group.columns) && group.columns.length > 0
      ? group.columns
          .filter((column) => column && typeof column.id === "string" && column.id.trim())
          .map((column) => ({
            id: column.id,
            label: typeof column.label === "string" && column.label.trim() ? column.label : "Ár",
          }))
      : structuredClone(fallbackGroup?.columns ?? [{ id: "single", label: "Ár" }]);
    const savedItems = Array.isArray(group.items) ? group.items : [];
    const savedItemIds = new Set(savedItems.map((item) => item?.id));
    const items = [
      ...savedItems,
      ...(fallbackGroup?.items.filter((item) => !savedItemIds.has(item.id)) ?? []),
    ].flatMap((item) => {
      if (!item || typeof item.id !== "string" || !item.id.trim()) return [];

      const fallbackItem = fallbackGroup?.items.find((candidate) => candidate.id === item.id);
      const legacyDuration = (item as unknown as { duration?: string }).duration;
      const isSizedLash = group.id === "lashes";
      const alreadyHasLashSizes = item.durationMinutesS !== undefined;
      const rawPrices = item.prices && typeof item.prices === "object" ? item.prices : fallbackItem?.prices ?? {};
      const prices = Object.fromEntries(
        columns.map((column) => [
          column.id,
          typeof rawPrices[column.id] === "string" ? rawPrices[column.id] : "",
        ]),
      );

      return [{
        ...fallbackItem,
        ...item,
        id: item.id,
        name: typeof item.name === "string" ? item.name : fallbackItem?.name ?? "Szolgáltatás",
        durationMinutes: isSizedLash && !alreadyHasLashSizes
          ? 110
          : normalizeDurationMinutes(item.durationMinutes ?? legacyDuration, isSizedLash ? 110 : 60),
        durationMinutesS: isSizedLash
          ? normalizeDurationMinutes(item.durationMinutesS, 90)
          : undefined,
        prices,
        note: typeof item.note === "string" ? item.note : fallbackItem?.note,
      }];
    });

    return [{
      ...fallbackGroup,
      ...group,
      id: group.id,
      title: typeof group.title === "string" ? group.title : fallbackGroup?.title ?? "Kategória",
      description: typeof group.description === "string" ? group.description : fallbackGroup?.description ?? "",
      track: group.track === "lashes" || group.track === "laser"
        ? group.track
        : fallbackGroup?.track ?? "lashes",
      columns,
      items,
    } satisfies PriceGroup];
  });

  const savedGroupIds = new Set(normalizedSaved.map((group) => group.id));
  return [
    ...normalizedSaved,
    ...fallback.filter((group) => !savedGroupIds.has(group.id)).map((group) => structuredClone(group)),
  ];
}
