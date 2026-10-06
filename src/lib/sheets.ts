/**
 * Google Sheets integration — server-side فقط.
 * ⚠️ لا يُستورد هذا الملف أبدًا من أي Client Component.
 * المصادقة: Google Service Account (JWT) عبر متغيّرات البيئة.
 */

import { google, sheets_v4 } from "googleapis";
import {
  SHEET_NAME,
  COLUMN_KEYS,
  headerRow,
  columnRef,
  columnLetter,
  buildSheetRow,
  type BuildRowOptions,
} from "./sheets-schema";

export type SheetsMode = "google" | "local";

const SA_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() || "";
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n").trim();
const SHEET_ID = process.env.GOOGLE_SHEET_ID?.trim() || "";

export const isSheetsConfigured = () =>
  Boolean(SA_EMAIL && PRIVATE_KEY && SHEET_ID && PRIVATE_KEY.includes("BEGIN PRIVATE KEY"));

export function storageMode(): SheetsMode {
  return isSheetsConfigured() ? "google" : "local";
}

let cached: sheets_v4.Sheets | null = null;

function client(): sheets_v4.Sheets {
  if (cached) return cached;
  const auth = new google.auth.JWT({
    email: SA_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  cached = google.sheets({ version: "v4", auth });
  return cached;
}

const range = (a1: string) => `'${SHEET_NAME}'!${a1}`;

/** يتحقق أن الورقة موجودة، وينشئها + يكتب صف العناوين إن كانت فارغة. */
export async function ensureSheetReady(): Promise<{ created: boolean; headersWritten: boolean }> {
  const sheets = client();
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    fields: "sheets.properties(title,sheetId,gridProperties)",
  });

  const exists = meta.data.sheets?.some((s) => s.properties?.title === SHEET_NAME);
  let created = false;

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: SHEET_NAME } } }] },
    });
    created = true;
  }

  const current = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: range("A1:1"),
  });

  const isEmpty = !current.data.values?.[0]?.length;
  if (isEmpty || created) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: range("A1"),
      valueInputOption: "RAW",
      requestBody: { values: [headerRow()] },
    });
    // تثبيت الصف الأول + عرض أوسع لعمود JSON
    const sheetProps = meta.data.sheets?.find((s) => s.properties?.title === SHEET_NAME);
    const sheetId = sheetProps?.properties?.sheetId ?? 0;
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
              fields: "gridProperties.frozenRowCount",
            },
          },
        ],
      },
    });
    return { created, headersWritten: true };
  }

  return { created, headersWritten: false };
}

/** فحص التكرار: هل هذا البريد قدّم طلبًا سابقًا؟ */
export async function emailAlreadySubmitted(email: string): Promise<boolean> {
  const sheets = client();
  const col = columnRef("email");
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: range(`${col}2:${col}`),
    majorDimension: "COLUMNS",
  });
  const values = res.data.values?.[0] ?? [];
  const target = email.trim().toLowerCase();
  return values.some((v) => String(v).trim().toLowerCase() === target);
}

/** إضافة صف جديد — العملية الأساسية: Append Row */
export async function appendSubmissionRow(opts: BuildRowOptions): Promise<{ row: number }> {
  const sheets = client();
  const row = buildSheetRow(opts);

  // حماية: عدد القيم يجب أن يطابق عدد الأعمدة
  if (row.length !== COLUMN_KEYS.length) {
    throw new Error(`Mismatch: row has ${row.length} cells, schema has ${COLUMN_KEYS.length}`);
  }

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: range("A1"),
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });

  const updated = res.data.updates?.updatedRange ?? "";
  const match = updated.match(/![A-Z]+(\d+)/);
  return { row: match ? Number(match[1]) : -1 };
}

/** حالة التكامل — تُستخدم في /api/health */
export async function sheetsHealth() {
  if (!isSheetsConfigured()) {
    return { configured: false, mode: "local" as SheetsMode };
  }
  try {
    const sheets = client();
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
      fields: "properties.title,sheets.properties(title)",
    });
    return {
      configured: true,
      mode: "google" as SheetsMode,
      spreadsheet: meta.data.properties?.title ?? null,
      tabs: meta.data.sheets?.map((s) => s.properties?.title) ?? [],
    };
  } catch (error) {
    return {
      configured: true,
      mode: "google" as SheetsMode,
      error: error instanceof Error ? error.message : "unknown_error",
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Review loop (بشري): تحديث الحالة، ملاحظات المراجع، ودعم القرار      */
/* ------------------------------------------------------------------ */

/** إيجاد رقم الصف لطلب معيّن عبر عمود submission_id */
export async function findSubmissionRow(submissionId: string): Promise<number> {
  const sheets = client();
  const col = columnRef("submission_id");
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: range(`${col}2:${col}`),
    majorDimension: "COLUMNS",
  });
  const values = res.data.values?.[0] ?? [];
  const idx = values.findIndex((v) => String(v).trim() === submissionId.trim());
  return idx >= 0 ? idx + 2 : -1;
}

/** تحديث خلايا محددة في صف واحد (bulk update للأعمدة الثلاثة) */
export async function updateSubmissionRow(
  submissionId: string,
  patch: {
    application_status?: string;
    reviewer_notes?: string;
    ai_decision_support?: string;
    last_updated?: string;
  },
): Promise<{ row: number; updated: string[] }> {
  const row = await findSubmissionRow(submissionId);
  if (row < 0) throw new Error("SUBMISSION_NOT_FOUND");

  const sheets = client();
  const data: { range: string; values: string[][] }[] = [];

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    data.push({ range: range(`${columnRef(key)}${row}`), values: [[value]] });
  }

  if (data.length === 0) return { row, updated: [] };

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: "RAW", data },
  });

  return { row, updated: Object.keys(patch) };
}

export type SheetRowRecord = {
  submission_id: string;
  values: Record<string, string>;
};

/** قراءة كل الصفوف ككائنات (key → value) بالاعتماد على صف العناوين */
export async function listSubmissionRows(limit = 300): Promise<SheetRowRecord[]> {
  const sheets = client();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: range(`A1:${columnLetter(COLUMN_KEYS.length - 1)}`),
  });
  const rows = res.data.values ?? [];
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => String(h).split("·").pop()!.trim());
  const keys = header.length === COLUMN_KEYS.length ? header : COLUMN_KEYS;

  return rows
    .slice(1)
    .filter((r) => String(r[0] ?? "").trim().length > 0)
    .map((r) => {
      const values: Record<string, string> = {};
      keys.forEach((k, i) => {
        values[k] = String(r[i] ?? "");
      });
      return { submission_id: values.submission_id ?? "", values };
    })
    .slice(-limit)
    .reverse();
}
