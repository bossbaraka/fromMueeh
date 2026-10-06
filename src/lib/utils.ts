import { clsx, type ClassValue } from "./clsx";

/** دمج أصناف Tailwind بأمان */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `mur_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function shortId(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function formatDateTimeAr(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar", {
      dateStyle: "medium",
      timeStyle: "short",
      numberingSystem: "latn",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function charCount(value: string) {
  return value.trim().length;
}

/**
 * الأرقام العربية-الهندية (٤٠٠) والفارسية (۴۰۰).
 * JavaScript لا يعتبرها \d — والمستخدم العربي يكتبها كثيرًا،
 * لذا نحوّلها إلى ASCII قبل التحقق أو التحليل أو التسعير.
 */
export function toAsciiDigits(input: string): string {
  return input
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

export const hasAnyDigit = (input: string) => /[0-9]/.test(toAsciiDigits(input));

/** تقدير زمني لطيف لمدة الدخول (تستخدمه شاشة البداية) */
export function readingTime(words: number) {
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} دقيقة`;
}
