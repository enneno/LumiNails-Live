export function parseHungarianPhone(value: string): { national: string; e164: string } | null {
  const raw = value.trim();
  if (!raw || /\p{L}/u.test(raw) || !/^[+\d\s().-]+$/.test(raw)) return null;

  const digits = raw.replace(/\D/g, "");
  let national: string;

  if (raw.includes("+")) {
    if (!raw.startsWith("+") || raw.indexOf("+", 1) !== -1 || !digits.startsWith("36")) return null;
    national = digits.slice(2);
  } else if (digits.startsWith("0036")) {
    national = digits.slice(4);
  } else if (digits.startsWith("06")) {
    national = digits.slice(2);
  } else if (digits.startsWith("36") && digits.length > 9) {
    national = digits.slice(2);
  } else {
    national = digits;
  }

  if (!/^[1-9]\d{7,8}$/.test(national)) return null;
  return { national, e164: `+36${national}` };
}
