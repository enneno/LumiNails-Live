export type GalleryTrack = "lashes" | "laser";

export const galleryTrackLabels: Record<GalleryTrack, string> = {
  lashes: "Köröm",
  laser: "Lézer",
};

export function inferGalleryTrack(fallbackKey?: string | null, id?: string | null): GalleryTrack {
  if (fallbackKey === "laser-treatment" || id?.startsWith("laser")) return "laser";
  return "lashes";
}
