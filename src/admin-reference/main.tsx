import React from "react";
import { createRoot } from "react-dom/client";
import { LumiAdminStudio } from "./studio";
import { AdminViewportBridge } from "./components/admin-viewport-bridge";
import viewportStyles from "./app/admin/viewport.module.css";

window.LumiReferenceUiActive = true;
document.body.classList.add("admin-reference-active");
const root = document.getElementById("admin-reference-root");
if (root)
  createRoot(root).render(
    <div
      data-admin-viewport
      className={`admin-theme bg-admin-shell text-ink ${viewportStyles.viewport}`}
    >
      <AdminViewportBridge />
      <LumiAdminStudio />
    </div>,
  );
