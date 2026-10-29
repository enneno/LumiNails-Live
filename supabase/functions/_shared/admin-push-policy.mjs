// Shared server policy. Preferences affect device pushes only, never the admin inbox.
export const pushDefaults = Object.freeze({ newBooking: true, cancellation: true, guestRegistration: true, bookingEmailFailure: true });

export function normalizePushPreferences(value) {
  return Object.fromEntries(Object.entries(pushDefaults).map(([key, fallback]) => [key, typeof value?.[key] === 'boolean' ? value[key] : fallback]));
}

export function pushKind(body) {
  if (body.kind === 'guestRegistration') return 'guestRegistration';
  if (body.kind === 'bookingEmailFailure') return 'bookingEmailFailure';
  const event = String(body.type || body.event || '').toUpperCase();
  if (event === 'INSERT') return 'newBooking';
  if (event === 'UPDATE' && body.record?.status === 'cancelled_by_customer'
      && !['cancelled', 'cancelled_by_customer'].includes(body.old_record?.status)) return 'cancellation';
  return '';
}

export function pushPayload(kind, record, serviceName = 'Időpont') {
  const date = new Date(record.starts_at || '');
  const appointment = Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('hu-HU', {
    timeZone: 'Europe/Budapest', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
  const guest = String(record.customer_name || record.full_name || 'Vendég').trim() || 'Vendég';
  const title = { newBooking: 'Új Lumi Nails foglalás', cancellation: 'Vendég mondta le',
    guestRegistration: 'Új regisztráció', bookingEmailFailure: 'Foglalási e-mail küldése sikertelen' }[kind];
  const body = kind === 'guestRegistration' ? [guest, record.customer_email].filter(Boolean).join(' · ')
    : kind === 'bookingEmailFailure' ? [record.title, record.detail].filter(Boolean).join(' · ')
    : [guest, serviceName, appointment].filter(Boolean).join(' · ');
  return { title, body, icon: '/kepek/favicon-192.png', badge: '/kepek/favicon-96.png',
    tag: `lumi-${kind}-${record.id || record.user_id || 'notice'}`,
    data: { url: `/admin/?tab=${kind === 'guestRegistration' ? 'guests' : kind === 'bookingEmailFailure' ? 'logs' : 'bookings'}` } };
}
