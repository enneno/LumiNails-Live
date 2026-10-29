import type { PreparedImage } from "@/lib/image-compression";

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatImageFormat(format: PreparedImage["inputFormat"] | PreparedImage["outputFormat"]) {
  if (format === "jpeg") return "JPEG";
  if (format === "webp") return "WebP";
  if (format === "png") return "PNG";
  return "ismeretlen";
}

export function formatPreparedImageSummary(image: PreparedImage) {
  const input = `${formatFileSize(image.inputBytes)} ${formatImageFormat(image.inputFormat)} ${image.inputWidth}×${image.inputHeight}`;
  const output = `${formatFileSize(image.outputBytes)} ${formatImageFormat(image.outputFormat)} ${image.outputWidth}×${image.outputHeight}`;
  return `Forrás: ${input} → Feltöltés: ${output}${image.targetMet ? "" : " · 180 KB cél felett, 220 KB alatt"}`;
}
