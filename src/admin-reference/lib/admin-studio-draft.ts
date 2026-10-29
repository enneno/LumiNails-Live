// LumiNails adapter: no source-project content/defaults or environment data.
export type AdminDraft = any;
export function getFallbackGalleryImage(key: string | null) { return key && /^(https?:|\/|data:image\/)/.test(key) ? key : ''; }
