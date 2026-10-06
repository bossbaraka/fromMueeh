/**
 * Local fallback store — يعمل عندما لا تكون مفاتيح Google Sheets موجودة
 * (تطوير / عرض تقديمي). نفس البيانات ونفس الشكل، لكن في ملف NDJSON داخل السيرفر.
 * الهدف: النظام لا يسقط أبدًا بسبب إعداد ناقص — لكنه يوضّح دائمًا أن الوضع محلي.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import type { TalentFormValues } from "./schema";

const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "talent-applications.ndjson");

export type LocalRecord = {
  submission_id: string;
  submitted_at: string;
  application_status: string;
  source: string;
  last_updated: string;
  values: TalentFormValues;
};

export async function appendLocal(record: LocalRecord): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  await fs.appendFile(FILE, JSON.stringify(record) + "\n", "utf8");
}

export async function readLocal(limit = 200): Promise<LocalRecord[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LocalRecord)
      .slice(-limit)
      .reverse();
  } catch {
    return [];
  }
}

export async function localEmailExists(email: string): Promise<boolean> {
  const target = email.trim().toLowerCase();
  const rows = await readLocal(2000);
  return rows.some((r) => String(r.values?.email ?? "").toLowerCase() === target);
}

/** تحديث سجل محلي (وضع العرض) — نفس عقد التحديث في Google Sheets */
export async function updateLocalSubmission(
  submissionId: string,
  patch: {
    application_status?: string;
    reviewer_notes?: string;
    ai_decision_support?: string;
    last_updated?: string;
  },
): Promise<boolean> {
  const rows = await readAllLocal();
  const index = rows.findIndex((r) => r.submission_id === submissionId);
  if (index < 0) return false;

  const record = rows[index] as LocalRecord & {
    reviewer_notes?: string;
    ai_decision_support?: string;
  };
  if (patch.application_status) record.application_status = patch.application_status;
  if (patch.reviewer_notes !== undefined) record.reviewer_notes = patch.reviewer_notes;
  if (patch.ai_decision_support !== undefined) record.ai_decision_support = patch.ai_decision_support;
  record.last_updated = patch.last_updated ?? new Date().toISOString();

  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(FILE, rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
  return true;
}

/** قراءة كل السجلات بترتيب الإدخال (الأقدم أولًا) — تُستخدم في الكتابة */
export async function readAllLocal(): Promise<LocalRecord[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LocalRecord);
  } catch {
    return [];
  }
}
