// src/utils/phone.ts
export function normalizePhoneNumber(phone: string): string {
  let digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  } else if (digits.startsWith('234')) {
    digits = digits.slice(3);
  }

  return `+234${digits}`;
}
