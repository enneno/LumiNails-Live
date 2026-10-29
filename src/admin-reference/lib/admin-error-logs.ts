export type AdminErrorEvent = {
  id: number;
  source: string;
  occurred_at: string;
  title: string;
  detail: string;
};

export const sourceLabels: Record<string, string> = {
  cron: "Időzített feladat",
  booking_email: "Foglalási e-mail",
  reminder_email: "Emlékeztető e-mail",
  review_email: "Értékeléskérő e-mail",
  monthly_report: "Havi riport",
  push: "Pushértesítés",
  test: "Próba",
};

export function formatAdminErrorReport(events: AdminErrorEvent[]) {
  const formatDate = new Intl.DateTimeFormat("hu-HU", { dateStyle: "short", timeStyle: "medium" });
  return ["LumiNails – hibás háttérfutások (legfeljebb 7 nap, legutóbbi 200)", "",
    ...events.flatMap(event => [
      `${formatDate.format(new Date(event.occurred_at))} · ${event.title} · ${sourceLabels[event.source] || event.source} #${event.id}`,
      event.detail, "",
    ]),
  ].join("\n");
}
