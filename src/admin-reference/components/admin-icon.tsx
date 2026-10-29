import type { AdminTab } from "@/lib/admin-navigation";

type AdminIconName = AdminTab | "more" | "save" | "refresh" | "logout" | "close" | "external" | "add";

export function AdminIcon({ name, className }: { name: AdminIconName; className?: string }) {
  const content = (() => {
    switch (name) {
      case "external":
        return <><path d="M14 3h7v7M21 3l-9 9M10 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /></>;
      case "overview":
        return <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>;
      case "content":
        return <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H14l6 6v9.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5Z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>;
      case "services":
        return <><path d="m12 3 1.1 3.4a4 4 0 0 0 2.5 2.5L19 10l-3.4 1.1a4 4 0 0 0-2.5 2.5L12 17l-1.1-3.4a4 4 0 0 0-2.5-2.5L5 10l3.4-1.1a4 4 0 0 0 2.5-2.5Z" /><path d="m19 16 .5 1.5L21 18l-1.5.5L19 20l-.5-1.5L17 18l1.5-.5Z" /></>;
      case "prices":
        return <><path d="M4 5h16v14H4z" /><path d="M8 9h8M8 13h5M8 17h8" /></>;
      case "gallery":
        return <><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="9" r="1.5" /><path d="m4 17 5-5 4 4 2-2 5 4" /></>;
      case "questions":
        return <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 0 1 4.6 1c0 2-2.4 2.1-2.4 4M12 18h.01" /></>;
      case "training":
        return <><path d="m3 8 9-4 9 4-9 4-9-4Z" /><path d="M6 10v6c3 2.5 9 2.5 12 0v-6M21 8v7" /></>;
      case "bookings":
        return <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18M8 15l2 2 5-5" /></>;
      case "schedule":
        return <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>;
      case "notifications":
        return <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" /><circle cx="11" cy="18" r="2" fill="currentColor" stroke="none" /></>;
      case "logs":
        return <><path d="M5 4h10l4 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4Z" /><path d="M15 4v4h4M12 11v4M12 18h.01" /></>;
      case "approvals":
        return <><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-1.5a5.5 5.5 0 0 1 11 0V20M16 11l2 2 3-3" /></>;
      case "bulk-email":
        return <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>;
      case "save":
        return <><path d="M5 12.5 9.5 17 19 7.5" /></>;
      case "refresh":
        return <><path d="M20 11a8 8 0 1 0-2.34 5.66" /><path d="M20 4v7h-7" /></>;
      case "logout":
        return <><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M14 8l4 4-4 4M9 12h9" /></>;
      case "close":
        return <><path d="m6 6 12 12M18 6 6 18" /></>;
      case "add":
        return <><path d="M12 5v14M5 12h14" /></>;
      case "more":
        return <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>;
    }
  })();

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {content}
    </svg>
  );
}
