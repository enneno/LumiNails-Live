// Route adapter only; reference content/defaults are not imported.
export const siteConfig={adminPath:"/admin/"};

export type PriceRow = {
  id: string;
  name: string;
  durationMinutes: number;
  prices: Record<string,string>;
  note: string;
};

export type PriceGroup = {
  id: string;
  title: string;
  description: string;
  columns: {id: string;label: string}[];
  items: PriceRow[];
};
