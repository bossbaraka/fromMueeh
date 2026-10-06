"use client";

import * as React from "react";
import { TEAM_STATUSES } from "@/lib/sheets-schema";
import type { DecisionSupport } from "@/lib/decision-support";

type Props = {
  submissionId: string;
  initialStatus: string;
  initialNotes: string;
  adminToken: string;
  suggestedQuestions: string[];
};

const STATUS_AR: Record<string, string> = {
  NEW: "جديد",
  REVIEWING: "قيد المراجعة",
  SHORTLISTED: "مرشّح",
  CONTACTED: "تم التواصل",
  ACTIVE: "نشِط",
  NOT_A_CURRENT_FIT: "غير مناسب حاليًا",
};

/** أدوات المراجعة البشرية — آخر خطوة في رحلة الفريق */
export function ReviewControls({
  submissionId,
  initialStatus,
  initialNotes,
  adminToken,
  suggestedQuestions,
}: Props) {
  const [status, setStatus] = React.useState(initialStatus);
  const [notes, setNotes] = React.useState(initialNotes);
  const [busy, setBusy] = React.useState<"save" | "analyze" | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [analysis, setAnalysis] = React.useState<DecisionSupport | null>(null);

  const call = async (payload: Record<string, unknown>, kind: "save" | "analyze") => {
    setBusy(kind);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/team/review", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ submission_id: submissionId, ...payload }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        message?: string;
        decision_support?: DecisionSupport;
        storage?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.message ?? "تعذّر تنفيذ العملية.");
        return;
      }

      if (data.decision_support) setAnalysis(data.decision_support);
      setMessage(
        kind === "analyze"
          ? "تم توليد دعم القرار وحفظه في قاعدة البيانات."
          : `تم حفظ المراجعة (${data.storage === "google" ? "Google Sheets" : "تخزين محلي"}).`,
      );
    } catch {
      setError("تعذّر الاتصال بالسيرفر.");
    } finally {
      setBusy(null);
    }
  };

  const copyQuestions = async () => {
    try {
      await navigator.clipboard.writeText(suggestedQuestions.join("\n"));
      setMessage("نُسخت الأسئلة المقترحة.");
    } catch {
      setError("تعذّر النسخ — انسخها يدويًا من القائمة.");
    }
  };

  return (
    <div className="mt-5 rounded-2xl border border-line bg-ivory-100/60 p-4">
      <h4 className="text-[13.5px] font-semibold text-navy">مراجعة الفريق</h4>

      <div className="mt-3 grid gap-3 sm:grid-cols-[200px_1fr]">
        <label className="flex flex-col gap-1.5 text-[12.5px] text-ink-muted">
          الحالة
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="field-input !py-2 !text-[13.5px]"
          >
            {TEAM_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_AR[s] ?? s} ({s})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-[12.5px] text-ink-muted">
          ملاحظات المراجع (تظهر للفريق فقط)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="مثال: أعماله قوية في التحويل، يحتاج توضيحًا حول التسعير بالساعة…"
            className="field-textarea !min-h-[84px] !text-[13.5px]"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary !min-h-[40px] !px-4 !text-[13.5px]"
          disabled={busy !== null}
          onClick={() => call({ application_status: status, reviewer_notes: notes }, "save")}
        >
          {busy === "save" ? "جارٍ الحفظ…" : "حفظ المراجعة"}
        </button>

        <button
          type="button"
          className="btn-ghost !min-h-[40px] !px-4 !text-[13.5px]"
          disabled={busy !== null}
          onClick={() => call({ analyze: true }, "analyze")}
        >
          {busy === "analyze" ? "جارٍ التحليل…" : "توليد دعم القرار"}
        </button>

        {suggestedQuestions.length > 0 && (
          <button
            type="button"
            className="btn-quiet !min-h-[40px] !px-4 !text-[13.5px]"
            onClick={copyQuestions}
          >
            نسخ أسئلة التواصل
          </button>
        )}
      </div>

      <div aria-live="polite" className="min-h-[22px]">
        {message && <p className="mt-2 text-[12.5px] font-medium text-emerald-800">{message}</p>}
        {error && <p className="mt-2 text-[12.5px] font-medium text-red-700">{error}</p>}
      </div>

      {analysis && (
        <details className="mt-2 rounded-xl border border-line/70 bg-ivory-50 p-3" open>
          <summary className="cursor-pointer text-[12.5px] font-semibold text-navy">
            نتيجة دعم القرار (محفوظة الآن في عمود ai_decision_support)
          </summary>
          <pre className="ltr mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-navy/[0.03] p-3 text-[11.5px] leading-6 text-ink-soft">
            {JSON.stringify(
              {
                engine: analysis.engine,
                completeness: analysis.completeness,
                themes: analysis.thinking_themes.map((t) => `${t.label} (${t.confidence})`),
                signals: analysis.signals.map((s) => `[${s.type}] ${s.label}`),
                fit: analysis.fit,
              },
              null,
              2,
            )}
          </pre>
        </details>
      )}
    </div>
  );
}
