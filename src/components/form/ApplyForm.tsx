"use client";

/**
 * ApplyForm — منسّق التجربة الكامل:
 * Intro → 13 صفحة → شاشة النجاح
 * • التحقق: Zod على الواجهة وعلى السيرفر بنفس القواعد.
 * • التقدم محفوظ كمسودة داخل جهاز المستخدم (localStorage) — لا يخرج من المتصفح.
 * • كل انتقال خطوة يعلن نفسه لقارئ الشاشة وينقل التركيز إلى العنوان.
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
import { ArrowLeft, ArrowRight, GoldRule } from "@/components/ui/Primitives";
import { TALENT_STAGES } from "@/lib/content";

const DRAFT_KEY = "mureeh:draft:v1";
const TOTAL = STEP_IDS.length;

type Phase = "intro" | "form" | "success";

type ApiError = { ok: false; code: string; message: string; fieldErrors?: Record<string, string> };

export function ApplyForm() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [stepIndex, setStepIndex] = React.useState(0);
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
  const goNext = async () => {
    setFormError(null);
    // نتحقق فقط من حقول الصفحة الحالية — لا نحجب المستخدم بحقول لم يصلها بعد
    const fields = fieldsForStep(stepId);
    const valid = await form.trigger(fields as FieldName[], { shouldFocus: true });
    if (!valid) {
      setFormError("راجع الحقول المعلّمة قبل المتابعة.");
      return;
    }
    setDirection(1);
    setStepIndex((i) => Math.min(i + 1, TOTAL - 1));
  };

  const goBack = () => {
    setFormError(null);
    setDirection(-1);
    if (stepIndex === 0) {
      setPhase("intro");
      return;
    }
    setStepIndex((i) => Math.max(i - 1, 0));
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
    setFormError("هناك حقول ناقصة في خطوات سابقة. سنأخذك إليها.");
    // الانتقال إلى أول خطوة فيها خطأ
    const firstErrorField = Object.keys(form.formState.errors)[0];
    if (!firstErrorField) return;
    const idx = STEP_IDS.findIndex((id) => fieldsForStep(id).includes(firstErrorField));
    if (idx >= 0) {
      setDirection(-1);
      setStepIndex(idx);
    }
  });

  /* ---------------------------- شاشة النجاح -------------------------- */
  if (phase === "success" && submissionId) {
    return <SuccessScreen submissionId={submissionId} />;
  }

  /* ---------------------------- شاشة البداية ------------------------- */
  if (phase === "intro") {
    return (
      <IntroScreen
        onStart={() => {
          setPhase("form");
          setStepIndex(0);
        }}
      />
    );
  }

  const Body = STEP_BODIES[stepId];
  const progress = ((stepIndex + 1) / TOTAL) * 100;
  const isLast = stepIndex === TOTAL - 1;

  return (
    <div ref={topRef} className="form-shell pb-32 pt-6 sm:pt-10">
      {/* ------------------------- شريط التقدم ------------------------- */}
      <div className="sticky top-0 z-30 -mx-5 mb-6 bg-ivory-200/85 px-5 py-4 backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">{meta.eyebrow}</p>
            <p className="mt-1 truncate text-[13px] text-ink-muted">
              الخطوة {stepIndex + 1} من {TOTAL} — Talent Network
            </p>
          </div>
          <p className="ltr shrink-0 text-[12px] font-medium tabular-nums text-ink-faint">
            {Math.round(progress)}%
          </p>
        </div>
        <div
          className="relative mt-3 h-[3px] w-full overflow-hidden rounded-full bg-ivory-400"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="تقدم الطلب"
        >
          <motion.div
            className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-l from-gold to-gold-deep"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {restored && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/35 bg-gold-tint/50 px-4 py-3 text-[13.5px] text-ink-soft">
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

      <form onSubmit={submit} noValidate onKeyDown={(e) => {
        // Enter داخل حقل نصي = «متابعة»، وليس إرسال الطلب من الخطوة الأولى
        if (e.key === "Enter" && !isLast) {
          const el = e.target as HTMLElement;
          if (el.tagName === "INPUT") {
            e.preventDefault();
            void goNext();
          }
        }
      }}>
        <div className="step-card">
          <header className="mb-8">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-[24px] font-semibold leading-relaxed text-navy outline-none sm:text-[28px]"
            >
              {meta.title}
            </h2>
            <p className="mt-3 max-w-prose text-[15px] leading-8 text-ink-muted">{meta.subtitle}</p>
            <GoldRule className="mt-6" />
          </header>

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
          <div role="alert" className="mt-5 rounded-2xl border border-red-300/70 bg-red-50/70 px-4 py-3 text-[14px] leading-7 text-red-800">
            {formError}
          </div>
        )}

        {isLast && turnstileSiteKey && (
          <div className="mt-6">
            <Turnstile onToken={setTurnstileToken} />
          </div>
        )}

        {/* --------------------- شريط التنقل السفلي -------------------- */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory-100/90 backdrop-blur-md">
          <div className="form-shell flex items-center justify-between gap-3 py-3">
            <button type="button" onClick={goBack} className="btn-ghost">
              <ArrowRight className="h-4 w-4" />
              {stepIndex === 0 ? "مقدمة" : "رجوع"}
            </button>

            <div className="hidden flex-1 px-4 sm:block">
              <p className="truncate text-center text-[12.5px] text-ink-faint">
                {meta.title} · بدون حفظ تلقائي على السيرفر حتى الإرسال
              </p>
            </div>

            {isLast ? (
              <button type="submit" disabled={submitting} className="btn-gold">
                {submitting ? "جارٍ الإرسال…" : "إرسال الطلب"}
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={goNext} className="btn-primary">
                متابعة
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/* ============================ Intro screen ============================ */

function IntroScreen({ onStart }: { onStart: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="form-shell pb-24 pt-8 sm:pt-14">
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="step-card"
      >
        <p className="eyebrow">Mureeh Talent Network</p>
        <h1 className="mt-4 text-[26px] font-semibold leading-relaxed text-navy sm:text-[32px]">
          قبل أن تبدأ
        </h1>
        <p className="mt-4 max-w-prose text-[15.5px] leading-9 text-ink-soft">
          هذا ليس طلب توظيف. هذا طلب انضمام إلى شبكة مُريح: نتعرف على مهاراتك، أعمالك، وطريقة تفكيرك — وعندما
          يأتي مشروع يتقاطع مع ما تقدّمه، نتواصل معك للاتفاق على النطاق والمقابل بشكل منفصل.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { t: "15–20 دقيقة", d: "متوسط زمن التعبئة — يمكنك التوقف والعودة، نحفظ مسودتك على جهازك." },
            { t: "ما تحتاجه", d: "رابط عمل واحد حقيقي، أو وصف دقيق لمشروع نفّذته." },
            { t: "بدون التزام", d: "لا عقد عمل، ولا راتب ثابت، ولا ضمان مشاريع — بشفافية كاملة." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-line bg-ivory-100/70 p-4">
              <p className="text-[14.5px] font-semibold text-navy">{c.t}</p>
              <p className="mt-2 text-[13px] leading-7 text-ink-muted">{c.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <p className="eyebrow mb-4">ما سنفعله بإجاباتك</p>
          <ol className="grid gap-3 sm:grid-cols-5">
            {TALENT_STAGES.map((s, i) => (
              <li key={s.key} className="rounded-2xl border border-line/80 bg-ivory-50 p-3">
                <span className="ltr text-[11px] font-semibold text-gold-deep">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-1 text-[13.5px] font-semibold text-navy">{s.ar}</p>
                <p className="ltr mt-0.5 text-[10px] uppercase tracking-[0.18em] text-ink-faint">{s.en}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button type="button" onClick={onStart} className="btn-gold">
            يلا نبدأ
            <ArrowLeft className="h-4 w-4" />
          </button>
          <p className="text-[13px] text-ink-faint">لا نحتاج CV. نحتاج طريقة تفكيرك.</p>
        </div>
      </motion.div>
    </div>
  );
}
