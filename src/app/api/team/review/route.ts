/**
 * POST /api/team/review
 * عمليات الفريق البشرية على قاعدة البيانات:
 *   • تغيير application_status
 *   • كتابة reviewer_notes
 *   • توليد دعم القرار (ai_decision_support) — Decision Support فقط
 *
 * الحماية: ترويسة x-admin-token تطابق ADMIN_ACCESS_TOKEN (أو ADMIN_BOOTSTRAP_TOKEN).
 * في الإنتاج دون ضبط مفتاح: يُرفض الطلب (503) بدل أن يكون مفتوحًا.
 */

import { NextResponse, type NextRequest } from "next/server";
import { applyReview, getSubmission } from "@/lib/review";
import { TEAM_STATUSES } from "@/lib/sheets-schema";
import { buildDecisionSupport, enrichWithLlm, toSheetCell } from "@/lib/decision-support";
import { storageMode } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorize(request: NextRequest): { ok: boolean; status?: number; message?: string } {
  const token = request.headers.get("x-admin-token") ?? "";
  const access = process.env.ADMIN_ACCESS_TOKEN ?? "";
  const bootstrap = process.env.ADMIN_BOOTSTRAP_TOKEN ?? "";
  const expected = access || bootstrap;

  if (!expected) {
    // لا يوجد مفتاح مضبوط: نسمح في التطوير فقط
    if (process.env.NODE_ENV !== "production") return { ok: true };
    return {
      ok: false,
      status: 503,
      message: "لم يُضبط ADMIN_ACCESS_TOKEN. اضبطه لتفعيل المراجعة في الإنتاج.",
    };
  }

  if (token && (token === access || token === bootstrap)) return { ok: true };
  return { ok: false, status: 401, message: "غير مصرّح. أضف ترويسة x-admin-token الصحيحة." };
}

export async function POST(request: NextRequest) {
  const auth = authorize(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status ?? 401 });
  }

  let body: {
    submission_id?: string;
    application_status?: string;
    reviewer_notes?: string;
    analyze?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "طلب غير صالح." }, { status: 400 });
  }

  const submissionId = (body.submission_id ?? "").trim();
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "submission_id مطلوب." }, { status: 400 });
  }

  if (body.application_status && !TEAM_STATUSES.includes(body.application_status as never)) {
    return NextResponse.json(
      { ok: false, message: `حالة غير معروفة. القيم المتاحة: ${TEAM_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    let decisionSupportCell: string | undefined;
    let decisionSupport = null;

    if (body.analyze) {
      const record = await getSubmission(submissionId);
      if (!record?.values) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "لا يمكن التحليل: القيم الكاملة غير متاحة لهذا الطلب (record_json مفقود أو تالف).",
          },
          { status: 422 },
        );
      }
      const base = buildDecisionSupport(record.values);
      const enriched = await enrichWithLlm(record.values, base);
      decisionSupport = enriched;
      decisionSupportCell = toSheetCell(enriched);
    }

    const result = await applyReview({
      submission_id: submissionId,
      application_status: body.application_status,
      reviewer_notes: body.reviewer_notes,
      ai_decision_support: decisionSupportCell,
    });

    return NextResponse.json({
      ok: true,
      storage: result.storage,
      row: result.row ?? null,
      updated: result.updated,
      mode: storageMode(),
      decision_support: decisionSupport,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message === "SUBMISSION_NOT_FOUND") {
      return NextResponse.json({ ok: false, message: "لم أجد هذا الطلب في قاعدة البيانات." }, { status: 404 });
    }
    console.error("[mureeh] review failed:", error);
    return NextResponse.json(
      { ok: false, message: "تعذّر تحديث الطلب الآن. تحقّق من إعداد Google Sheets وحاول مجددًا." },
      { status: 502 },
    );
  }
}
