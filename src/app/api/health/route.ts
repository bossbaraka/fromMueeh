import { NextResponse } from "next/server";
import { sheetsHealth } from "@/lib/sheets";
import { COLUMN_KEYS, SHEET_NAME } from "@/lib/sheets-schema";
import { turnstileEnabled } from "@/lib/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/health — حالة النظام والتكامل (لا يكشف أي بيانات اعتماد) */
export async function GET() {
  const sheets = await sheetsHealth();
  return NextResponse.json({
    ok: true,
    system: "Mureeh Talent Network",
    version: "1.0.0",
    sheet: { name: SHEET_NAME, columns: COLUMN_KEYS.length, ...sheets },
    turnstile: turnstileEnabled ? "enabled" : "disabled",
    time: new Date().toISOString(),
  });
}
