export async function copyAdminText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // LAN HTTP and denied clipboard permission need the legacy copy path.
  }
  const previous = document.activeElement;
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("aria-label", "Másolandó szöveg");
  field.style.position = "fixed";
  field.style.opacity = "0";
  (document.querySelector("dialog[open]") || document.body).append(field);
  try {
    field.focus({ preventScroll: true });
    field.select();
    if (!document.execCommand("copy")) throw new Error("Copy failed");
  } finally {
    field.remove();
    if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
  }
}
