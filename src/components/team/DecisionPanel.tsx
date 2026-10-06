import type { DecisionSupport } from "@/lib/decision-support";
import { Badge, GoldRule } from "@/components/ui/Primitives";

const SIGNAL_STYLES = {
  strength: { label: "قوة", cls: "border-emerald-300/60 bg-emerald-50/70 text-emerald-900" },
  watch: { label: "يحتاج سؤالًا", cls: "border-amber-300/70 bg-amber-50/70 text-amber-900" },
  flag: { label: "تحقّق", cls: "border-rose-300/60 bg-rose-50/70 text-rose-900" },
} as const;

/** لوحة دعم القرار — تُعرض للفريق فقط، ولا تمنح أي قبول أو رفض */
export function DecisionPanel({ data }: { data: DecisionSupport }) {
  return (
    <section className="rounded-2xl border border-line bg-ivory-50 p-4 sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13.5px] font-semibold text-navy">دعم القرار — قراءة الملف</p>
          <p className="mt-1 text-[12px] text-ink-faint">{data.disclaimer}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="navy">اكتمال الوصف {data.completeness.score}%</Badge>
          <Badge tone="ivory">
            {data.completeness.portfolio_projects} مشاريع · {data.completeness.links} روابط
          </Badge>
          <Badge tone="gold">{data.engine}</Badge>
        </div>
      </header>

      <GoldRule className="my-4" />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* الثيمات */}
        <div>
          <h4 className="text-[13px] font-semibold text-navy">ثيمات التفكير</h4>
          {data.thinking_themes.length === 0 ? (
            <p className="mt-2 text-[12.5px] text-ink-muted">
              لم تظهر ثيمات واضحة — إجابات قصيرة أو متباينة، اقرأها يدويًا.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {data.thinking_themes.map((t) => (
                <li key={t.key} className="rounded-xl border border-line/70 bg-ivory-100/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-navy">{t.label}</span>
                    <span className="ltr text-[11px] tabular-nums text-ink-faint">
                      {Math.round(t.confidence * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ivory-400" aria-hidden>
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-gold to-gold-deep"
                      style={{ width: `${Math.round(t.confidence * 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[12px] leading-6 text-ink-muted">
                    <span className="text-ink-faint">من «{t.from}»: </span>
                    {t.evidence}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* الإشارات + الملاءمة */}
        <div className="space-y-5">
          <div>
            <h4 className="text-[13px] font-semibold text-navy">إشارات للمراجعة</h4>
            <ul className="mt-3 space-y-2">
              {data.signals.map((s, i) => (
                <li
                  key={`${s.label}-${i}`}
                  className={`rounded-xl border p-3 text-[12.5px] leading-6 ${SIGNAL_STYLES[s.type].cls}`}
                >
                  <span className="font-semibold">
                    [{SIGNAL_STYLES[s.type].label}] {s.label}
                  </span>
                  <span className="mt-1 block opacity-90">{s.detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-line/70 bg-ivory-100/60 p-3">
            <h4 className="text-[13px] font-semibold text-navy">ملاءمة مبدئية للمشاريع</h4>
            <p className="mt-2 text-[12.5px] leading-7 text-ink-muted">
              الأنواع: {data.fit.project_types.join(" · ") || "—"}
            </p>
            {data.fit.notes.length > 0 && (
              <ul className="mt-2 space-y-1.5 text-[12.5px] leading-6 text-ink-muted">
                {data.fit.notes.map((n) => (
                  <li key={n} className="flex gap-2">
                    <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {n}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[12px] text-ink-faint">
              السعة التقديرية: {data.availability.estimated_weekly_hours ?? "—"} ساعة/أسبوع · التسعير:{" "}
              <span className="ltr">
                {data.pricing.parsed_min ?? "?"}–{data.pricing.parsed_max ?? "?"} {data.pricing.currency}
              </span>
            </p>
          </div>

          {data.llm_summary && (
            <div className="rounded-xl border border-navy/10 bg-navy/[0.03] p-3">
              <h4 className="text-[13px] font-semibold text-navy">خلاصة نصية (طبقة اختيارية)</h4>
              <p className="mt-2 whitespace-pre-line text-[12.5px] leading-7 text-ink-soft">
                {data.llm_summary}
              </p>
              <p className="mt-2 text-[11.5px] text-ink-faint">
                مخرجات نموذج لغوي — للقراءة السريعة فقط، وليست تقييمًا.
              </p>
            </div>
          )}
        </div>
      </div>

      {data.suggested_interview_questions.length > 0 && (
        <div className="mt-5 rounded-xl border border-gold/30 bg-gold-tint/40 p-3">
          <h4 className="text-[13px] font-semibold text-navy">أسئلة مقترحة للتواصل الأول</h4>
          <ol className="mt-2 space-y-1.5 text-[12.5px] leading-7 text-ink-soft">
            {data.suggested_interview_questions.map((q) => (
              <li key={q} className="flex gap-2">
                <span aria-hidden className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-deep" />
                {q}
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="mt-4 text-[12px] text-ink-faint">
        لا يوجد هنا ترتيب أو تقييم للقبول. الفريق يقرأ، ثم يقرر:{" "}
        <span className="ltr">
          NEW → REVIEWING → SHORTLISTED → CONTACTED → ACTIVE / NOT_A_CURRENT_FIT
        </span>
      </p>
    </section>
  );
}
