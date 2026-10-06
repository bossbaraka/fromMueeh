/**
 * POST /api/talent
 * Flow:
 *  Client validation → (هنا) Rate limit → Server validation (Zod)
 *  → Anti-spam (honeypot + timing + Turnstile) → Duplicate check
 *  → submission_id + submitted_at → Google Sheets Append Row
 *  → Success response
 *
 * لا يخرج أي مفتاح أو بيانات اعتماد من هذا الملف إلى الواجهة.
 */

import { NextResponse, type NextRequest } from "next/server";
import { submissionSchema } from "@/lib/schema";
import { buildSheetRow, COLUMN_KEYS } from "@/lib/sheets-schema";
import {
  appendSubmissionRow,
  emailAlreadySubmitted,
  isSheetsConfigured,
  storageMode,
} from "@/lib/sheets";
import { appendLocal, localEmailExists } from "@/lib/store";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { newId } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 300_000;
const MIN_HUMAN_MS = 2_000; // أسرع من ذلك = بوت (النموذج يحتوي 20+ إجابة طويلة)

type ErrorCode =
  | "RATE_LIMITED"
  | "PAYLOAD_TOO_LARGE"
  | "BAD_JSON"
  | "VALIDATION"
  | "TURNSTILE"
  | "DUPLICATE"
  | "STORAGE"
  | "UNKNOWN";

const jsonError = (
  code: ErrorCode,
  message: string,
  status: number,
  extra: Record<string, unknown> = {},
) => NextResponse.json({ ok: false, code, message, ...extra }, { status });

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);

  /* ------------------------- 1) Rate limiting ------------------------- */
  const limited = rateLimit(`submit:${ip}`);
  if (!limited.ok) {
    const minutes = Math.ceil(limited.retryAfterSeconds / 60);
    return NextResponse.json(
      {
        ok: false,
        code: "RATE_LIMITED" satisfies ErrorCode,
        message: `وصلتنا عدة طلبات من نفس الجهاز. خلّينا نراجعها أولًا — جرّب مرة أخرى بعد ${minutes} دقيقة.`,
      },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  /* --------------------------- 2) الحجم ------------------------------ */
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return jsonError("PAYLOAD_TOO_LARGE", "الطلب أكبر من المسموح. اختصر الإجابات قليلًا.", 413);
  }

  /* ------------------------- 3) قراءة البيانات ----------------------- */
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("BAD_JSON", "تعذّر قراءة الطلب. حدّث الصفحة وحاول مرة أخرى.", 400);
  }

  /* --------------------- 4) التحقق على السيرفر ----------------------- */
  const parsed = submissionSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return jsonError("VALIDATION", "راجع الحقول المعلّمة قبل الإرسال.", 422, { fieldErrors });
  }

  const { honeypot, source, turnstileToken, elapsedMs, ...values } = parsed.data;

  /* -------------------------- 5) Anti-spam --------------------------- */
  // Honeypot / بوت سريع: نُعيد ردًّا ناجحًا وهميًا حتى لا يتعلّم البوت القواعد.
  const looksLikeBot = honeypot.trim().length > 0 || (elapsedMs > 0 && elapsedMs < MIN_HUMAN_MS);
  if (looksLikeBot) {
    return NextResponse.json({
      ok: true,
      submissionId: newId(),
      mode: storageMode(),
      status: "NEW",
      stored: false,
    });
  }

  const turnstile = await verifyTurnstile(turnstileToken, ip);
  if (!turnstile.ok) {
    return jsonError("TURNSTILE", "تعذّر التحقق من أنك إنسان. أعد المحاولة.", 403);
  }

  /* -------------------------- 6) التكرار ----------------------------- */
  const mode = storageMode();
  try {
    const duplicate =
      mode === "google"
        ? await emailAlreadySubmitted(values.email)
        : await localEmailExists(values.email);

    if (duplicate) {
      return jsonError(
        "DUPLICATE",
        "هذا البريد الإلكتروني قدّم طلبًا سابقًا، وملفه محفوظ عندنا. إذا احتجت تحديث بياناتك راسلنا وسنحدّث الملف معك.",
        409,
      );
    }
  } catch (error) {
    // فحص التكرار ليس حرجًا: نسجّل الخطأ ونكمل (لا نُفشل الطلب بسبب فحص وقائي)
    console.error("[mureeh] duplicate check failed:", error);
  }

  /* ---------------------- 7) الحفظ في قاعدة البيانات ------------------ */
  const submissionId = newId();
  const submittedAt = new Date().toISOString();
  const sourceLabel = (source || "web").slice(0, 120);

  try {
    if (mode === "google") {
      await appendSubmissionRow({
        values,
        submissionId,
        submittedAt,
        source: sourceLabel,
      });
    } else {
      await appendLocal({
        submission_id: submissionId,
        submitted_at: submittedAt,
        application_status: "NEW",
        source: sourceLabel,
        last_updated: submittedAt,
        values,
      });
      // تحقق صحي: الصف يجب أن يطابق عدد الأعمدة
      const cells = buildSheetRow({ values, submissionId, submittedAt, source: sourceLabel });
      if (cells.length !== COLUMN_KEYS.length) {
        throw new Error("row/column mismatch");
      }
    }
  } catch (error) {
    console.error("[mureeh] storage error:", error);
    return jsonError(
      "STORAGE",
      "تعذّر حفظ الطلب في هذه اللحظة. لم يُرسل شيء — بياناتك باقية في الصفحة، أعد المحاولة بعد قليل.",
      502,
    );
  }

  return NextResponse.json({
    ok: true,
    submissionId,
    mode,
    status: "NEW",
    stored: true,
    sheetConfigured: isSheetsConfigured(),
  });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, code: "METHOD_NOT_ALLOWED", message: "استخدم POST لإرسال الطلب." },
    { status: 405, headers: { Allow: "POST" } },
  );
}
