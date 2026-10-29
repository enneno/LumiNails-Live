// Notification reading is separate from resolving a booking task.
export function adminNotifications(data: any) {
  const bookings = data.bookings || [];
  const readIds = new Set(data.notificationReadIds || []);
  const tasks = bookings
    .filter((row: any) => row.status === "new" ||
      (row.source === "online" && row.status === "guest_cancelled" && !row.cancellationAcknowledgedAt && !row.cancellationByAdmin))
    .map((row: any) => ({
      id: row.status === "new"
        ? `new:${row.notificationKey}`
        : `cancellation:${row.notificationKey}:${row.cancelledAt || row.updatedAt}`,
      title: (row.status === "new" ? "Új foglalás · " : "Vendéglemondás · ") + row.guestName,
      body: row.date + " · " + row.time + " · " + row.serviceLabel,
      bookingId: row.id,
      created: row.status === "new" ? row.createdAt : row.cancelledAt || row.updatedAt,
    }));
  const guestEvents = new Set(["booking_created", "customer_cancelled", "customer_registered",
    "customer_booking_updated", "customer_booking_rescheduled", "customer_rescheduled", "booking_rescheduled"]);
  const events = (data.events || [])
    .filter((row: any) => guestEvents.has(row.event_type) && !["admin", "email", "push"].includes(row.channel) &&
      (row.event_type !== "booking_rescheduled" || ["customer_account", "self_service", "customer"].includes(row.channel)) &&
      // The booking card owns this action, including its acknowledgement.
      !(row.event_type === "customer_cancelled" && row.referenceBookingId != null) &&
      !(row.event_type === "booking_created" && bookings.some((booking: any) => booking.id === row.referenceBookingId && booking.status === "new")))
    .slice(0, 50)
    .map((row: any) => ({
      // Confirming a new booking must not turn the same creation notice unread again.
      id: row.event_type === "booking_created" && row.referenceBookingKey ? `new:${row.referenceBookingKey}` : `event:${row.id}`,
      title: row.event_type === "customer_registered" ? "Új regisztráció" : row.title,
      body: row.message,
      target: row.event_type === "customer_registered" ? "guests" : "bookings",
      bookingId: row.referenceBookingId,
      created: row.created_at,
    }));
  return [...tasks, ...events].map(notice => ({ ...notice, attention: !readIds.has(notice.id) }));
}
