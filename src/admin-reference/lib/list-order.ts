export function moveListItem<T extends { id: string }>(items: T[], fromId: string, toId: string): T[] {
  const from = items.findIndex((item) => item.id === fromId);
  const to = items.findIndex((item) => item.id === toId);
  if (from < 0 || to < 0 || from === to) return items;
  const result = [...items];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

/** Match the admin's two calendars without changing the saved order within either. */
export function orderPriceGroups<T extends { track: "lashes" | "laser" }>(groups: T[]) {
  return [...groups.filter((group) => group.track === "lashes"), ...groups.filter((group) => group.track === "laser")];
}
