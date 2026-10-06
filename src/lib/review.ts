/**
 * Review service — طبقة واحدة تخدم وضعي التخزين (Google Sheets / محلي).
 * كل عمليات المراجعة البشرية تمرّ من هنا، حتى لا تتفرّع المنطق في الواجهة.
 */

import type { TalentValues } from "./schema";
import {
  isSheetsConfigured,
  listSubmissionRows,
  updateSubmissionRow,
} from "./sheets";
import { readAllLocal, updateLocalSubmission, type LocalRecord } from "./store";

export type ReviewRecord = {
  submission_id: string;
  submitted_at: string;
  application_status: string;
  source: string;
  reviewer_notes: string;
  ai_decision_support: string;
  /** القيم الكاملة (من record_json أو من السجل المحلي) */
  values: TalentValues | null;
  /** كل الأعمدة كسلاسل — للعرض السريع دون الحاجة إلى record_json */
  cells: Record<string, string>;
};

type LocalRecordWithReview = LocalRecord & {
  reviewer_notes?: string;
  ai_decision_support?: string;
};

const parseRecordJson = (raw: string): TalentValues | null => {
  if (!raw || raw.trim().length < 2) return null;
  try {
    return JSON.parse(raw) as TalentValues;
  } catch {
    return null;
  }
};

export async function listSubmissions(limit = 300): Promise<ReviewRecord[]> {
  if (isSheetsConfigured()) {
    const rows = await listSubmissionRows(limit);
    return rows.map(({ submission_id, values }) => ({
      submission_id,
      submitted_at: values.submitted_at ?? "",
      application_status: values.application_status || "NEW",
      source: values.source ?? "",
      reviewer_notes: values.reviewer_notes ?? "",
      ai_decision_support: values.ai_decision_support ?? "",
      values: parseRecordJson(values.record_json ?? ""),
      cells: values,
    }));
  }

  const local = (await readAllLocal()).slice(-limit).reverse() as LocalRecordWithReview[];
  return local.map((r) => ({
    submission_id: r.submission_id,
    submitted_at: r.submitted_at,
    application_status: r.application_status,
    source: r.source,
    reviewer_notes: r.reviewer_notes ?? "",
    ai_decision_support: r.ai_decision_support ?? "",
    values: r.values,
    cells: {},
  }));
}

export type ReviewPatch = {
  submission_id: string;
  application_status?: string;
  reviewer_notes?: string;
  ai_decision_support?: string;
};

export async function applyReview(patch: ReviewPatch): Promise<{
  storage: "google" | "local";
  row?: number;
  updated: string[];
}> {
  const record = {
    ...patch,
    last_updated: new Date().toISOString(),
  };
  delete (record as { submission_id?: string }).submission_id;

  if (isSheetsConfigured()) {
    const { row, updated } = await updateSubmissionRow(patch.submission_id, record);
    return { storage: "google", row, updated };
  }

  const ok = await updateLocalSubmission(patch.submission_id, record);
  if (!ok) throw new Error("SUBMISSION_NOT_FOUND");
  return { storage: "local", updated: Object.keys(record).filter((k) => k !== "last_updated") };
}

/** القيم الكاملة لطلب واحد (لتحليل دعم القرار) */
export async function getSubmission(submissionId: string): Promise<ReviewRecord | null> {
  const all = await listSubmissions(1000);
  return all.find((r) => r.submission_id === submissionId) ?? null;
}
