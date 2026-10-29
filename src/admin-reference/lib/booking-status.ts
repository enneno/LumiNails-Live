export type BookingStatus = "new" | "confirmed" | "completed" | "no_show" | "cancelled" | "guest_cancelled";

export const bookingStatusLabels: Record<BookingStatus, string> = {
  new: "Új",
  confirmed: "Megerősítve",
  completed: "Teljesítve",
  no_show: "Nem jelent meg",
  cancelled: "Általam lemondva",
  guest_cancelled: "Vendég mondta le",
};

export function getBookingStatusBadgeClass(status: BookingStatus) {
  switch (status) {
    case "new": return "bg-admin-accent/15 text-admin-accent-strong";
    case "confirmed": return "bg-admin-confirmed/15 text-admin-confirmed-text";
    case "completed": return "bg-admin-success/15 text-admin-success";
    case "no_show": return "bg-admin-danger/15 text-admin-danger";
    case "cancelled":
    case "guest_cancelled": return "bg-admin-danger/15 text-admin-danger";
  }
}

export function getBookingStatusDotClass(status: BookingStatus) {
  switch (status) {
    case "new": return "bg-admin-accent";
    case "confirmed": return "bg-admin-confirmed";
    case "completed": return "bg-admin-success";
    case "no_show": return "bg-admin-danger";
    case "cancelled":
    case "guest_cancelled": return "bg-admin-danger";
  }
}
