import { Logo } from "@/components/brand/Logo";
import { DecisionPanel } from "@/components/team/DecisionPanel";
import { ReviewControls } from "@/components/team/ReviewControls";
import { listSubmissions } from "@/lib/review";
import { buildDecisionSupport } from "@/lib/decision-support";
import { sheetsHealth, storageMode } from "@/lib/sheets";
import { COLUMN_KEYS, SHEET_NAME, TEAM_STATUSES } from "@/lib/sheets-schema";
import { THINKING_QUESTIONS } from "@/lib/content";
import { formatDateTimeAr } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "لوحة الفريق — Talent Database",
  robots: { index: false, follow: false },
};

/**
 * /team — قاعدة بيانات المهارات + حلقة المراجعة البشرية.
 * المصدر الرسمي للبيانات: Google Sheet (أو التخزين المحلي في وضع العرض).
 * التحليل يُحسب على السيرفر ولا يُعرض للمتقدّم.
 */
export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const required = process.env.ADMIN_ACCESS_TOKEN ?? "";
  const adminToken = token ?? "";

  if (required && adminToken !== required) {
    return (
      <main className="form-shell py-20">
        <h1 className="text-[24px] font-semibold text-navy">هذه الصفحة داخلية</h1>
        <p className="mt-4 text-[15px] leading-8 text-ink-muted">
          للوصول إلى لوحة الفريق في الإنتاج، استخدم رابطًا يحتوي على مفتاح الوصول
          (<span className="ltr">/team?token=…</span>).
        </p>
      </main>
    );
  }

  const records = await listSubmissions(200);
  const mode = storageMode();
  const health = await sheetsHealth();

  const stats = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.application_status] = (acc[r.application_status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line/70 bg-ivory-100/80">
        <div className="shell flex h-[72px] items-center justify-between gap-6">
          <Logo size={36} />
          <span className="text-[13px] text-ink-faint">لوحة الفريق · Talent Database</span>
        </div>
      </header>

      <main className="shell py-12">
        <h1 className="text-[26px] font-semibold text-navy">قاعدة بيانات شبكة مُريح</h1>
        <p className="mt-3 max-w-prose text-[15px] leading-8 text-ink-muted">
          نحن لا نملك CVs فقط. نملك خريطة للمهارات، الخبرات، طريقة التفكير، الأدوات، ونماذج الأعمال
          للأشخاص الذين يمكن أن نبني معهم المشاريع.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {[
            { label: "وضع التخزين", value: mode === "google" ? "Google Sheets" : "محلي (NDJSON)" },
            { label: "عدد الطلبات", value: records.length.toString() },
            { label: "الورقة", value: SHEET_NAME },
            { label: "عدد الأعمدة", value: COLUMN_KEYS.length.toString() },
          ].map((s) => (
            <div key={s.label} className="surface p-4">
              <p className="text-[12px] uppercase tracking-[0.16em] text-ink-faint">{s.label}</p>
              <p className="mt-1 text-[16px] font-semibold text-navy">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-[12.5px]">
          {TEAM_STATUSES.map((s) => (
            <span
              key={s}
              className="rounded-full border border-line bg-ivory-100 px-3 py-1 text-ink-muted"
            >
              <span className="ltr">{s}</span>: {stats[s] ?? 0}
            </span>
          ))}
        </div>

        <p className="mt-3 text-[13px] leading-7 text-ink-faint">
          القرار النهائي بشري دائمًا. التحليل أدناه يقرأ الإجابات ويقترح أسئلة — لا يمنح قبولًا ولا رفضًا.
          {health.configured ? "" : " (لم تُضبط مفاتيح Google Sheets بعد — التفاصيل في docs/GOOGLE_SHEETS_SETUP.md)"}
        </p>

        <section className="mt-10 space-y-6">
          <h2 className="text-[18px] font-semibold text-navy">الطلبات</h2>

          {records.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line bg-ivory-100/60 p-6 text-[14px] text-ink-muted">
              لا توجد طلبات محفوظة بعد. أرسل طلبًا من صفحة <span className="ltr">/apply</span> ليظهر هنا.
            </p>
          ) : (
            records.map((r) => {
              const values = r.values;
              const support = values ? buildDecisionSupport(values) : null;

              return (
                <article key={r.submission_id} className="surface p-5">
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[16px] font-semibold text-navy">
                        {values?.full_name ?? r.cells.full_name ?? "—"}
                        <span className="ms-3 text-[13px] font-normal text-ink-faint">
                          {values?.preferred_name ?? r.cells.preferred_name ?? ""}
                        </span>
                      </h3>
                      <p className="ltr mt-1 text-[12.5px] text-ink-faint">
                        {values?.email ?? r.cells.email ?? ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
                      <span className="rounded-full border border-navy/15 bg-navy/5 px-3 py-1 text-navy">
                        <span className="ltr">{r.application_status}</span>
                      </span>
                      {values?.primary_specialty && (
                        <span className="ltr rounded-full border border-line bg-ivory-100 px-3 py-1 text-ink-muted">
                          {values.primary_specialty}
                        </span>
                      )}
                      {values?.experience_level && (
                        <span className="rounded-full border border-line bg-ivory-100 px-3 py-1 text-ink-muted">
                          {values.experience_level}
                        </span>
                      )}
                      {values && (
                        <span className="rounded-full border border-line bg-ivory-100 px-3 py-1 text-ink-muted">
                          {values.availability} · {values.weekly_capacity}
                        </span>
                      )}
                      {r.submitted_at && (
                        <span className="ltr rounded-full border border-line bg-ivory-100 px-3 py-1 text-ink-muted">
                          {formatDateTimeAr(r.submitted_at)}
                        </span>
                      )}
                    </div>
                  </header>

                  {r.ai_decision_support && (
                    <p className="ltr mt-3 rounded-xl border border-gold/30 bg-gold-tint/30 px-3 py-2 text-[11.5px] leading-6 text-ink-soft">
                      ai_decision_support: {r.ai_decision_support}
                    </p>
                  )}

                  {support && (
                    <div className="mt-5">
                      <DecisionPanel data={support} />
                    </div>
                  )}

                  <details className="group mt-5">
                    <summary className="cursor-pointer text-[14px] font-medium text-gold-deep">
                      الإجابات الكاملة والتفكير والأعمال
                    </summary>

                    <div className="mt-5 grid gap-6 lg:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="text-[14px] font-semibold text-navy">أجوبة التفكير</h4>
                        {THINKING_QUESTIONS.map((q, i) => {
                          const answer = values
                            ? String((values as unknown as Record<string, string>)[q.column] ?? "")
                            : r.cells[q.column] ?? "";
                          return (
                            <div key={q.id} className="rounded-xl border border-line/70 bg-ivory-100/50 p-3">
                              <p className="text-[12.5px] font-semibold text-ink-soft">
                                {String(i + 1).padStart(2, "0")} — {q.title}
                              </p>
                              <p className="mt-1.5 whitespace-pre-line text-[13px] leading-7 text-ink-muted">
                                {answer || "—"}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[14px] font-semibold text-navy">الأعمال والأدوات</h4>
                        {[1, 2, 3].map((n) => {
                          const get = (k: string) =>
                            values
                              ? String((values as unknown as Record<string, string>)[k] ?? "")
                              : r.cells[k] ?? "";
                          if (!get(`project_${n}`)) return null;
                          return (
                            <div
                              key={n}
                              className="rounded-xl border border-line/70 bg-ivory-100/50 p-3 text-[13px] leading-7 text-ink-muted"
                            >
                              <p className="font-semibold text-ink-soft">
                                {get(`project_${n}`)} · {get(`project_${n}_tools`)}
                              </p>
                              <p className="mt-1">{get(`project_${n}_problem`)}</p>
                              <p className="mt-1">{get(`project_${n}_role`)}</p>
                              <p className="mt-1 font-medium text-navy">{get(`project_${n}_result`)}</p>
                            </div>
                          );
                        })}

                        <div className="rounded-xl border border-line/70 bg-ivory-100/50 p-3 text-[13px] leading-7 text-ink-muted">
                          <p className="font-semibold text-ink-soft">AI</p>
                          <p className="ltr mt-1">{values?.ai_tools?.join(" · ") ?? r.cells.ai_tools ?? "—"}</p>
                          <p className="mt-1">{values?.ai_workflow ?? r.cells.ai_workflow ?? ""}</p>
                          <p className="mt-1 font-medium text-navy">
                            {values?.ai_boundaries ?? r.cells.ai_boundaries ?? ""}
                          </p>
                        </div>

                        <div className="rounded-xl border border-line/70 bg-ivory-100/50 p-3 text-[13px] leading-7 text-ink-muted">
                          <p className="font-semibold text-ink-soft">التعاون والتسعير</p>
                          <p className="mt-1">
                            {values?.collaboration_type ?? r.cells.collaboration_type ?? ""} ·{" "}
                            {values?.pricing_model ?? r.cells.pricing_model ?? ""} ·{" "}
                            <span className="ltr">
                              {values?.expected_project_range ?? r.cells.expected_project_range ?? ""}{" "}
                              {values?.currency ?? r.cells.currency ?? ""}
                            </span>
                          </p>
                          <p className="mt-1">
                            روابط:{" "}
                            <span className="ltr">
                              {[
                                values?.portfolio_url ?? r.cells.portfolio_url,
                                values?.linkedin_url ?? r.cells.linkedin_url,
                                values?.github_url ?? r.cells.github_url,
                                values?.website_url ?? r.cells.website_url,
                              ]
                                .filter(Boolean)
                                .join(" · ") || "—"}
                            </span>
                          </p>
                        </div>

                        <p className="ltr text-[11.5px] text-ink-faint">
                          submission_id: {r.submission_id}
                        </p>
                      </div>
                    </div>
                  </details>

                  <ReviewControls
                    submissionId={r.submission_id}
                    initialStatus={r.application_status}
                    initialNotes={r.reviewer_notes}
                    adminToken={adminToken}
                    suggestedQuestions={support?.suggested_interview_questions ?? []}
                  />
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
