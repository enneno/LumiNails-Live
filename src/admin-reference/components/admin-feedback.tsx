"use client";

import styles from "./admin-feedback.module.css";

export type AdminFeedbackTone = "success" | "error" | "info";

export type AdminFeedbackMessage = {
  id: number;
  message: string;
  tone: AdminFeedbackTone;
};

export function AdminFeedbackNotice({ notice, onDismiss }: {
  notice: AdminFeedbackMessage;
  onDismiss: () => void;
}) {
  return (
    <div
      role={notice.tone === "error" ? "alert" : "status"}
      className={`${styles.notice} ${styles[notice.tone]}`}
    >
      <span className={styles.icon} aria-hidden="true">
        {notice.tone === "error" ? "!" : notice.tone === "success" ? "✓" : "i"}
      </span>
      <span className={styles.message}>{notice.message}</span>
      <button type="button" onClick={onDismiss} className={styles.dismiss} aria-label="Értesítés bezárása">
        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 fill-none stroke-current" strokeWidth="1.5" strokeLinecap="round"><path d="m5 5 10 10M15 5 5 15" /></svg>
      </button>
    </div>
  );
}
