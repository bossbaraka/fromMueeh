"use client";

/**
 * ApplyForm — منسّق التجربة الكامل (v2 «Atelier»):
 * شاشة مقسّمة: ريل كحلي ثابت يحمل العلامة والفصول والتقدّم،
 * وعمود عاجي للنموذج من 6 فصول → شاشة نجاح بهوية العلامة.
 * • التحقق: Zod على الواجهة وعلى السيرفر بنفس القواعد.
 * • المسودة محفوظة محليًا (localStorage) — لا تخرج من المتصفح.
 * • كل انتقال يعلن نفسه لقارئ الشاشة وينقل التركيز إلى العنوان.
 */

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  defaultValues,
  fieldsForStep,
  fullSchema,
  STEP_IDS,
  type FieldName,
  type FormValues,
  type StepId,
} from "@/lib/schema";
import { cn } from "@/lib/utils";
import { STEP_BODIES, STEP_META } from "./steps";
import { SuccessScreen } from "./SuccessScreen";
import { Turnstile, turnstileSiteKey } from "./Turnstile";
import { ArrowLeft, ArrowRight, CheckIcon } from "@/components/ui/Primitives";
import { APPLY_FACTS, APPLY_RAIL, TALENT_STAGES } from "@/lib/content";
import { Mark } from "@/components/brand/Logo";
import Link from "next/link";

const DRAFT_KEY = "mureeh:draft:v1";
const TOTAL = STEP_IDS.length;

type Phase = "form" | "success";

type ApiError = { ok: false; code: string; message: string; fieldErrors?: Record<string, string> };

export function ApplyForm() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = React.useState<Phase>("form");
  const [stepIndex, setStepIndex] = React.useState(0);
  const [maxVisited, setMaxVisited] = React.useState(0);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submissionId, setSubmissionId] = React.useState<string | null>(null);
  const [restored, setRestored] = React.useState(false);
  const [turnstileToken, setTurnstileToken] = React.useState("");
  const [startedAt] = React.useState(() => Date.now());
  const [announcement, setAnnouncement] = React.useState("");

  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const topRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(fullSchema) as unknown as Resolver<FormValues>,
    defaultValues: defaultValues as unknown as FormValues,
    mode: "onTouched",
  });

  const stepId: StepId = STEP_IDS[stepIndex];
  const meta = STEP_META[stepId];

  /* ---------------------- استعادة المسودة المحلية --------------------- */
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<FormValues>;
      const hasContent = Object.values(parsed).some((v) =>
        Array.isArray(v) ? v.length > 0 : typeof v === "string" ? v.trim().length > 0 : v === true,
      );
      if (hasContent) {
        form.reset({ ...(defaultValues as unknown as FormValues), ...parsed });
        setRestored(true);
      }
    } catch {
      /* مسودة تالفة؟ نتجاهلها بهدوء */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------- حفظ المسودة تلقائيًا -------------------- */
  React.useEffect(() => {
    const sub = form.watch((values) => {
      window.clearTimeout((window as unknown as { __mureehDraft?: number }).__mureehDraft);
      (window as unknown as { __mureehDraft?: number }).__mureehDraft = window.setTimeout(() => {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
        } catch {
          /* التخزين ممتلئ أو محجوب — لا نعطّل التجربة */
        }
      }, 800);
    });
    return () => sub.unsubscribe();
  }, [form]);

  /* --------------------------- إدارة التركيز ------------------------- */
  React.useEffect(() => {
    if (phase !== "form") return;
    setAnnouncement(`${meta.eyebrow}: ${meta.title}`);
    const t = window.setTimeout(() => {
      headingRef.current?.focus({ preventScroll: true });
      topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }, 60);
    return () => window.clearTimeout(t);
  }, [stepIndex, phase, meta, reduce]);

  /* ----------------------------- التنقل ------------------------------ */
  const goTo = (index: number) => {
    setFormError(null);
    setDirection(index > stepIndex ? 1 : -1);
    setStepIndex(index);
    setMaxVisited((m) => Math.max(m, index));
  };

  const goNext = async () => {
    setFormError(null);
    // نتحقق فقط من حقول الفصل الحالي — لا نحجب المستخدم بحقول لم يصلها بعد
    const fields = fieldsForStep(stepId);
    const valid = await form.trigger(fields as FieldName[], { shouldFocus: true });
    if (!valid) {
      setFormError("راجع الحقول المعلّمة قبل المتابعة.");
      return;
    }
    goTo(Math.min(stepIndex + 1, TOTAL - 1));
  };

  const goBack = () => {
    setFormError(null);
    if (stepIndex === 0) {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      return;
    }
    goTo(stepIndex - 1);
  };

  const onValid = async (values: FormValues) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/talent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          source: "web-form",
          turnstileToken,
          elapsedMs: Date.now() - startedAt,
        }),
      });

      const data = (await res.json()) as
        | { ok: true; submissionId: string }
        | ApiError;

      if (!res.ok || !("ok" in data) || data.ok === false) {
        const err = data as ApiError;
        if (err.fieldErrors) {
          for (const [key, message] of Object.entries(err.fieldErrors)) {
            form.setError(key as FieldName, { type: "server", message });
          }
        }
        setFormError(err.message ?? "تعذّر إرسال الطلب. أعد المحاولة بعد قليل.");
        return;
      }

      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      setSubmissionId(data.submissionId);
      setPhase("success");
    } catch {
      setFormError("تعذّر الوصول إلى الشبكة. تأكد من الاتصال ثم أعد المحاولة.");
    } finally {
      setSubmitting(false);
    }
  };

  const submit = form.handleSubmit(onValid, () => {
    setFormError("هناك حقول ناقصة في فصول سابقة. سنأخذك إليها.");
    // الانتقال إلى أول فصل فيه خطأ
    const firstErrorField = Object.keys(form.formState.errors)[0];
    if (!firstErrorField) return;
    const idx = STEP_IDS.findIndex((id) => fieldsForStep(id).includes(firstErrorField));
    if (idx >= 0) goTo(idx);
  });

  /* ---------------------------- شاشة النجاح -------------------------- */
  if (phase === "success" && submissionId) {
    return <SuccessScreen submissionId={submissionId} />;
  }

  const Body = STEP_BODIES[stepId];
  const progress = ((stepIndex + 1) / TOTAL) * 100;
  const isLast = stepIndex === TOTAL - 1;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(340px,400px)_minmax(0,1fr)]">
      {/* ======================= الريل الكحلي (ديسكتوب) ======================= */}
      <aside className="relative hidden lg:block">
        <Rail
          stepIndex={stepIndex}
          maxVisited={maxVisited}
          progress={progress}
          onNavigate={goTo}
        />
      </aside>

      {/* ========================= عمود النموذج ========================= */}
      <div className="relative flex min-h-dvh flex-col">
        <MobileBar stepIndex={stepIndex} progress={progress} title={meta.title} />

        <div ref={topRef} className="scroll-mt-header flex-1 pb-12 pt-6 sm:pt-10">
          <div className="form-shell mx-auto w-full max-w-[820px]">
            {/* شريط حقائق مصغّر — قوة المنصة في سطر واحد */}
            <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-tint/70 px-3 py-1 text-[12px] font-semibold text-gold-deep">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold-deep" />
                ليس طلب توظيف
              </span>
              {APPLY_FACTS.map((f) => (
                <span key={f.t} className="text-[12.5px] text-ink-muted">
                  <span className="font-semibold text-navy">{f.t}</span>
                  <span className="sr-only">: {f.d}</span>
                </span>
              ))}
            </div>

            {restored && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/35 bg-gold-tint/50 px-4 py-2.5 text-[13px] text-ink-soft">
                <span>استعدنا مسودتك المحفوظة على جهازك — أكمل من حيث توقفت.</span>
                <button
                  type="button"
                  className="btn-quiet !min-h-0 !px-2 !py-1 !text-[13px] underline decoration-gold/60"
                  onClick={() => {
                    form.reset(defaultValues as unknown as FormValues);
                    try {
                      localStorage.removeItem(DRAFT_KEY);
                    } catch {
                      /* ignore */
                    }
                    setRestored(false);
                    setStepIndex(0);
                  }}
                >
                  ابدأ من جديد
                </button>
              </div>
            )}

            <p aria-live="polite" className="sr-only">
              {announcement}
            </p>

            <form
              onSubmit={submit}
              noValidate
              onKeyDown={(e) => {
                // Enter داخل حقل نصي = «متابعة»، وليس إرسال الطلب من الفصل الأول
                if (e.key === "Enter" && !isLast) {
                  const el = e.target as HTMLElement;
                  if (el.tagName === "INPUT") {
                    e.preventDefault();
                    void goNext();
                  }
                }
              }}
            >
              <div className="chapter-card">
                <header className="mb-7 flex items-start gap-5">
                  <span aria-hidden className="chapter-num mt-1">
                    {String(stepIndex + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow">{meta.eyebrow}</p>
                    <h2
                      ref={headingRef}
                      tabIndex={-1}
                      className="mt-1.5 text-[24px] font-semibold leading-relaxed text-navy outline-none sm:text-[30px]"
                    >
                      {meta.title}
                    </h2>
                    <p className="mt-2 max-w-prose text-[14px] leading-7 text-ink-muted">
                      {meta.subtitle}
                    </p>
                  </div>
                </header>
                <div aria-hidden className="gold-rule mb-7" />

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={stepId}
                    initial={{ opacity: 0, x: reduce ? 0 : direction * 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduce ? 0 : direction * -18 }}
                    transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Body form={form} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="mt-5 rounded-2xl border border-red-300/70 bg-red-50/70 px-4 py-3 text-[14px] leading-7 text-red-800"
                >
                  {formError}
                </div>
              )}

              {isLast && turnstileSiteKey && (
                <div className="mt-6">
                  <Turnstile onToken={setTurnstileToken} />
                </div>
              )}
            </form>
          </div>
        </div>

        {/* --------------------- شريط التنقل السفلي -------------------- */}
        <div className="sticky bottom-0 z-30 border-t border-line bg-ivory-200/90 backdrop-blur-md">
          <div className="form-shell mx-auto flex w-full max-w-[820px] items-center justify-between gap-3 px-5 py-3 sm:px-8">
            <button type="button" onClick={goBack} className="btn-ghost !min-h-[44px] !px-4 !text-[14px]">
              <ArrowRight className="h-4 w-4" />
              {stepIndex === 0 ? "أعلى الصفحة" : "رجوع"}
            </button>

            <p className="hidden flex-1 truncate text-center text-[12px] text-ink-faint sm:block">
              مسودتك تُحفظ على جهازك فقط — لا شيء يُرسل قبل ضغط «إرسال»
            </p>

            {isLast ? (
              <button type="submit" disabled={submitting} className="btn-gold !min-h-[46px]">
                {submitting ? "جارٍ الإرسال…" : "إرسال الطلب"}
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={goNext} className="btn-gold !min-h-[46px]">
                متابعة
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== Rail (ديسكتوب) ============================== */

function Rail({
  stepIndex,
  maxVisited,
  progress,
  onNavigate,
}: {
  stepIndex: number;
  maxVisited: number;
  progress: number;
  onNavigate: (i: number) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="apply-rail sticky top-0 h-dvh px-8 py-9 xl:px-10">
      {/* العلامة */}
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex items-center gap-3">
          <Mark size={38} className="drop-shadow-[0_6px_18px_rgba(212,175,55,0.35)]" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[22px] font-semibold tracking-tight text-ivory-50">
              مُريح
            </span>
            <span className="ltr mt-1 text-[9.5px] font-medium uppercase tracking-[0.34em] text-gold-soft">
              Mureeh
            </span>
          </span>
        </span>
        <Link
          href="/"
          className="rounded-full border border-ivory-50/15 px-3 py-1.5 text-[12px] text-ivory-100/70 transition-colors hover:border-gold/50 hover:text-gold-soft"
        >
          خروج
        </Link>
      </div>

      <div aria-hidden className="my-7 h-px w-full bg-gradient-to-l from-transparent via-gold/40 to-transparent" />

      {/* الوعد */}
      <p className="rail-eyebrow">{APPLY_RAIL.eyebrow}</p>
      <h1 className="mt-3 text-[24px] font-semibold leading-snug text-ivory-50 xl:text-[26px]">
        {APPLY_RAIL.title}
      </h1>
      <p className="mt-3 text-[13.5px] leading-7 text-ivory-100/65">{APPLY_RAIL.blurb}</p>

      {/* الفصول */}
      <nav aria-label="فصول الطلب" className="mt-8">
        <ol className="relative space-y-1">
          <span aria-hidden className="absolute bottom-6 start-[23.5px] top-6 w-px bg-ivory-50/10" />
          {STEP_IDS.map((id, i) => {
            const state = i === stepIndex ? "current" : i < stepIndex || i <= maxVisited ? "done" : "todo";
            const clickable = i <= maxVisited && i !== stepIndex;
            return (
              <li key={id} className="relative">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => onNavigate(i)}
                  aria-current={i === stepIndex ? "step" : undefined}
                  className={cn(
                    "group flex w-full items-center gap-3.5 rounded-xl px-2 py-2 text-start transition-colors duration-200",
                    clickable ? "cursor-pointer hover:bg-ivory-50/5" : "cursor-default",
                  )}
                >
                  <span
                    className={cn(
                      "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[12px] font-semibold tabular-nums transition-all duration-300",
                      state === "current"
                        ? "border-gold bg-gold text-navy shadow-gold-ring"
                        : state === "done"
                          ? "border-gold/50 bg-navy-800 text-gold-soft"
                          : "border-ivory-50/15 bg-navy-800 text-ivory-100/40",
                    )}
                  >
                    {state === "done" ? <CheckIcon className="h-3.5 w-3.5" /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-[13.5px] font-medium transition-colors",
                        state === "current"
                          ? "text-ivory-50"
                          : state === "done"
                            ? "text-ivory-100/75"
                            : "text-ivory-100/40",
                      )}
                    >
                      {STEP_META[id].title}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* التقدم */}
      <div className="mt-7">
        <div className="flex items-center justify-between text-[11.5px] text-ivory-100/60">
          <span>
            الفصل {stepIndex + 1} من {TOTAL}
          </span>
          <span className="ltr font-semibold tabular-nums text-gold-soft">{Math.round(progress)}%</span>
        </div>
        <div
          className="relative mt-2 h-[3px] w-full overflow-hidden rounded-full bg-ivory-50/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="تقدم الطلب"
        >
          <motion.div
            className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-l from-gold-soft via-gold to-gold-deep"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* إثبات قوة المنصة */}
      <div className="mt-8 rounded-2xl border border-ivory-50/10 bg-navy-800/60 p-4">
        <p className="rail-eyebrow">لماذا هذا النموذج مختلف</p>
        <ul className="mt-3 space-y-3">
          {APPLY_RAIL.proof.map((p) => (
            <li key={p.t} className="flex gap-2.5">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span className="text-[12.5px] leading-6 text-ivory-100/75">
                <span className="block font-semibold text-ivory-50">{p.t}</span>
                {p.d}
              </span>
            </li>
          ))}
        </ul>
        <div aria-hidden className="my-4 h-px w-full bg-ivory-50/10" />
        <ol className="flex flex-wrap gap-1.5">
          {TALENT_STAGES.map((s) => (
            <li
              key={s.key}
              className="ltr rounded-full border border-gold/25 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gold-soft/90"
            >
              {s.en}
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-auto pt-6 text-[11.5px] leading-6 text-ivory-100/45">
        {APPLY_RAIL.transparency}
      </p>
    </div>
  );
}

/* ============================ Mobile bar ============================ */

function MobileBar({
  stepIndex,
  progress,
  title,
}: {
  stepIndex: number;
  progress: number;
  title: string;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-gold/15 bg-navy/95 text-ivory-50 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between gap-3 px-5 pb-2.5 pt-3">
        <span className="inline-flex min-w-0 items-center gap-2.5">
          <Mark size={26} />
          <span className="min-w-0">
            <span className="block truncate text-[13.5px] font-semibold leading-5">{title}</span>
            <span className="block text-[10.5px] text-ivory-100/55">
              الفصل {stepIndex + 1} من {TOTAL} · Talent Network
            </span>
          </span>
        </span>
        <span className="ltr shrink-0 text-[12px] font-semibold tabular-nums text-gold-soft">
          {Math.round(progress)}%
        </span>
      </div>
      <div
        className="relative h-[2.5px] w-full overflow-hidden bg-ivory-50/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="تقدم الطلب"
      >
        <div
          className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-l from-gold-soft via-gold to-gold-deep transition-all duration-500 ease-calm"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
