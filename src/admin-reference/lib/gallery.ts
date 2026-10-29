// Frontend view of a LumiNails gallery image. Persistence stays in the existing CMS adapter.
export type AdminGalleryImage = {
  id: string;
  title: string;
  description: string;
  fallbackKey: string | null;
  storagePath: string | null;
  alt?: string;
  position?: string;
};
