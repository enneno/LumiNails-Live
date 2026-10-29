"use client";

import styles from "./admin-studio.module.css";
import { ListPagination } from "@/components/list-pagination";

export function AdminListPagination({ page, pageCount, position, label, onPageChange }: {
  page: number;
  pageCount: number;
  position: "top" | "bottom";
  label: string;
  onPageChange: (page: number) => void;
}) {
  return (
    <ListPagination page={page} pageCount={pageCount} position={position} label={label} onPageChange={onPageChange}
      className={`${styles.listPagination} ${position === "bottom" ? styles.listPaginationBottom : ""}`}
      controlsClassName={styles.listPaginationControls} buttonClassName={styles.listPageButton} pageNumberClassName={styles.listPageNumber} />
  );
}
