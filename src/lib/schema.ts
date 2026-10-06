/**
 * Mureeh — Form Schema (Zod) + Step Contracts
 * -----------------------------------------------------------
 * مصدر الحقيقة الواحد للنموذج:
 *  1) التحقق (client + server) بنفس القواعد تمامًا.
 *  2) أسماء الأعمدة في Google Sheet مبنية على نفس المفاتيح.
 *  → لا يوجد أي تكرار بين الواجهة والسيرفر.
 */

import { z } from "zod";
import { THINKING_QUESTIONS, ALL_SPECIALTIES, THINKING_MIN_ANSWERS, thinkingQuotaMessage } from "./content";
import { toAsciiDigits } from "./utils";

/* ----------------------------- Helpers ----------------------------- */

const trim = (s: string) => s.replace(/\s+/g, " ").trim();

const isHttpUrl = (v: string) =>
  /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(v.trim());

const text = (opts: { min?: number; max?: number; msg?: string } = {}) => {
  const { min = 1, max = 4000, msg } = opts;
  return z
    .string()
    .transform(trim)
    .refine((v) => v.length >= min, msg ?? "هذا الحقل مطلوب.");
};

const optionalText = (max = 4000) =>
  z.string().transform(trim).refine((v) => v.length <= max, "النص أطول من المسموح.");

const optionalUrl = (msg = "أدخل رابطًا صحيحًا يبدأ بـ https://") =>
  z
    .string()
    .transform(trim)
    .refine((v) => v === "" || isHttpUrl(v), msg)
    .refine((v) => v.length <= 400, "الرابط طويل جدًا.");

const longAnswer = (min: number) =>
  z
    .string()
    .transform(trim)
    .refine(
      (v) => v.length >= min,
      `خلّينا نفهم تفكيرك أكثر — اكتب على الأقل ${min} حرفًا (${min} حرف).`,
    )
    .refine((v) => v.length <= 4000, "خلّيها مركّزة: 4000 حرف كحدّ أقصى.");

/**
 * إجابة تفكير اختيارية: فارغة تمامًا = «تركْت السؤال»،
 أو مكتوبة بشكل محترم (≥ الحد الأدنى) — لا نصف إجابات.
 */
const optionalLongAnswer = (min: number) =>
  z
    .string()
    .transform(trim)
    .refine(
      (v) => v.length === 0 || v.length >= min,
      `إن أردت إجابة هذا السؤال: اكتب ${min} حرفًا على الأقل — أو اتركه واختر سؤالًا غيره.`,
    )
    .refine((v) => v.length <= 4000, "خلّيها مركّزة: 4000 حرف كحدّ أقصى.");

const multi = (msg: string) =>
  z
    .array(z.string())
    .min(1, msg)
    .transform((arr) => Array.from(new Set(arr.map((s) => trim(s)))).filter(Boolean));

const oneOf = (values: readonly string[], msg: string) =>
  z.string().refine((v) => values.includes(v), msg);

const ack = (msg: string) => z.literal(true, { message: msg });

/* --------------------------- 01 — Identity -------------------------- */

const identity = z.object({
  full_name: text({ min: 3, msg: "اكتب اسمك الكامل كما تحب أن نراه." }).refine(
    (v) => v.length <= 120,
    "الاسم طويل جدًا.",
  ),
  preferred_name: text({ min: 2, msg: "اكتب الاسم الذي تحب أن نناديك به." }).refine(
    (v) => v.length <= 60,
    "الاسم طويل جدًا.",
  ),
  email: z
    .string()
    .transform((v) => v.trim().toLowerCase())
    .refine((v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v), "أدخل بريدًا إلكترونيًا صالحًا."),
  phone: z
    .string()
    // يقبل الأرقام العربية-الهندية (٠٥٩…) ويخزّنها بصيغة ASCII موحّدة في قاعدة البيانات
    .transform((v) => toAsciiDigits(trim(v)))
    .refine((v) => /^[+()\d][\d\s\-()]{5,24}$/.test(v), "أدخل رقم تواصل صحيحًا (مع رمز الدولة)."),
  country: text({ min: 2, msg: "اكتب الدولة." }),
  city: text({ min: 2, msg: "اكتب المدينة." }),
});

/* ---------------------------- 02 — Craft ---------------------------- */

const craft = z.object({
  services: multi("اختر خدمة واحدة على الأقل تقدّمها فعلًا.").refine(
    (arr) => arr.every((s) => ALL_SPECIALTIES.includes(s)),
    "قيمة غير معروفة في الخدمات.",
  ),
  primary_specialty: oneOf(ALL_SPECIALTIES, "اختر تخصصك الأساسي."),
});

/* -------------------------- 03 — Experience ------------------------- */

const experience = z.object({
  experience_level: oneOf(
    ["Beginner", "Intermediate", "Advanced", "Professional"],
    "اختر المستوى الذي يصفك.",
  ),
  years_experience: oneOf(
    ["أقل من سنة", "1–2 سنة", "3–5 سنوات", "6–10 سنوات", "أكثر من 10 سنوات"],
    "اختر المدة التي عملت فيها فعليًا.",
  ),
  project_types_worked_on: multi("اختر نوعًا واحدًا على الأقل من المشاريع."),
  portfolio_url: optionalUrl(),
  linkedin_url: optionalUrl(),
  github_url: optionalUrl(),
  website_url: optionalUrl(),
});

/* --------------------- 04 — Thinking (12 questions) ----------------- */

type ThinkingColumn =
  | "problem_framing_answer"
  | "pre_work_question_answer"
  | "brief_ambiguity_answer"
  | "quality_vs_speed_answer"
  | "tool_vs_outcome_answer"
  | "ai_philosophy_answer"
  | "prompt_vs_understanding_answer"
  | "failure_definition_answer"
  | "decision_making_answer"
  | "changed_belief_answer"
  | "value_answer"
  | "ownership_answer";

export type ThinkingValues = Record<ThinkingColumn, string>;

const minOf = (column: ThinkingColumn) =>
  THINKING_QUESTIONS.find((q) => q.column === column)?.minLength ?? 80;

/**
 * صيغة أسئلة التفكير — الأسئلة الاثنا عشر موجودة كلها (أعمدة الـ Sheet لا تتغير)،
 * لكن الإجابة على كل سؤال اختيارية؛ الحصة (4 على الأقل) يفرضها fullSchema أدناه.
 */
const thinkingShape = {
  problem_framing_answer: optionalLongAnswer(minOf("problem_framing_answer")),
  pre_work_question_answer: optionalLongAnswer(minOf("pre_work_question_answer")),
  brief_ambiguity_answer: optionalLongAnswer(minOf("brief_ambiguity_answer")),
  quality_vs_speed_answer: optionalLongAnswer(minOf("quality_vs_speed_answer")),
  tool_vs_outcome_answer: optionalLongAnswer(minOf("tool_vs_outcome_answer")),
  ai_philosophy_answer: optionalLongAnswer(minOf("ai_philosophy_answer")),
  prompt_vs_understanding_answer: optionalLongAnswer(minOf("prompt_vs_understanding_answer")),
  failure_definition_answer: optionalLongAnswer(minOf("failure_definition_answer")),
  decision_making_answer: optionalLongAnswer(minOf("decision_making_answer")),
  changed_belief_answer: optionalLongAnswer(minOf("changed_belief_answer")),
  value_answer: optionalLongAnswer(minOf("value_answer")),
  ownership_answer: optionalLongAnswer(minOf("ownership_answer")),
};

/* --------------------------- 05 — Work ------------------------------ */

/**
 * المشاريع الثلاثة — مكتوبة صراحةً بمفاتيح حرفية (لا مفاتيح محسوبة)
 * حتى يبقى استنتاج الأنواع سليمًا ويطابق عقد TalentValues تمامًا.
 * المشروع 1 إلزامي، والمشروعان 2 و3 اختياريان (إمّا مكتملان أو فارغان).
 */
const work = z.object({
  // --- المشروع 1 (إلزامي) ---
  project_1: text({ min: 3, msg: "اكتب اسم المشروع أو رابطًا له." }),
  project_1_problem: text({
    min: 30,
    msg: "وضّح المشكلة التي كان المشروع يحلّها (30 حرفًا على الأقل).",
  }),
  project_1_role: text({
    min: 40,
    msg: "اشرح دورك والجزء الذي نفّذته بنفسك (40 حرفًا على الأقل).",
  }),
  project_1_tools: text({ min: 3, msg: "اذكر الأدوات التي استخدمتها." }),
  project_1_result: text({ min: 20, msg: "ما النتيجة التي تحققت؟ (20 حرفًا على الأقل)" }),

  // --- المشروع 2 (اختياري) ---
  project_2: optionalText(300),
  project_2_problem: optionalText(4000),
  project_2_role: optionalText(4000),
  project_2_tools: optionalText(500),
  project_2_result: optionalText(2000),

  // --- المشروع 3 (اختياري) ---
  project_3: optionalText(300),
  project_3_problem: optionalText(4000),
  project_3_role: optionalText(4000),
  project_3_tools: optionalText(500),
  project_3_result: optionalText(2000),
});

/** قاعدة تعبئة المشاريع الاختيارية: إمّا كل الحقول أو لا شيء */
export function partialProjectErrors(values: Partial<TalentFormValues>) {
  const errors: { field: string; message: string }[] = [];
  for (const n of [2, 3] as const) {
    const keys = [
      `project_${n}`,
      `project_${n}_problem`,
      `project_${n}_role`,
      `project_${n}_tools`,
      `project_${n}_result`,
    ] as const;
    const filled = keys.filter((k) => String(values[k] ?? "").trim().length > 0).length;
    if (filled > 0 && filled < keys.length) {
      errors.push({
        field: `project_${n}`,
        message: `المشروع ${n === 2 ? "الثاني" : "الثالث"}: إمّا تكمل كل حقوله أو تتركه فارغًا بالكامل.`,
      });
    }
  }
  return errors;
}

/* ----------------------------- 06 — AI ------------------------------ */

const ai = z.object({
  ai_tools: multi("اختر أداة واحدة على الأقل — أو Other."),
  ai_experience: oneOf(["Curious", "User", "Power user", "Integrator"], "اختر وصفًا لاستخدامك."),
  ai_workflow: longAnswer(80),
  ai_boundaries: longAnswer(50),
});

/* ------------------------ 07 — Collaboration ------------------------ */

const collaboration = z.object({
  collaboration_type: oneOf(
    [
      "Project-based",
      "Fixed Scope",
      "Milestone-based",
      "Hourly",
      "Long-term collaboration",
      "Flexible",
    ],
    "اختر طريقة التعاون المفضّلة.",
  ),
  preferred_project_types: multi("اختر نوعًا واحدًا على الأقل من المشاريع التي تتحمّس لها."),
});

/* ------------------------ 08 — Availability ------------------------- */

const availability = z.object({
  availability: oneOf(
    ["Immediately", "Within a week", "Within a month", "Flexible"],
    "اختر وقت البدء.",
  ),
  weekly_capacity: oneOf(
    ["أقل من 5 ساعات", "5–10 ساعات", "10–20 ساعة", "20–30 ساعة", "30+ ساعة"],
    "اختر عدد الساعات الأسبوعية.",
  ),
});

/* --------------------------- 09 — Pricing --------------------------- */

const pricing = z.object({
  pricing_model: oneOf(
    ["Fixed Project", "Hourly", "Milestone", "Depends on Scope"],
    "اختر طريقة التسعير.",
  ),
  expected_project_range: text({ min: 1, msg: "اكتب نطاقًا تقريبيًا (مثال: 500–1500)." }).refine(
    (v) => v.length <= 120,
    "اكتب نطاقًا مختصرًا.",
  ),
  currency: oneOf(["USD", "EUR", "AED", "SAR", "EGP", "JOD", "ILS", "أخرى"], "اختر العملة."),
});

/* ----------------------------- 10 — Why ----------------------------- */

const why = z.object({
  why_mureeh_answer: longAnswer(100),
});

/* -------------------------- 11 — Agreement -------------------------- */

const agreement = z.object({
  understood_project_based_model: ack("لازم تأكيد أنك تفهم أن الطلب لا يعني التوظيف."),
  project_services_model: ack("لازم تأكيد أن التعاون يتم حسب المشاريع والخدمات المتاحة."),
  compensation_is_service_based: ack("لازم تأكيد أن المقابل مقابل الخدمات أو المشاريع المتفق عليها."),
  no_guaranteed_work: ack("لازم تأكيد أنك تفهم أنه لا يوجد ضمان بالحصول على مشروع."),
  agreed_to_contact: ack("نحتاج موافقتك على أن نتواصل معك عند وجود فرصة مناسبة."),
  privacy_consent: ack("نحتاج موافقتك على استخدام بياناتك لغرض مراجعة الطلب والتواصل."),
});

/* ---------------------- Step registry (6 فصول) ---------------------- */

/**
 * ستة فصول بدل 13 صفحة: دمَجنا الحقول المتقاربة في فصل واحد متماسك،
 * وعقد البيانات (66 عمودًا في Google Sheet) لم يتغيّر إطلاقًا.
 */
const profile = z.object({ ...identity.shape, ...craft.shape });
const thinkingChapter = z.object(thinkingShape);
const match = z.object({
  ...ai.shape,
  ...collaboration.shape,
  ...availability.shape,
  ...pricing.shape,
});
const closing = z.object({ ...why.shape, ...agreement.shape });

export const stepSchemas = {
  profile,
  experience,
  thinking: thinkingChapter,
  work,
  match,
  closing,
} as const;

export type StepId = keyof typeof stepSchemas;

export const STEP_IDS = Object.keys(stepSchemas) as StepId[];

/** كل الحقول التي يجب التحقق منها عند الضغط على «متابعة» في صفحة معيّنة */
export const fieldsForStep = (id: StepId): string[] =>
  Object.keys((stepSchemas[id] as unknown as z.ZodObject<z.ZodRawShape>).shape);

/* --------------------------- Full schema ---------------------------- */

/**
 * المخطط الكامل: كائن واحد صريح (لا دمج متسلسل) — لضمان تحقق واحد واستنتاج نظيف.
 */
export const fullSchema = z
  .object({
    ...identity.shape,
    ...craft.shape,
    ...experience.shape,
    ...thinkingShape,
    ...work.shape,
    ...ai.shape,
    ...collaboration.shape,
    ...availability.shape,
    ...pricing.shape,
    ...why.shape,
    ...agreement.shape,
  })
  .superRefine((values, ctx) => {
    for (const issue of partialProjectErrors(values)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: issue.message, path: [issue.field] });
    }
    if (
      values.primary_specialty &&
      values.services.length > 0 &&
      !values.services.includes(values.primary_specialty)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "التخصص الأساسي يجب أن يكون واحدًا من الخدمات التي اخترتها.",
        path: ["primary_specialty"],
      });
    }
    /* حصة أسئلة التفكير: 4 إجابات على الأقل — الخطأ يُوضع على أول سؤال غير مُجاب */
    const thinkingValues = values as unknown as Record<string, string>;
    const answered = THINKING_QUESTIONS.filter(
      (q) => thinkingValues[q.column].trim().length > 0,
    ).length;
    if (answered < THINKING_MIN_ANSWERS) {
      const target = THINKING_QUESTIONS.find((q) => thinkingValues[q.column].trim().length === 0);
      if (target) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: thinkingQuotaMessage(THINKING_MIN_ANSWERS),
          path: [target.column],
        });
      }
    }
  });

/**
 * حماية وقت الترجمة: مخرجات Zod يجب أن تكون متوافقة مع عقد TalentValues.
 * ملاحظة: حقول الموافقة في المخرجات تكون `true` حرفيًا (لأنها z.literal(true)) — وهي متوافقة مع boolean.
 */
type SchemaConformsToContract<T> = [z.infer<typeof fullSchema>] extends [T] ? true : never;
const _schemaMatchesContract: SchemaConformsToContract<TalentValues> = true;
void _schemaMatchesContract;

/**
 * عقد البيانات الصريح (Data Contract).
 * Zod هو المصدر التنفيذي للتحقق، وهذا النوع هو العقد المقروء الذي تعتمد عليه
 * الواجهة وطبقة Google Sheets. أي حقل جديد يجب أن يُضاف هنا وفي Zod معًا.
 */
export type TalentValues = {
  // 01 — Identity
  full_name: string;
  preferred_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;

  // 02 — Craft
  services: string[];
  primary_specialty: string;

  // 03 — Experience
  experience_level: string;
  years_experience: string;
  project_types_worked_on: string[];
  portfolio_url: string;
  linkedin_url: string;
  github_url: string;
  website_url: string;

  // 04 — Thinking (12)
  problem_framing_answer: string;
  pre_work_question_answer: string;
  brief_ambiguity_answer: string;
  quality_vs_speed_answer: string;
  tool_vs_outcome_answer: string;
  ai_philosophy_answer: string;
  prompt_vs_understanding_answer: string;
  failure_definition_answer: string;
  decision_making_answer: string;
  changed_belief_answer: string;
  value_answer: string;
  ownership_answer: string;

  // 05 — Portfolio
  project_1: string;
  project_1_problem: string;
  project_1_role: string;
  project_1_tools: string;
  project_1_result: string;
  project_2: string;
  project_2_problem: string;
  project_2_role: string;
  project_2_tools: string;
  project_2_result: string;
  project_3: string;
  project_3_problem: string;
  project_3_role: string;
  project_3_tools: string;
  project_3_result: string;

  // 06 — AI
  ai_tools: string[];
  ai_experience: string;
  ai_workflow: string;
  ai_boundaries: string;

  // 07 — Collaboration
  collaboration_type: string;
  preferred_project_types: string[];

  // 08 — Availability
  availability: string;
  weekly_capacity: string;

  // 09 — Pricing
  pricing_model: string;
  expected_project_range: string;
  currency: string;

  // 10 — Why
  why_mureeh_answer: string;

  // 11 — Agreement
  understood_project_based_model: boolean;
  project_services_model: boolean;
  compensation_is_service_based: boolean;
  no_guaranteed_work: boolean;
  agreed_to_contact: boolean;
  privacy_consent: boolean;
};

/** الاسم المتوافق مع بقية الملفات (السيرفر + Sheets) */
export type TalentFormValues = TalentValues;

/** أسماء الحقول — مفتاح الكتابة في كل مكان */
export type FieldName = keyof TalentValues;

/* -------------------------- Request payload ------------------------- */

export const metaSchema = z.object({
  honeypot: z.string().max(200).optional().default(""),
  source: z.string().max(120).optional().default("web"),
  turnstileToken: z.string().max(2000).optional().default(""),
  elapsedMs: z.number().int().nonnegative().optional().default(0),
});

export const submissionSchema = fullSchema.and(metaSchema);
export type SubmissionPayload = z.infer<typeof submissionSchema>;

/* ------------------------------ Defaults ---------------------------- */

export const defaultValues: TalentValues & { honeypot: string } = {
  // 01
  full_name: "",
  preferred_name: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  // 02
  services: [],
  primary_specialty: "",
  // 03
  experience_level: "",
  years_experience: "",
  project_types_worked_on: [],
  portfolio_url: "",
  linkedin_url: "",
  github_url: "",
  website_url: "",
  // 04
  problem_framing_answer: "",
  pre_work_question_answer: "",
  brief_ambiguity_answer: "",
  quality_vs_speed_answer: "",
  tool_vs_outcome_answer: "",
  ai_philosophy_answer: "",
  prompt_vs_understanding_answer: "",
  failure_definition_answer: "",
  decision_making_answer: "",
  changed_belief_answer: "",
  value_answer: "",
  ownership_answer: "",
  // 05
  project_1: "",
  project_1_problem: "",
  project_1_role: "",
  project_1_tools: "",
  project_1_result: "",
  project_2: "",
  project_2_problem: "",
  project_2_role: "",
  project_2_tools: "",
  project_2_result: "",
  project_3: "",
  project_3_problem: "",
  project_3_role: "",
  project_3_tools: "",
  project_3_result: "",
  // 06
  ai_tools: [],
  ai_experience: "",
  ai_workflow: "",
  ai_boundaries: "",
  // 07
  collaboration_type: "",
  preferred_project_types: [],
  // 08
  availability: "",
  weekly_capacity: "",
  // 09
  pricing_model: "",
  expected_project_range: "",
  currency: "USD",
  // 10
  why_mureeh_answer: "",
  // 11
  understood_project_based_model: false,
  project_services_model: false,
  compensation_is_service_based: false,
  no_guaranteed_work: false,
  agreed_to_contact: false,
  privacy_consent: false,
  // meta
  honeypot: "",
};

/** قيم النموذج داخل الواجهة (تشمل حقل المصيدة) */
export type FormValues = TalentValues & { honeypot: string };
