export const api = () => (window as any).LumiAdminBackend;
export const today = () => new Date().toLocaleDateString("sv-SE");
export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
export function getPath(value: any, path: string) {
  return path.split(".").reduce((result, key) => result?.[key], value);
}
export function setPath(value: any, path: string, next: any) {
  const keys = path.split(".");
  let target = value;
  keys.slice(0, -1).forEach((key, index) => {
    target[key] ??= /^\d+$/.test(keys[index + 1]) ? [] : {};
    target = target[key];
  });
  target[keys.at(-1)!] = next;
}
export function move<T extends { id: string }>(
  rows: T[],
  from: string,
  to: string,
) {
  const result = [...rows],
    a = result.findIndex((row) => row.id === from),
    b = result.findIndex((row) => row.id === to);
  if (a < 0 || b < 0) return rows;
  result.splice(b, 0, result.splice(a, 1)[0]);
  return result;
}
export function priceGroups(rows: any[]) {
  const groups: any[] = [];
  for (const row of rows.filter((row) => !row._delete)) {
    const match = String(row.name).match(/^(.+?)\s+-\s+(.+)$/),
      title = match?.[1] || row.name;
    let group = groups.find((group) => group.title === title);
    if (!group) {
      group = {
        id: "group-" + row.id,
        track: "lashes",
        title,
        description: "",
        columns: [{ id: "price", label: "Ár" }],
        items: [],
      };
      groups.push(group);
    }
    group.items.push({
      id: row.id,
      name: match?.[2] || row.name,
      note: row.description || "",
      durationMinutes: row.duration_minutes || 60,
      prices: {
        price:
          row.price_value ||
          String(row.price_amount || "") ||
          row.price_text ||
          "",
      },
    });
  }
  return groups;
}
export function effectiveBookings(rows: any[], statuses: any, dates: any) {
  return rows.map((row) => {
    const dateDraft = dates[row.id];
    const starts = dateDraft
      ? new Date(dateDraft.date + "T" + dateDraft.time)
      : null;
    const ends = dateDraft
      ? new Date(dateDraft.date + "T" + dateDraft.endTime)
      : null;
    const valid =
      starts &&
      ends &&
      Number.isFinite(starts.getTime()) &&
      Number.isFinite(ends.getTime());
    return {
      ...row,
      status: statuses[row.id] || row.status,
      ...(valid
        ? {
            dateInput: dates[row.id].date,
            timeInput: dates[row.id].time,
            time: dates[row.id].time,
            endTime: dates[row.id].endTime,
            startsAt: starts.toISOString(),
            endsAt: ends.toISOString(),
          }
        : {}),
    };
  });
}
