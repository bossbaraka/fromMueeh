/**
 * POST /api/talent/setup
 * يهيّئ ورقة "Talent Applications": ينشئ التاب إن لم يوجد، ويكتب صف العناوين،
 * ويثبّت الصف الأول. محمي بـ ADMIN_BOOTSTRAP_TOKEN (Header: x-admin-token).
 */

import { NextResponse, type NextRequest } from "next/server";
import { ensureSheetReady, isSheetsConfigured } from "@/lib/sheets";
import { headerRow, SHEET_NAME } from "@/lib/sheets-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-admin-token") ?? "";
  const expected = process.env.ADMIN_BOOTSTRAP_TOKEN ?? "";

  if (!expected || token !== expected) {
    return NextResponse.json(
      { ok: false, message: "غير مصرّح. أضف الترويسة x-admin-token." },
      { status: 401 },
    );
  }

  if (!isSheetsConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "مفاتيح Google Sheets غير مضبوطة. أضف GOOGLE_SERVICE_ACCOUNT_EMAIL و GOOGLE_PRIVATE_KEY و GOOGLE_SHEET_ID.",
        preview: headerRow(),
      },
      { status: 400 },
    );
  }

  try {
    const result = await ensureSheetReady();
    return NextResponse.json({ ok: true, sheet: SHEET_NAME, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "فشل التهيئة. تأكد من مشاركة الملف مع بريد حساب الخدمة بصلاحية Editor.",
        error: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 },
    );
  }
}
