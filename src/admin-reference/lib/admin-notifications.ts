// Notification reading is separate from resolving a booking task.
export function adminNotifications(data: any) {
  const bookings = data.bookings || [];
  const readIds = new Set(data.notificationReadIds || []);
  const bookingDetails = (row: any) =>
    [
      row.date,
      `${row.time}–${row.endTime}`,
      row.serviceLabel,
      row.phone,
      row.email,
    ]
      .filter(Boolean)
      .join(" · ");
  const tasks = bookings
    .filter(
      (row: any) =>
        row.status === "new" ||
        (row.source === "online" &&
          row.status === "guest_cancelled" &&
          !row.cancellationAcknowledgedAt &&
          !row.cancellationByAdmin),
    )
    .map((row: any) => ({
      id:
        row.status === "new"
          ? `new:${row.notificationKey}`
          : `cancellation:${row.notificationKey}:${row.cancelledAt || row.updatedAt}`,
      title:
        (row.status === "new" ? "Új foglalás · " : "Vendéglemondás · ") +
        row.guestName,
      body: bookingDetails(row),
      bookingId: row.id,
      created:
        row.status === "new" ? row.createdAt : row.cancelledAt || row.updatedAt,
    }));
  const guestEvents = new Set([
    "booking_created",
    "customer_cancelled",
    "customer_booking_updated",
    "customer_booking_rescheduled",
    "customer_rescheduled",
    "booking_rescheduled",
  ]);
  const events = (data.events || [])
    .filter(
      (row: any) =>
        guestEvents.has(row.event_type) &&
        !["admin", "email", "push"].includes(row.channel) &&
        (row.event_type !== "booking_rescheduled" ||
          ["customer_account", "self_service", "customer"].includes(
            row.channel,
          )) &&
        // The booking card owns this action, including its acknowledgement.
        !(
          row.event_type === "customer_cancelled" &&
          row.referenceBookingId != null
        ) &&
        !(
          row.event_type === "booking_created" &&
          bookings.some(
            (booking: any) =>
              booking.id === row.referenceBookingId && booking.status === "new",
          )
        ),
    )
    .slice(0, 50)
    .map((row: any) => {
      const booking = bookings.find(
        (booking: any) => booking.id === row.referenceBookingId,
      );
      const label =
        row.event_type === "booking_created"
          ? "Új foglalás"
          : row.event_type === "customer_cancelled"
            ? "Vendéglemondás"
            : "Vendég módosította az időpontját";
      return {
        // Confirming a new booking must not turn the same creation notice unread again.
        id:
          row.event_type === "booking_created" && row.referenceBookingKey
            ? `new:${row.referenceBookingKey}`
            : `event:${row.id}`,
        title: booking ? `${label} · ${booking.guestName}` : row.title,
        body: booking ? bookingDetails(booking) : row.message,
        target: "bookings",
        bookingId: row.referenceBookingId,
        created: row.created_at,
      };
    });
  const registrations = (data.registrations || []).map((row: any) => ({
    id: `registration:${row.user_id}`,
    title: `Új regisztráció · ${row.customer_name || "Vendég"}`,
    body: [row.customer_email, row.customer_phone].filter(Boolean).join(" · "),
    target: "guests",
    created: row.created_at,
  }));
  return [...tasks, ...events, ...registrations]
    .sort((a, b) => Date.parse(b.created) - Date.parse(a.created))
    .map((notice) => ({ ...notice, attention: !readIds.has(notice.id) }));
}
