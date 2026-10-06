/**
 * clsx مصغّرة — لتقليل الاعتماديات الخارجية.
 * (نفس سلوك clsx الأساسي: strings / arrays / objects)
 */
export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | Record<string, boolean>
  | ClassValue[];

export function clsx(inputs: ClassValue): string {
  const out: string[] = [];

  const walk = (value: ClassValue) => {
    if (!value) return;
    if (typeof value === "string" || typeof value === "number") {
      out.push(String(value));
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value === "object") {
      for (const [key, enabled] of Object.entries(value)) if (enabled) out.push(key);
    }
  };

  walk(inputs);
  return out.join(" ");
}
