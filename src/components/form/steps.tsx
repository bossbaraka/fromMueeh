"use client";

/**
 * صفحات النموذج — 11 خطوة / 13 صفحة.
 * كل صفحة: عنوان + سؤال واضح + حقول. لا حقل بلا سبب.
 */

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FieldName, FormValues, StepId } from "@/lib/schema";
import type { Form } from "./fields";
import { CheckboxRow, ChipMulti, RadioCards, SelectInput, TextArea, TextInput } from "./fields";
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
  THINKING_PAGES,
  WEEKLY_CAPACITY,
  YEARS_BANDS,
} from "@/lib/content";

export type StepProps = { form: Form };
type K = FieldName;

export const STEP_META: Record<StepId, { eyebrow: string; title: string; subtitle: string }> = {
  identity: {
    eyebrow: "الخطوة 01",
    title: "خلينا نتعرف عليك",
    subtitle: "كل مشروع يبدأ بشخص يفهم ما يستطيع أن يضيفه.",
  },
  craft: {
    eyebrow: "الخطوة 02",
    title: "ماذا تستطيع أن تقدّم؟",
    subtitle: "اختر المجال الأقرب إليك، ثم الخدمات التي تقدّمها فعلًا — لا التي تعرفها نظريًا.",
  },
  experience: {
    eyebrow: "الخطوة 03",
    title: "دعنا نعرف خبرتك",
    subtitle: "لا نريد رقمًا فقط. نريد أن نفهم نوع العمل الذي تعوّدت عليه.",
  },
  "thinking-a": {
    eyebrow: "الخطوة 04 · 1 من 3",
    title: "كيف تقرأ المشكلة؟",
    subtitle: "لا إجابة صحيحة واحدة هنا. نقرأ طريقة تفكيرك لا معلوماتك.",
  },
  "thinking-b": {
    eyebrow: "الخطوة 04 · 2 من 3",
    title: "قرارات، جودة، وأدوات",
    subtitle: "نبحث عن معايير القرار عندك، لا عن شعارات.",
  },
  "thinking-c": {
    eyebrow: "الخطوة 04 · 3 من 3",
    title: "القيمة والمسؤولية",
    subtitle: "آخر أربعة أسئلة في هذه الخطوة — ثم ننتقل إلى عملك.",
  },
  work: {
    eyebrow: "الخطوة 05",
    title: "دع عملك يتحدث عنك",
    subtitle:
      "الرابط وحده لا يكفي: لكل مشروع نحتاج المشكلة، ودورك، والأدوات، والنتيجة — لنعرف الفرق بين «شاركت» و«تولّيت التنفيذ».",
  },
  ai: {
    eyebrow: "الخطوة 06",
    title: "كيف تستخدم AI؟",
    subtitle: "نريد أن نعرف أين تستخدمه، وأين ترفض أن يقرر نيابة عنك.",
  },
  collaboration: {
    eyebrow: "الخطوة 07",
    title: "كيف نعمل معًا؟",
    subtitle: "قبل أن نكمل، هذا هو نموذج التعاون في مُريح — بوضوح كامل.",
  },
  availability: {
    eyebrow: "الخطوة 08",
    title: "التوفر",
    subtitle: "متى تستطيع البدء، وكم من وقتك يمكن أن تخصّصه فعلًا؟",
  },
  pricing: {
    eyebrow: "الخطوة 09",
    title: "كيف تسعّر خدماتك؟",
    subtitle: "لا يوجد «راتب متوقع» هنا. يوجد نطاق نفهم منه طبيعة التعاون.",
  },
  why: {
    eyebrow: "الخطوة 10",
    title: "لماذا مُريح؟",
    subtitle: "هناك منصات كثيرة. نريد أن نعرف لماذا قد يكون هذا التعاون مناسبًا لك.",
  },
  agreement: {
    eyebrow: "الخطوة 11",
    title: "قبل أن ترسل طلبك",
    subtitle: "شفافية كاملة — دون لغة قانونية معقدة.",
  },
};

/* ============================ 01 — Identity =========================== */

function IdentityStep({ form }: StepProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
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
      <TextInput form={form} name="country" label="الدولة" autoComplete="country-name" placeholder="مثال: فلسطين" />
      <TextInput
        form={form}
        name="city"
        label="المدينة"
        autoComplete="address-level2"
        placeholder="مثال: غزة"
        className="sm:col-span-2 sm:max-w-[50%]"
      />
    </div>
  );
}

/* ============================= 02 — Craft ============================= */

function CraftStep({ form }: StepProps) {
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
    <div className="space-y-10">
      <div>
        <h3 className="mb-2 text-[15px] font-semibold text-navy">اختر المجالات القريبة منك</h3>
        <p className="mb-4 text-[13.5px] text-ink-muted">يمكنك اختيار أكثر من مجال — لن نعرض عليك إلا ما تختاره.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SPECIALTY_GROUPS.map((g) => {
            const active = open.includes(g.key);
            const count = g.items.filter((i) => services.includes(i)).length;
            return (
              <button
                key={g.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggleCat(g.key)}
                className={[
                  "flex flex-col items-start gap-1 rounded-2xl border p-4 text-start transition-all duration-200 ease-calm",
                  active
                    ? "border-gold-deep bg-gold-tint/60 shadow-[0_0_0_1px_rgba(212,175,55,0.3)]"
                    : "border-line bg-ivory-50 hover:border-gold/50 hover:bg-white",
                ].join(" ")}
              >
                <span className="flex w-full items-center justify-between">
                  <span className="ltr text-[15px] font-semibold text-navy">{g.label}</span>
                  {count > 0 && (
                    <span className="ltr rounded-full bg-navy px-2 py-0.5 text-[11px] font-semibold text-ivory-50">
                      {count}
                    </span>
                  )}
                </span>
                <span className="text-[13px] leading-6 text-ink-muted">{g.blurb}</span>
              </button>
            );
          })}
        </div>
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
        <RadioCards
          form={form}
          name="primary_specialty"
          label="أي واحدة تعتبرها تخصصك الأساسي؟"
          hint={`اخترت ${services.length} خدمة — واحدة فقط تكون الأساس`}
          columns={2}
          options={services.map((s) => ({ value: s }))}
        />
      )}
    </div>
  );
}

/* =========================== 03 — Experience ========================== */

function ExperienceStep({ form }: StepProps) {
  return (
    <div className="space-y-10">
      <RadioCards
        form={form}
        name="experience_level"
        label="كيف تصف مستواك في المجال الذي اخترته؟"
        hint="الصراحة هنا تفيدك أكثر من المبالغة"
        columns={2}
        options={EXPERIENCE_LEVELS.map((l) => ({ value: l.value, ar: l.ar, desc: l.desc }))}
      />

      <RadioCards
        form={form}
        name="years_experience"
        label="منذ متى وأنت تستخدم هذه المهارة في مشاريع حقيقية؟"
        columns={2}
        options={YEARS_BANDS.map((v) => ({ value: v }))}
      />

      <ChipMulti
        form={form}
        name="project_types_worked_on"
        label="ما نوع المشاريع التي عملت عليها؟"
        hint="البيئات التي تعوّدت العمل فيها"
        options={PROJECT_TYPES_WORKED_ON}
      />

      <div className="rounded-2xl border border-line bg-ivory-100/70 p-5">
        <h3 className="text-[15px] font-semibold text-navy">روابط تخلينا نوصلك</h3>
        <p className="mt-1 text-[13px] text-ink-muted">
          كلها اختيارية، لكن رابط حقيقي واحد أفضل من ثلاثة فارغة.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextInput form={form} name="portfolio_url" label="رابط الأعمال (Portfolio)" dir="ltr" required={false} placeholder="https://" />
          <TextInput form={form} name="linkedin_url" label="LinkedIn" dir="ltr" required={false} placeholder="https://" />
          <TextInput form={form} name="github_url" label="GitHub" dir="ltr" required={false} placeholder="https://" />
          <TextInput form={form} name="website_url" label="موقعك الشخصي" dir="ltr" required={false} placeholder="https://" />
        </div>
      </div>
    </div>
  );
}

/* =========================== 04 — Thinking ============================ */

function thinkingStep(index: 0 | 1 | 2) {
  return function ThinkingStep({ form }: StepProps) {
    const page = THINKING_PAGES[index];
    const start = index * 4;
    return (
      <div className="space-y-12">
        <p className="rounded-2xl border border-gold/30 bg-gold-tint/40 px-4 py-3 text-[13.5px] leading-7 text-ink-soft">
          {page.title} — أجب بالطول الذي تحتاجه، لكن اكتب كما تتحدث. لا نبحث عن إجابة مثالية.
        </p>
        {page.questions.map((q, i) => (
          <div key={q.id} className="border-t border-line/70 pt-10 first-of-type:border-0 first-of-type:pt-0">
            <p className="mb-4 rounded-2xl bg-ivory-100/80 p-4 text-[14.5px] leading-8 text-navy">
              <span className="ltr me-2 font-semibold text-gold-deep">{String(start + i + 1).padStart(2, "0")}</span>
              {q.prompt}
            </p>
            <TextArea
              form={form}
              name={q.column as K}
              label={q.title}
              hint={q.hint}
              minLength={q.minLength}
              rows={6}
            />
          </div>
        ))}
      </div>
    );
  };
}

/* ============================= 05 — Work ============================== */

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
    <section className="rounded-3xl border border-line bg-ivory-100/50 p-5 sm:p-6">
      <header className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-[15.5px] font-semibold text-navy">{names[n]}</h3>
        {canRemove && (
          <button type="button" onClick={onRemove} className="btn-quiet !min-h-0 !px-3 !py-1.5 !text-[13px]">
            إزالة
          </button>
        )}
      </header>

      <div className="grid gap-5">
        <TextInput
          form={form}
          name={`project_${n}` as K}
          label="اسم المشروع أو رابط له"
          placeholder="مثال: منصة حجز مواعيد — أو https://..."
        />
        <TextArea
          form={form}
          name={`project_${n}_problem` as K}
          label="ما المشكلة التي كان يحلّها؟"
          hint="السياق الذي جعل المشروع ضروريًا"
          rows={3}
        />
        <TextArea
          form={form}
          name={`project_${n}_role` as K}
          label="ماذا فعلت أنت؟ وما الجزء الذي نفّذته بنفسك؟"
          hint="كن دقيقًا: شاركت، أم تولّيت التنفيذ؟"
          rows={4}
        />
        <TextInput
          form={form}
          name={`project_${n}_tools` as K}
          label="الأدوات التي استخدمتها"
          dir="ltr"
          placeholder="Figma · Next.js · After Effects"
        />
        <TextArea
          form={form}
          name={`project_${n}_result` as K}
          label="ما النتيجة؟"
          hint="رقم، أثر، أو ما تغيّر بعد التسليم"
          rows={3}
        />
      </div>
    </section>
  );
}

function WorkStep({ form }: StepProps) {
  const [extra, setExtra] = React.useState<ProjectNumber[]>(() => {
    const v = form.getValues();
    const list: ProjectNumber[] = [];
    if (String(v.project_2 ?? "").length > 0 || String(v.project_2_role ?? "").length > 0) list.push(2);
    if (String(v.project_3 ?? "").length > 0 || String(v.project_3_role ?? "").length > 0) list.push(3);
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
    <div className="space-y-6">
      <ProjectBlock form={form} n={1} onRemove={() => {}} canRemove={false} />
      {extra.includes(2) ? (
        <ProjectBlock form={form} n={2} onRemove={() => remove(2)} canRemove />
      ) : null}
      {p2Error?.message && <p className="text-[13.5px] font-medium text-red-700">{p2Error.message}</p>}
      {extra.includes(3) ? (
        <ProjectBlock form={form} n={3} onRemove={() => remove(3)} canRemove />
      ) : null}
      {p3Error?.message && <p className="text-[13.5px] font-medium text-red-700">{p3Error.message}</p>}

      {extra.length < 2 && (
        <button type="button" onClick={addNext} className="btn-ghost w-full border-dashed">
          + أضف مشروعًا آخر
        </button>
      )}

      <p className="text-[13px] leading-7 text-ink-faint">
        ثلاثة مشاريع كحدّ أقصى — الأول إلزامي، والآخران اختياريان. لا نريد قائمة طويلة، نريد عمقًا.
      </p>
    </div>
  );
}

/* ============================== 06 — AI =============================== */

function AiStep({ form }: StepProps) {
  return (
    <div className="space-y-10">
      <ChipMulti
        form={form}
        name="ai_tools"
        label="ما أدوات AI التي تستخدمها؟"
        hint="اختر كل ما تستخدمه فعلًا"
        options={AI_TOOLS}
      />

      <RadioCards
        form={form}
        name="ai_experience"
        label="كيف تصف استخدامك لها؟"
        columns={2}
        options={AI_EXPERIENCE_LEVELS.map((l) => ({ value: l.value, ar: l.ar, desc: l.desc }))}
      />

      <TextArea
        form={form}
        name="ai_workflow"
        label="كيف يدخل AI في Workflow الخاص بك؟"
        hint="في أي مرحلة؟ وماذا يبقى عليك أنت؟"
        minLength={80}
        rows={7}
      />

      <TextArea
        form={form}
        name="ai_boundaries"
        label="ما الشيء الذي ترفض أن تترك AI يقرره نيابة عنك؟"
        hint="سؤال مهم جدًا لنا — الإجابة تقول كيف تعمل تحت الضغط"
        minLength={50}
        rows={6}
      />
    </div>
  );
}

/* ========================= 07 — Collaboration ========================= */

function CollaborationStep({ form }: StepProps) {
  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-navy/10 bg-navy/[0.03] p-5 sm:p-6">
        <h3 className="text-[15.5px] font-semibold text-navy">كيف يعمل التعاون في مُريح؟</h3>
        <div className="mt-3 space-y-3 text-[14px] leading-8 text-ink-soft">
          <p>
            مُريح تعمل بنظام التعاون القائم على{" "}
            <strong className="font-semibold text-navy">المشاريع والخدمات</strong>، وليس على التوظيف التقليدي.
            نستقطب المشاريع من العملاء، ثم نوزّع أجزاء منها على أصحاب المهارات المناسبين.
          </p>
          <ul className="space-y-2 ps-5">
            <li className="list-disc">
              تقديمك لهذا النموذج لا يعني وجود عقد عمل أو راتب ثابت أو ضمان الحصول على مشاريع.
            </li>
            <li className="list-disc">
              عند وجود مشروع مناسب، يمكن لمُريح التواصل معك والاتفاق بشكل منفصل على نطاق العمل، المخرجات،
              المدة، والمقابل المالي قبل بدء التنفيذ.
            </li>
            <li className="list-disc">المقابل يكون مقابل الخدمة أو المشروع المنفّذ — لا راتبًا وظيفيًا.</li>
          </ul>
        </div>
      </div>

      <RadioCards
        form={form}
        name="collaboration_type"
        label="كيف تفضّل التعاون؟"
        columns={2}
        options={COLLABORATION_TYPES.map((c) => ({ value: c.value, ar: c.ar, desc: c.desc }))}
      />

      <ChipMulti
        form={form}
        name="preferred_project_types"
        label="ما نوع المشاريع التي تتحمّس للعمل عليها؟"
        options={PREFERRED_PROJECT_TYPES}
      />
    </div>
  );
}

/* ========================== 08 — Availability ========================= */

function AvailabilityStep({ form }: StepProps) {
  return (
    <div className="space-y-10">
      <RadioCards
        form={form}
        name="availability"
        label="متى تستطيع بدء مشروع جديد؟"
        columns={2}
        options={START_AVAILABILITY.map((a) => ({ value: a.value, ar: a.ar }))}
      />
      <RadioCards
        form={form}
        name="weekly_capacity"
        label="كم من وقتك تستطيع تخصيصه أسبوعيًا؟"
        columns={3}
        options={WEEKLY_CAPACITY.map((c) => ({ value: c.value }))}
      />
    </div>
  );
}

/* ============================= 09 — Pricing =========================== */

function PricingStep({ form }: StepProps) {
  return (
    <div className="space-y-10">
      <RadioCards
        form={form}
        name="pricing_model"
        label="كيف تسعّر خدماتك عادة؟"
        columns={2}
        options={PRICING_MODELS.map((p) => ({ value: p.value, ar: p.ar }))}
      />

      <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
        <TextInput
          form={form}
          name="expected_project_range"
          label="ما النطاق السعري التقريبي الذي تعمل ضمنه؟"
          placeholder="800 – 2,500"
          dir="ltr"
        />
        <SelectInput form={form} name="currency" label="العملة" options={CURRENCIES} />
      </div>

      <p className="rounded-2xl border border-line bg-ivory-100/70 px-4 py-3 text-[13.5px] leading-7 text-ink-muted">
        {PRICING_NOTE}
      </p>
    </div>
  );
}

/* ============================== 10 — Why ============================== */

function WhyStep({ form }: StepProps) {
  return (
    <TextArea
      form={form}
      name="why_mureeh_answer"
      label="لماذا تعتقد أن التعاون مع مُريح قد يكون مناسبًا لك؟ وما الذي تتوقع أن تضيفه أنت إلى مُريح؟"
      hint="أجب على الجزئين — الثاني أهم عندنا"
      minLength={100}
      rows={9}
    />
  );
}

/* =========================== 11 — Agreement ========================== */

function AgreementStep({ form }: StepProps) {
  return (
    <div className="space-y-3">
      {AGREEMENT_ITEMS.map((item) => (
        <CheckboxRow
          key={item.name}
          form={form}
          name={item.name as K}
          label={item.text}
        />
      ))}

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
    </div>
  );
}

/* ============================== Registry ============================== */

export const STEP_BODIES: Record<StepId, React.ComponentType<StepProps>> = {
  identity: IdentityStep,
  craft: CraftStep,
  experience: ExperienceStep,
  "thinking-a": thinkingStep(0),
  "thinking-b": thinkingStep(1),
  "thinking-c": thinkingStep(2),
  work: WorkStep,
  ai: AiStep,
  collaboration: CollaborationStep,
  availability: AvailabilityStep,
  pricing: PricingStep,
  why: WhyStep,
  agreement: AgreementStep,
};
