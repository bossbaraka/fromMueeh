"use client";

/**
 * فصول النموذج — 6 فصول بدل 13 صفحة.
 * كل فصل: عنوان + كتل مركّزة. لا حقل بلا سبب، ولا صفحة بلا معنى.
 */

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FieldName, FormValues, StepId } from "@/lib/schema";
import { THINKING_MIN_ANSWERS, THINKING_PAGES, thinkingQuotaMessage } from "@/lib/content";
import type { Form } from "./fields";
import {
  CheckboxRow,
  ChipMulti,
  RadioDesc,
  Segmented,
  SelectInput,
  TextArea,
  TextInput,
} from "./fields";
import { cn } from "@/lib/utils";
import {
  AGREEMENT_ITEMS,
  AI_EXPERIENCE_LEVELS,
  AI_TOOLS,
  COLLABORATION_TYPES,
  CURRENCIES,
  EXPERIENCE_LEVELS,
  PREFERRED_PROJECT_TYPES,
  PRICING_MODELS,
  PRICING_NOTE,
  PROJECT_TYPES_WORKED_ON,
  SPECIALTY_GROUPS,
  START_AVAILABILITY,
  THINKING_QUESTIONS,
  WEEKLY_CAPACITY,
  YEARS_BANDS,
} from "@/lib/content";
import { CheckIcon } from "@/components/ui/Primitives";

export type StepProps = { form: Form };
type K = FieldName;

export const STEP_META: Record<StepId, { eyebrow: string; title: string; subtitle: string }> = {
  profile: {
    eyebrow: "الفصل 01 · الهوية",
    title: "خلينا نتعرف عليك",
    subtitle: "هويتك، والمجالات التي تعمل بها فعلًا — لا التي تعرفها نظريًا.",
  },
  experience: {
    eyebrow: "الفصل 02 · الخبرة",
    title: "خبرتك، بعملك لا بعدد سنواتك",
    subtitle: "المستوى الذي يصفك، البيئات التي تعوّدت عليها، ورابط حقيقي واحد يكفي.",
  },
  thinking: {
    eyebrow: "الفصل 03 · التفكير",
    title: "كيف تفكّر؟",
    subtitle: `12 سؤالًا — أجب على ${THINKING_MIN_ANSWERS} منها على الأقل. اختر الأسئلة التي تشبهك، واكتب كما تتحدث.`,
  },
  work: {
    eyebrow: "الفصل 04 · العمل",
    title: "دع عملك يتحدث عنك",
    subtitle: "مشروع واحد بعمق: المشكلة، دورك، الأدوات، النتيجة. وأضف مشروعين آخرين إن أردت.",
  },
  match: {
    eyebrow: "الفصل 05 · التوافق",
    title: "كيف نعمل معًا؟",
    subtitle: "AI في عملك، طريقة التعاون، التوفر، والتسعير — في فصل واحد سريع.",
  },
  closing: {
    eyebrow: "الفصل 06 · الإرسال",
    title: "لماذا مُريح؟ ثم شفافية كاملة",
    subtitle: "سؤال أخير مهم، ثم إقرارات الوضوح قبل الإرسال.",
  },
};

/* ------------------------- كتلة قسم داخل الفصل ------------------------ */

function SectionBlock({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-t border-line/80 pt-7 first:border-0 first:pt-0", className)}>
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
          {label}
        </h3>
        {hint && <span className="text-[12.5px] leading-6 text-ink-faint">{hint}</span>}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

/* ====================== 01 — Profile (هوية + مجالات) ===================== */

function ProfileStep({ form }: StepProps) {
  const services = (form.watch("services") as string[]) ?? [];
  const primary = form.watch("primary_specialty") as string;
  const [open, setOpen] = React.useState<string[]>(() => {
    const chosen = new Set(services);
    return SPECIALTY_GROUPS.filter((g) => g.items.some((i) => chosen.has(i))).map((g) => g.key);
  });

  React.useEffect(() => {
    if (primary && !services.includes(primary)) {
      form.setValue("primary_specialty", "", { shouldValidate: false });
    }
  }, [primary, services, form]);

  const toggleCat = (key: string) =>
    setOpen((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div className="space-y-8">
      <SectionBlock label="الهوية">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput
            form={form}
            name="full_name"
            label="الاسم الكامل"
            autoComplete="name"
            placeholder="مثال: سارة عبد الله"
            className="sm:col-span-2"
          />
          <TextInput
            form={form}
            name="preferred_name"
            label="الاسم الذي تفضّل أن نناديك به"
            hint="نستخدمه في التواصل"
            autoComplete="nickname"
            placeholder="مثال: سارة"
          />
          <TextInput
            form={form}
            name="email"
            label="البريد الإلكتروني"
            type="email"
            inputMode="email"
            dir="ltr"
            autoComplete="email"
            placeholder="name@example.com"
          />
          <TextInput
            form={form}
            name="phone"
            label="رقم التواصل"
            hint="مع رمز الدولة"
            type="tel"
            inputMode="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder="+970 5x xxx xxxx"
          />
          <TextInput
            form={form}
            name="country"
            label="الدولة"
            autoComplete="country-name"
            placeholder="مثال: فلسطين"
          />
          <TextInput
            form={form}
            name="city"
            label="المدينة"
            autoComplete="address-level2"
            placeholder="مثال: غزة"
          />
        </div>
      </SectionBlock>

      <SectionBlock label="مجالاتك" hint="افتح المجال ثم اختر ما نفّذته في عمل حقيقي">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {SPECIALTY_GROUPS.map((g) => {
            const active = open.includes(g.key);
            const count = g.items.filter((i) => services.includes(i)).length;
            return (
              <button
                key={g.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggleCat(g.key)}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-xl border p-3.5 text-start transition-all duration-200 ease-calm",
                  active
                    ? "border-gold-deep bg-gold-tint/60 shadow-[0_0_0_1px_rgba(212,175,55,0.3)]"
                    : "border-line bg-white/70 hover:border-gold/50 hover:bg-white",
                )}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="ltr text-[14px] font-semibold text-navy">{g.label}</span>
                  {count > 0 ? (
                    <span className="ltr rounded-full bg-navy px-2 py-0.5 text-[11px] font-semibold text-ivory-50">
                      {count}
                    </span>
                  ) : (
                    <span
                      aria-hidden
                      className={cn(
                        "text-[15px] leading-none text-ink-faint transition-transform duration-200",
                        active && "rotate-45",
                      )}
                    >
                      +
                    </span>
                  )}
                </span>
                <span className="text-[12.5px] leading-6 text-ink-muted">{g.blurb}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {open.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <ChipMulti
                form={form}
                name="services"
                label="ما الخدمات التي تقدّمها فعلًا؟"
                hint="اختر ما نفّذته في عمل حقيقي، لا كل ما تعرفه"
                groups={SPECIALTY_GROUPS.filter((g) => open.includes(g.key))}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {services.length > 0 && (
          <Segmented
            form={form}
            name="primary_specialty"
            label="أي واحدة تعتبرها تخصصك الأساسي؟"
            hint={`اخترت ${services.length} خدمة — واحدة فقط تكون الأساس`}
            options={services.map((s) => ({ value: s }))}
          />
        )}
      </SectionBlock>
    </div>
  );
}

/* =========================== 02 — Experience ========================== */

function ExperienceStep({ form }: StepProps) {
  return (
    <div className="space-y-8">
      <SectionBlock label="المستوى والخبرة">
        <RadioDesc
          form={form}
          name="experience_level"
          label="كيف تصف مستواك في المجال الذي اخترته؟"
          hint="الصراحة هنا تفيدك أكثر من المبالغة"
          options={EXPERIENCE_LEVELS.map((l) => ({ value: l.value, ar: l.ar, desc: l.desc }))}
        />
        <Segmented
          form={form}
          name="years_experience"
          label="منذ متى وأنت تستخدم هذه المهارة في مشاريع حقيقية؟"
          options={YEARS_BANDS.map((v) => ({ value: v }))}
        />
        <ChipMulti
          form={form}
          name="project_types_worked_on"
          label="ما نوع المشاريع التي عملت عليها؟"
          hint="البيئات التي تعوّدت العمل فيها"
          options={PROJECT_TYPES_WORKED_ON}
        />
      </SectionBlock>

      <SectionBlock label="روابط تخلينا نوصلك" hint="كلها اختيارية — رابط حقيقي واحد أفضل من ثلاثة فارغة">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput
            form={form}
            name="portfolio_url"
            label="رابط الأعمال (Portfolio)"
            dir="ltr"
            required={false}
            placeholder="https://"
          />
          <TextInput
            form={form}
            name="linkedin_url"
            label="LinkedIn"
            dir="ltr"
            required={false}
            placeholder="https://"
          />
          <TextInput
            form={form}
            name="github_url"
            label="GitHub"
            dir="ltr"
            required={false}
            placeholder="https://"
          />
          <TextInput
            form={form}
            name="website_url"
            label="موقعك الشخصي"
            dir="ltr"
            required={false}
            placeholder="https://"
          />
        </div>
      </SectionBlock>
    </div>
  );
}

/* ================= 03 — Thinking (منتقي الأسئلة: 4 من 12) ================= */

function ThinkingStep({ form }: StepProps) {
  const reduce = useReducedMotion();
  const [openColumn, setOpenColumn] = React.useState<string | null>(null);

  const values = form.watch() as FormValues;
  const answered = THINKING_QUESTIONS.filter(
    (q) => String(values[q.column as FieldName] ?? "").trim().length > 0,
  );
  const quotaMet = answered.length >= THINKING_MIN_ANSWERS;

  /* خطأ الحصة أو خطأ طول إجابة → افتح البطاقة المعنية ليفهم المستخدم المطلوب */
  const errors = form.formState.errors as Record<string, { message?: string } | undefined>;
  const quotaMessage = thinkingQuotaMessage(THINKING_MIN_ANSWERS);
  const firstErrorColumn = THINKING_QUESTIONS.find((q) => errors[q.column]?.message)?.column ?? null;

  React.useEffect(() => {
    if (firstErrorColumn && firstErrorColumn !== openColumn) {
      setOpenColumn(firstErrorColumn);
      window.setTimeout(() => {
        document
          .getElementById(`think-tile-${firstErrorColumn}`)
          ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      }, 80);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstErrorColumn]);

  const isQuotaError = firstErrorColumn
    ? errors[firstErrorColumn]?.message === quotaMessage
    : false;

  return (
    <div className="space-y-8">
      {/* عدّاد الحصة — يحوّل القاعدة إلى تغذية راجعة مرئية live */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors duration-300",
          quotaMet ? "border-emerald-300/70 bg-emerald-50/60" : "border-gold/40 bg-gold-tint/40",
        )}
      >
        <p className="text-[13.5px] leading-7 text-ink-soft">
          {quotaMet
            ? `ممتاز — أجبت على ${answered.length} أسئلة. يمكنك إضافة المزيد أو المتابعة.`
            : `اختر أسئلة تشبهك وأجب عليها — يكفي ${THINKING_MIN_ANSWERS} لنفهم طريقة تفكيرك.`}
        </p>
        <span
          className={cn(
            "ltr inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12.5px] font-semibold tabular-nums",
            quotaMet ? "bg-emerald-600 text-white" : "bg-navy text-ivory-50",
          )}
          aria-live="polite"
        >
          <CheckIcon className="h-3.5 w-3.5" />
          {answered.length} / {THINKING_MIN_ANSWERS}
        </span>
      </div>

      {isQuotaError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-300/70 bg-red-50/70 px-4 py-3 text-[13.5px] leading-7 text-red-800"
        >
          {quotaMessage}
        </div>
      )}

      {THINKING_PAGES.map((group) => (
        <SectionBlock key={group.id} label={group.title}>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {group.questions.map((q, i) => {
              const column = q.column as K;
              const text = String(values[column] ?? "");
              const isAnswered = text.trim().length > 0;
              const isOpen = openColumn === q.column;
              const globalIndex =
                THINKING_QUESTIONS.findIndex((x) => x.column === q.column) + 1;
              const error = errors[q.column]?.message;

              return (
                <div
                  key={q.id}
                  id={`think-tile-${q.column}`}
                  className={cn("scroll-mt-header", isOpen && "sm:col-span-2")}
                >
                  <motion.div layout={!reduce} className="h-full">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenColumn(isOpen ? null : q.column)}
                      data-state={isOpen ? "open" : isAnswered ? "answered" : "idle"}
                      className="think-tile h-full"
                    >
                      <span className="flex w-full items-start justify-between gap-3">
                        <span className="flex min-w-0 items-start gap-2.5">
                          <span
                            className={cn(
                              "ltr mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums",
                              isAnswered
                                ? "bg-gold-deep text-white"
                                : "bg-ivory-300 text-ink-muted",
                            )}
                          >
                            {isAnswered ? <CheckIcon className="h-3 w-3" /> : String(globalIndex).padStart(2, "0")}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[14px] font-semibold leading-6 text-navy">
                              {q.title}
                            </span>
                            {!isOpen && (
                              <span className="clamp-2 mt-1 block text-[12.5px] leading-6 text-ink-muted">
                                {q.prompt}
                              </span>
                            )}
                          </span>
                        </span>
                        <span
                          aria-hidden
                          className={cn(
                            "mt-1 shrink-0 text-[13px] text-ink-faint transition-transform duration-200",
                            isOpen && "rotate-45 text-gold-deep",
                          )}
                        >
                          {isOpen ? "+" : isAnswered ? "✓" : "+"}
                        </span>
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-b-2xl border border-t-0 border-gold-deep/60 bg-white/80 p-4 sm:p-5">
                            <p className="mb-4 text-[14px] leading-8 text-navy">{q.prompt}</p>
                            <TextArea
                              form={form}
                              name={column}
                              label={q.title}
                              hint={q.hint}
                              minLength={q.minLength}
                              rows={5}
                            />
                            <div className="mt-1 flex justify-end">
                              <button
                                type="button"
                                className="btn-quiet !min-h-0 !px-3 !py-1.5 !text-[13px]"
                                onClick={() => setOpenColumn(null)}
                              >
                                إغلاق السؤال
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </SectionBlock>
      ))}

      <p className="text-[12.5px] leading-7 text-ink-faint">
        لا إجابة صحيحة واحدة هنا — نقرأ طريقة تفكيرك لا معلوماتك. الأسئلة المتروكة تبقى فارغة في
        ملفك، ولا تُحسب ضدك.
      </p>
    </div>
  );
}

/* ============================= 04 — Work ============================== */

type ProjectNumber = 1 | 2 | 3;

function ProjectBlock({
  form,
  n,
  onRemove,
  canRemove,
}: {
  form: Form;
  n: ProjectNumber;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const names = { 1: "المشروع الأول", 2: "المشروع الثاني", 3: "المشروع الثالث" } as const;

  return (
    <section className="rounded-2xl border border-line bg-ivory-100/60 p-4 sm:p-5">
      <header className="mb-4 flex items-center justify-between gap-4">
        <h4 className="flex items-center gap-2.5 text-[15px] font-semibold text-navy">
          <span className="ltr grid h-6 w-6 place-items-center rounded-full bg-navy text-[11px] font-semibold text-gold tabular-nums">
            {n}
          </span>
          {names[n]}
          {n === 1 && (
            <span className="rounded-full border border-gold/40 bg-gold-tint px-2 py-0.5 text-[11px] font-medium text-gold-deep">
              إلزامي
            </span>
          )}
        </h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="btn-quiet !min-h-0 !px-3 !py-1.5 !text-[13px]"
          >
            إزالة
          </button>
        )}
      </header>

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <TextInput
            form={form}
            name={`project_${n}` as K}
            label="اسم المشروع أو رابط له"
            placeholder="مثال: منصة حجز مواعيد — أو https://..."
          />
          <TextInput
            form={form}
            name={`project_${n}_tools` as K}
            label="الأدوات التي استخدمتها"
            dir="ltr"
            placeholder="Figma · Next.js"
          />
        </div>
        <TextArea
          form={form}
          name={`project_${n}_problem` as K}
          label="ما المشكلة التي كان يحلّها؟"
          hint="السياق الذي جعل المشروع ضروريًا"
          rows={2}
        />
        <TextArea
          form={form}
          name={`project_${n}_role` as K}
          label="ماذا فعلت أنت؟ وما الجزء الذي نفّذته بنفسك؟"
          hint="كن دقيقًا: شاركت، أم تولّيت التنفيذ؟"
          rows={3}
        />
        <TextArea
          form={form}
          name={`project_${n}_result` as K}
          label="ما النتيجة؟"
          hint="رقم، أثر، أو ما تغيّر بعد التسليم"
          rows={2}
        />
      </div>
    </section>
  );
}

function WorkStep({ form }: StepProps) {
  const [extra, setExtra] = React.useState<ProjectNumber[]>(() => {
    const v = form.getValues();
    const list: ProjectNumber[] = [];
    if (String(v.project_2 ?? "").length > 0 || String(v.project_2_role ?? "").length > 0)
      list.push(2);
    if (String(v.project_3 ?? "").length > 0 || String(v.project_3_role ?? "").length > 0)
      list.push(3);
    return list;
  });

  const addNext = () => {
    const next: ProjectNumber = extra.includes(2) ? 3 : 2;
    setExtra((prev) => Array.from(new Set([...prev, next])).sort() as ProjectNumber[]);
  };

  const remove = (n: ProjectNumber) => {
    (["", "_problem", "_role", "_tools", "_result"] as const).forEach((suffix) => {
      form.setValue(`project_${n}${suffix}` as K, "", { shouldDirty: true });
    });
    form.clearErrors(`project_${n}` as K);
    setExtra((prev) => prev.filter((x) => x !== n));
  };

  const p2Error = form.formState.errors.project_2 as { message?: string } | undefined;
  const p3Error = form.formState.errors.project_3 as { message?: string } | undefined;

  return (
    <div className="space-y-5">
      <ProjectBlock form={form} n={1} onRemove={() => {}} canRemove={false} />
      {extra.includes(2) ? (
        <ProjectBlock form={form} n={2} onRemove={() => remove(2)} canRemove />
      ) : null}
      {p2Error?.message && (
        <p className="text-[13.5px] font-medium text-red-700">{p2Error.message}</p>
      )}
      {extra.includes(3) ? (
        <ProjectBlock form={form} n={3} onRemove={() => remove(3)} canRemove />
      ) : null}
      {p3Error?.message && (
        <p className="text-[13.5px] font-medium text-red-700">{p3Error.message}</p>
      )}

      {extra.length < 2 && (
        <button type="button" onClick={addNext} className="btn-ghost w-full border-dashed">
          + أضف مشروعًا آخر (اختياري)
        </button>
      )}

      <p className="text-[12.5px] leading-7 text-ink-faint">
        ثلاثة مشاريع كحدّ أقصى — الأول إلزامي والآخران اختياريان. لا نريد قائمة طويلة، نريد عمقًا:
        الرابط وحده لا يكفي، نحتاج المشكلة ودورك والأدوات والنتيجة.
      </p>
    </div>
  );
}

/* ================ 05 — Match (AI + تعاون + توفر + تسعير) ================ */

function MatchStep({ form }: StepProps) {
  return (
    <div className="space-y-8">
      <SectionBlock label="AI في عملك" hint="أين تستخدمه، وأين ترفض أن يقرر نيابة عنك">
        <ChipMulti
          form={form}
          name="ai_tools"
          label="ما أدوات AI التي تستخدمها؟"
          hint="اختر كل ما تستخدمه فعلًا"
          options={AI_TOOLS}
        />
        <RadioDesc
          form={form}
          name="ai_experience"
          label="كيف تصف استخدامك لها؟"
          options={AI_EXPERIENCE_LEVELS.map((l) => ({ value: l.value, ar: l.ar, desc: l.desc }))}
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <TextArea
            form={form}
            name="ai_workflow"
            label="كيف يدخل AI في Workflow الخاص بك؟"
            hint="في أي مرحلة؟ وماذا يبقى عليك أنت؟"
            minLength={80}
            rows={4}
          />
          <TextArea
            form={form}
            name="ai_boundaries"
            label="ما الذي ترفض أن تترك AI يقرره نيابة عنك؟"
            hint="الإجابة هنا تقول كيف تعمل تحت الضغط"
            minLength={50}
            rows={4}
          />
        </div>
      </SectionBlock>

      <SectionBlock label="طريقة التعاون" hint="هذا هو نموذج مُريح: مشاريع وخدمات، لا توظيف">
        <RadioDesc
          form={form}
          name="collaboration_type"
          label="كيف تفضّل التعاون؟"
          options={COLLABORATION_TYPES.map((c) => ({ value: c.value, ar: c.ar, desc: c.desc }))}
        />
        <ChipMulti
          form={form}
          name="preferred_project_types"
          label="ما نوع المشاريع التي تتحمّس للعمل عليها؟"
          options={PREFERRED_PROJECT_TYPES}
        />
      </SectionBlock>

      <SectionBlock label="التوفر والتسعير" hint="نطاق استرشادي — لا عرض تعاقدي">
        <div className="grid gap-5 lg:grid-cols-2">
          <Segmented
            form={form}
            name="availability"
            label="متى تستطيع بدء مشروع جديد؟"
            options={START_AVAILABILITY.map((a) => ({ value: a.value, ar: a.ar }))}
          />
          <Segmented
            form={form}
            name="weekly_capacity"
            label="كم من وقتك تستطيع تخصيصه أسبوعيًا؟"
            options={WEEKLY_CAPACITY.map((c) => ({ value: c.value }))}
          />
          <Segmented
            form={form}
            name="pricing_model"
            label="كيف تسعّر خدماتك عادة؟"
            options={PRICING_MODELS.map((p) => ({ value: p.value, ar: p.ar }))}
          />
          <div className="grid grid-cols-[2fr_1fr] gap-4">
            <TextInput
              form={form}
              name="expected_project_range"
              label="النطاق السعري التقريبي"
              placeholder="800 – 2,500"
              dir="ltr"
            />
            <SelectInput form={form} name="currency" label="العملة" options={CURRENCIES} />
          </div>
        </div>
        <p className="rounded-xl border border-line bg-ivory-100/70 px-4 py-2.5 text-[12.5px] leading-6 text-ink-muted">
          {PRICING_NOTE}
        </p>
      </SectionBlock>
    </div>
  );
}

/* ====================== 06 — Closing (لماذا + إقرارات) ===================== */

function ClosingStep({ form }: StepProps) {
  return (
    <div className="space-y-8">
      <SectionBlock label="السؤال الأخير" hint="أجب على الجزئين — الثاني أهم عندنا">
        <TextArea
          form={form}
          name="why_mureeh_answer"
          label="لماذا تعتقد أن التعاون مع مُريح قد يكون مناسبًا لك؟ وما الذي تتوقع أن تضيفه أنت إلى مُريح؟"
          minLength={100}
          rows={6}
        />
      </SectionBlock>

      <SectionBlock label="شفافية كاملة قبل الإرسال" hint="بلا لغة قانونية معقدة">
        <div className="space-y-2.5">
          {AGREEMENT_ITEMS.map((item) => (
            <CheckboxRow key={item.name} form={form} name={item.name as K} label={item.text} />
          ))}
        </div>

        {/* Honeypot: خارج الشاشة، مخفي عن المستخدم وقارئ الشاشة */}
        <div aria-hidden className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor="company_website">Website</label>
          <input
            id="company_website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("honeypot")}
          />
        </div>
      </SectionBlock>
    </div>
  );
}

/* ============================== Registry ============================== */

export const STEP_BODIES: Record<StepId, React.ComponentType<StepProps>> = {
  profile: ProfileStep,
  experience: ExperienceStep,
  thinking: ThinkingStep,
  work: WorkStep,
  match: MatchStep,
  closing: ClosingStep,
};
