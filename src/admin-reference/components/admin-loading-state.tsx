import { AdminIcon } from "@/components/admin-icon";
import { adminDescriptionClass, adminHeadingClass, adminPrimaryButtonClass } from "@/components/admin-ui";
import styles from "./admin-studio.module.css";

export function AdminLoadingState({
  state = "loading",
  message,
  onRetry,
  embedded = false,
}: {
  state?: "loading" | "error";
  message?: string;
  onRetry?: () => void;
  embedded?: boolean;
}) {
  const isLoading = state === "loading";

  return (
    <div className={embedded ? "flex items-center justify-center py-6" : `${styles.shell} items-center justify-center py-6`}>
      <section className="grid w-full max-w-md gap-4 px-6 text-center" aria-busy={isLoading}>
        <p className="text-sm font-bold text-gold-dark">Golden Studio</p>
        <h1 className={adminHeadingClass}>
          {isLoading ? "Admin adatok betöltése…" : "Az adminadatok nem töltődtek be"}
        </h1>
        <p className={adminDescriptionClass} role="status">
          {isLoading ? "A friss adatok betöltése folyamatban." : message}
        </p>
        {!isLoading && onRetry ? (
          <button type="button" className={`${adminPrimaryButtonClass} min-h-11 justify-self-center`} onClick={onRetry}>
            <AdminIcon name="refresh" className="size-4" />Újrapróbálás
          </button>
        ) : null}
      </section>
    </div>
  );
}
