/**
 * Mureeh — محتوى النظام (Arabic-first)
 * كل نص يراه المستخدم موجود هنا: يمكن لفريق مُريح تعديله دون لمس المنطق.
 */

/* ------------------------------------------------------------------ */
/* 02 — CORE OBJECTIVE : Understand → Think → Verify → Match → Collaborate */
/* ------------------------------------------------------------------ */

export const TALENT_STAGES = [
  {
    key: "understand",
    en: "Understand",
    ar: "نفهم",
    desc: "من أنت، وما خلفيتك، وكيف وصلت إلى ما تعرفه اليوم.",
  },
  {
    key: "think",
    en: "Think",
    ar: "نقرأ تفكيرك",
    desc: "أسئلة لا إجابة صحيحة واحدة لها — نقرأ طريقة تفكيرك لا معلوماتك.",
  },
  {
    key: "verify",
    en: "Verify",
    ar: "نتحقق من عملك",
    desc: "أعمال حقيقية، ودورك الحقيقي فيها: شاركت أم ملكت التنفيذ.",
  },
  {
    key: "match",
    en: "Match",
    ar: "نطابق الفرص",
    desc: "نعرف أي نوع مشاريع يناسبك، وأي جزء منها يمكن أن يكون لك.",
  },
  {
    key: "collaborate",
    en: "Collaborate",
    ar: "نتعاون",
    desc: "نطريقة التعاون، التسعير، والتوفر — قبل أن نبدأ أي نقاش.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* STEP 02 — CATEGORIES & SERVICES                                     */
/* ------------------------------------------------------------------ */

export type SpecialtyGroup = {
  key: string;
  label: string;
  labelEn: string;
  blurb: string;
  items: string[];
};

export const SPECIALTY_GROUPS: SpecialtyGroup[] = [
  {
    key: "software",
    label: "Software",
    labelEn: "Software",
    blurb: "بناء الأنظمة والمنتجات التقنية.",
    items: [
      "Frontend",
      "Backend",
      "Full Stack",
      "Mobile",
      "QA",
      "DevOps",
      "Cloud",
      "Cybersecurity",
    ],
  },
  {
    key: "design",
    label: "Design",
    labelEn: "Design",
    blurb: "تحويل الأفكار إلى تجربة يفهمها الإنسان.",
    items: ["UI/UX", "Graphic Design", "Brand Identity", "Motion Design"],
  },
  {
    key: "content",
    label: "Content",
    labelEn: "Content",
    blurb: "السرد الذي يجعل المشروع مفهومًا ومطلوبًا.",
    items: ["Video Production", "Video Editing", "Photography", "Copywriting", "Content Creation"],
  },
  {
    key: "ai",
    label: "AI",
    labelEn: "AI",
    blurb: "تشغيل الذكاء الاصطناعي داخل عمل حقيقي.",
    items: [
      "AI Integration",
      "AI Automation",
      "AI Agents",
      "AI Video",
      "AI Image",
      "AI Content",
      "Prompt Engineering",
    ],
  },
  {
    key: "business",
    label: "Business",
    labelEn: "Business",
    blurb: "ربط التنفيذ بالنتيجة التجارية.",
    items: [
      "Project Management",
      "Product Management",
      "Business Analysis",
      "Marketing",
      "SEO",
      "Sales",
    ],
  },
];

export const ALL_SPECIALTIES = SPECIALTY_GROUPS.flatMap((g) => g.items);

/* ------------------------------------------------------------------ */
/* STEP 03 — EXPERIENCE                                                */
/* ------------------------------------------------------------------ */

export const EXPERIENCE_LEVELS = [
  {
    value: "Beginner",
    label: "Beginner",
    ar: "أبدأ",
    desc: "أفهم الأساسيات وأعمل عليها بمتابعة.",
  },
  {
    value: "Intermediate",
    label: "Intermediate",
    ar: "أعمل بثقة",
    desc: "أنجز مهامًا كاملة وأعرف حدود معرفتي.",
  },
  {
    value: "Advanced",
    label: "Advanced",
    ar: "متقدّم",
    desc: "أقود التنفيذ وأحلّ المشكلات الصعبة.",
  },
  {
    value: "Professional",
    label: "Professional",
    ar: "احترافي",
    desc: "أعمل على مستوى قرار، لا تنفيذ فقط.",
  },
] as const;

export const YEARS_BANDS = [
  "أقل من سنة",
  "1–2 سنة",
  "3–5 سنوات",
  "6–10 سنوات",
  "أكثر من 10 سنوات",
] as const;

export const PROJECT_TYPES_WORKED_ON = [
  "Startups",
  "SMEs",
  "Enterprise",
  "Government / NGOs",
  "Agencies",
  "Individual clients",
  "E-commerce",
  "SaaS / Platforms",
  "Media & Content",
  "Education",
  "Health",
  "Fintech",
  "أخرى",
] as const;

/* ------------------------------------------------------------------ */
/* STEP 04 — THINKING (12 أسئلة)                                       */
/* ------------------------------------------------------------------ */

export type ThinkingQuestion = {
  id: string;
  column: string;
  title: string;
  prompt: string;
  hint: string;
  minLength: number;
};

export const THINKING_QUESTIONS: ThinkingQuestion[] = [
  {
    id: "q1",
    column: "problem_framing_answer",
    title: "المشكلة قبل الحل",
    prompt:
      "عندما يأتيك العميل بحل جاهز، لكنك تعتقد أن المشكلة الحقيقية مختلفة — هل تبدأ بالتنفيذ أم تعيد تعريف المشكلة أولًا؟",
    hint: "لا نبحث عن إجابة صحيحة. نبحث عن طريقة تفكيرك.",
    minLength: 120,
  },
  {
    id: "q2",
    column: "pre_work_question_answer",
    title: "السؤال الذي يسبق كل شيء",
    prompt: "ما السؤال الذي يجب أن تعرف إجابته قبل أن تبدأ أي مشروع؟ ولماذا اخترت هذا السؤال؟",
    hint: "سؤال واحد. لكنه يقول عنك الكثير.",
    minLength: 100,
  },
  {
    id: "q3",
    column: "brief_ambiguity_answer",
    title: "عندما لا تكون الصورة واضحة",
    prompt:
      "لديك Brief ناقص، وموعد تسليم محدد. أين تضع الحد بين «جمع المعلومات» و«إضاعة الوقت»؟",
    hint: "صف طريقة تفكيرك، لا القاعدة العامة.",
    minLength: 120,
  },
  {
    id: "q4",
    column: "quality_vs_speed_answer",
    title: "الجودة أم السرعة؟",
    prompt:
      "لديك وقت يكفي لإنجاز المشروع بشكل جيد، لكنه لا يكفي لإنجازه بشكل مثالي. كيف تحدد ما الذي يستحق أن يكون مثاليًا؟ وما الذي يمكن أن يكون جيدًا بما يكفي؟",
    hint: "نبحث عن معايير القرار عندك.",
    minLength: 120,
  },
  {
    id: "q5",
    column: "tool_vs_outcome_answer",
    title: "الأداة ليست الحل",
    prompt:
      "أصبحت قادرًا على إنجاز مهمة خلال ساعة بدل يوم باستخدام AI، لكن استخدامه لن يجعل النتيجة أفضل بالضرورة. هل ستستخدمه؟ ولماذا؟",
    hint: "السرعة ليست قيمة بحد ذاتها.",
    minLength: 100,
  },
  {
    id: "q6",
    column: "ai_philosophy_answer",
    title: "الذكاء الاصطناعي",
    prompt:
      "إذا أصبح بإمكان AI تنفيذ 80% من المهمة خلال دقائق — ما القيمة التي يجب أن تبقى للإنسان؟",
    hint: "أجب كما ترى، لا كما يُتوقع منك.",
    minLength: 120,
  },
  {
    id: "q7",
    column: "prompt_vs_understanding_answer",
    title: "Prompt أم فهم؟",
    prompt:
      "شخصان يستخدمان نفس AI: الأول يكتب Prompts ممتازة، والثاني يفهم المشكلة بعمق لكنه يكتب Prompts عادية. ما الفرق الحقيقي بينهما؟ وما الذي يبقى على المدى الطويل؟",
    hint: "قارن بين الطريقتين لا بين الأشخاص.",
    minLength: 120,
  },
  {
    id: "q8",
    column: "failure_definition_answer",
    title: "عندما يفشل الحل",
    prompt:
      "سلّمت المشروع في الموعد وكان خاليًا من الأخطاء التقنية، لكن العميل لم يحقق النتيجة التي كان يريدها. أين تبدأ مسؤولية صاحب الخدمة وأين تنتهي؟",
    hint: "المسؤولية سؤال تصميم، لا سؤال قانوني.",
    minLength: 120,
  },
  {
    id: "q9",
    column: "decision_making_answer",
    title: "كيف تعرف أنك مخطئ؟",
    prompt:
      "ما العلامة التي تجعلك تشك في قرار اتخذته؟ كيف تعرف أنك قد تكون مخطئًا قبل أن يخبرك شخص آخر بذلك؟",
    hint: "الوعي الذاتي مهارة تنفيذية.",
    minLength: 100,
  },
  {
    id: "q10",
    column: "changed_belief_answer",
    title: "تغيير القناعة",
    prompt:
      "ما الشيء الذي كنت تؤمن به في مجالك ثم غيّرت رأيك عنه؟ ما الدليل أو التجربة التي جعلتك تعيد التفكير؟",
    hint: "نحترم من يغيّر رأيه بالدليل.",
    minLength: 120,
  },
  {
    id: "q11",
    column: "value_answer",
    title: "القيمة",
    prompt:
      "إذا استطعت إنجاز مهمة خلال 10 دقائق بدل ساعتين باستخدام AI — هل أصبحت قيمة عملك أقل؟ أم أعلى؟ أم أن السؤال نفسه خاطئ؟ دافع عن إجابتك.",
    hint: "الدفاع عن الإجابة هو الأهم.",
    minLength: 120,
  },
  {
    id: "q12",
    column: "ownership_answer",
    title: "ماذا تبيع فعلًا؟",
    prompt:
      "عندما يطلب منك العميل «تصميم موقع» — ماذا تعتقد أنه يشتري منك فعلًا؟ الوقت؟ المهارة؟ الكود؟ التصميم؟ الخبرة؟ حل المشكلة؟ أم شيئًا آخر؟",
    hint: "الإجابة هنا تحدد كيف تسعّر عملك.",
    minLength: 100,
  },
];

/** تقسيم أسئلة التفكير إلى 3 مجموعات موضوعية — عناوين تُستخدم في منتقي الأسئلة */
export const THINKING_PAGES = [
  {
    id: "thinking-a",
    title: "كيف تقرأ المشكلة؟",
    questions: THINKING_QUESTIONS.slice(0, 4),
  },
  {
    id: "thinking-b",
    title: "قرارات، جودة، وأدوات",
    questions: THINKING_QUESTIONS.slice(4, 8),
  },
  {
    id: "thinking-c",
    title: "القيمة والمسؤولية",
    questions: THINKING_QUESTIONS.slice(8, 12),
  },
] as const;

/**
 * حصة أسئلة التفكير: النموذج مختصر عن قصد —
 * من 12 سؤالًا يكفي أن يجيب المتقدّم على 4 يختارها هو (والباقي اختياري بالكامل).
 * القاعدة مطبّقة في Zod (واجهة + سيرفر) بنفس الرسالة.
 */
export const THINKING_MIN_ANSWERS = 4;

export const thinkingQuotaMessage = (min: number) =>
  `أجب على ${min} أسئلة على الأقل من أسئلة التفكير — اختر ما يشبهك منها واترك الباقي.`;

/* ------------------------------------------------------------------ */
/* STEP 06 — AI                                                        */
/* ------------------------------------------------------------------ */

export const AI_TOOLS = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Cursor",
  "GitHub Copilot",
  "Midjourney",
  "Runway",
  "Kling",
  "Veo",
  "Sora",
  "ElevenLabs",
  "Adobe Firefly",
  "Figma AI",
  "Lovable",
  "v0",
  "Other",
] as const;

export const AI_EXPERIENCE_LEVELS = [
  {
    value: "Curious",
    label: "Curious",
    ar: "أستكشف",
    desc: "أجرّب الأدوات وأتعلم منها.",
  },
  {
    value: "User",
    label: "Regular user",
    ar: "أستخدمها بانتظام",
    desc: "جزء من يومي لكن ليس من كل عمل.",
  },
  {
    value: "Power user",
    label: "Power user",
    ar: "أستخدمها بعمق",
    desc: "أعرف حدودها وأين تفشل.",
  },
  {
    value: "Integrator",
    label: "Integrator",
    ar: "أدخلها في الأنظمة",
    desc: "أبني بها Workflows وأتمتة لعمل الفرق.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* STEP 07 — COLLABORATION                                             */
/* ------------------------------------------------------------------ */

export const COLLABORATION_TYPES = [
  { value: "Project-based", ar: "مشروع كامل", desc: "مشروع بنطاق ومخرجات محددة." },
  { value: "Fixed Scope", ar: "نطاق ثابت", desc: "تسليم محدد بسعر محدد." },
  { value: "Milestone-based", ar: "مراحل", desc: "الدفع والتسليم على مراحل." },
  { value: "Hourly", ar: "بالساعة", desc: "ساعات عمل متفق عليها." },
  { value: "Long-term collaboration", ar: "تعاون طويل المدى", desc: "شراكة مستمرة مع مُريح." },
  { value: "Flexible", ar: "مرن", desc: "حسب طبيعة الفرصة." },
] as const;

export const PREFERRED_PROJECT_TYPES = [
  "منتجات رقمية (Web / Mobile)",
  "منصات وSaaS",
  "هوية وعلامة تجارية",
  "حملات ومحتوى",
  "فيديو وإنتاج بصري",
  "أتمتة وذكاء اصطناعي",
  "متاجر إلكترونية",
  "تحليل ونمو (Marketing / SEO)",
  "إدارة مشاريع ومتابعة تنفيذ",
  "تجارب قصيرة (Sprints)",
  "أخرى",
] as const;

/* ------------------------------------------------------------------ */
/* STEP 08 — AVAILABILITY                                              */
/* ------------------------------------------------------------------ */

export const START_AVAILABILITY = [
  { value: "Immediately", ar: "فورًا" },
  { value: "Within a week", ar: "خلال أسبوع" },
  { value: "Within a month", ar: "خلال شهر" },
  { value: "Flexible", ar: "مرن" },
] as const;

export const WEEKLY_CAPACITY = [
  { value: "أقل من 5 ساعات", ar: "أقل من 5 ساعات" },
  { value: "5–10 ساعات", ar: "5–10 ساعات" },
  { value: "10–20 ساعة", ar: "10–20 ساعة" },
  { value: "20–30 ساعة", ar: "20–30 ساعة" },
  { value: "30+ ساعة", ar: "30+ ساعة" },
] as const;

/* ------------------------------------------------------------------ */
/* STEP 09 — PRICING                                                   */
/* ------------------------------------------------------------------ */

export const PRICING_MODELS = [
  { value: "Fixed Project", ar: "سعر ثابت للمشروع" },
  { value: "Hourly", ar: "بالساعة" },
  { value: "Milestone", ar: "على مراحل" },
  { value: "Depends on Scope", ar: "يعتمد على نطاق العمل" },
] as const;

export const CURRENCIES = ["USD", "EUR", "AED", "SAR", "EGP", "JOD", "ILS", "أخرى"] as const;

export const PRICING_NOTE =
  "هذا الرقم استرشادي لفهم طبيعة التعاون فقط، ولا يمثل عرضًا تعاقديًا أو سعرًا نهائيًا.";

/* ------------------------------------------------------------------ */
/* STEP 11 — AGREEMENT                                                 */
/* ------------------------------------------------------------------ */

export const AGREEMENT_ITEMS = [
  {
    name: "understood_project_based_model",
    text: "أفهم أن تقديم هذا الطلب لا يعني التوظيف.",
  },
  {
    name: "project_services_model",
    text: "أفهم أن التعاون مع مُريح يتم حسب المشاريع والخدمات المتاحة.",
  },
  {
    name: "compensation_is_service_based",
    text: "أفهم أن المقابل المالي يكون مقابل الخدمات أو المشاريع المتفق عليها.",
  },
  {
    name: "no_guaranteed_work",
    text: "أفهم أنه لا يوجد ضمان بالحصول على مشروع بعد تقديم الطلب.",
  },
  {
    name: "agreed_to_contact",
    text: "أوافق أن يتواصل معي فريق مُريح عندما توجد فرصة مناسبة لخبرتي.",
  },
  {
    name: "privacy_consent",
    text: "أوافق على استخدام بياناتي لغرض مراجعة الطلب والتواصل بشأن فرص التعاون.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* APPLY — RAIL & HERO COPY (شاشة التقديم المقسّمة)                     */
/* ------------------------------------------------------------------ */

export const APPLY_RAIL = {
  eyebrow: "Mureeh Talent Network",
  title: "ليس طلب توظيف — طلب انضمام إلى الشبكة.",
  blurb:
    "نتعرف على مهاراتك وأعمالك وطريقة تفكيرك. وعندما يأتي مشروع يتقاطع مع ما تقدّمه، نتواصل معك ونتفق على كل شيء بشكل منفصل.",
  proof: [
    {
      t: "نقرأ طريقة تفكيرك",
      d: "12 سؤالًا — أجب على 4 منها على الأقل. لا إجابة صحيحة واحدة.",
    },
    {
      t: "مراجعة بشرية 100%",
      d: "لا فرز آلي بالكلمات المفتاحية، ولا score للقبول.",
    },
    {
      t: "ملفك يبقى في الشبكة",
      d: "يُحفظ في قاعدة بيانات مُريح ويُستدعى عند ظهور فرصة مناسبة.",
    },
  ],
  transparency: "لا عقد عمل، ولا راتب ثابت، ولا ضمان مشاريع — المقابل مقابل الخدمة المنفّذة.",
} as const;

export const APPLY_FACTS = [
  { t: "6 فصول · ~10 دقائق", d: "توقف وعد وقتما شئت — مسودتك تُحفظ على جهازك." },
  { t: "بدون CV", d: "يكفي رابط حقيقي واحد أو وصف دقيق لمشروع نفّذته." },
  { t: "شفافية كاملة", d: "نموذج التعاون مكتوب أمامك قبل الإرسال — بلا لغة قانونية." },
] as const;

/* ------------------------------------------------------------------ */
/* SUCCESS EXPERIENCE                                                  */
/* ------------------------------------------------------------------ */

export const SUCCESS_COPY = {
  title: "وصلنا.",
  line1: "شكرًا لأنك شاركتنا طريقة عملك، وليس فقط قائمة مهاراتك.",
  line2:
    "سنراجع ملفك بناءً على خبرتك، أعمالك، مجالاتك، وطريقة تفكيرك. وعندما يظهر مشروع يتقاطع مع ما تستطيع تقديمه، قد يتواصل معك فريق مُريح.",
  thanks: "شكرًا لك على وقتك — ما كتبته هنا هو ما نقرأه فعلًا.",
  followTitle: "تابع صفحات مُريح",
  followBody:
    "المشاريع والفرص الجديدة تُنشر على صفحاتنا قبل أي مكان آخر. تابعنا لتبقى قريبًا منها.",
  followNote: "لا نرسل إزعاجًا — المتابعة تعني أنك ترى ما يناسبك متى ظهر.",
  cta: "العودة إلى مُريح",
};

/* ------------------------------------------------------------------ */
/* صفحات مُريح — تُقرأ من البيئة حتى يستطيع الفريق تغييرها بلا كود      */
/* ------------------------------------------------------------------ */

export type SocialLink = {
  key: "instagram" | "whatsapp";
  label: string;
  handle: string;
  note: string;
  href: string;
};

/**
 * روابط المتابعة على شاشة النجاح.
 * تُضبط عبر:
 *   NEXT_PUBLIC_MUREEH_INSTAGRAM_URL
 *   NEXT_PUBLIC_MUREEH_WHATSAPP_URL
 * وإن لم تُضبط، تُخفى الكتلة بالكامل (لا نعرض روابط مكسورة أبدًا).
 */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    key: "instagram",
    label: "إنستقرام",
    handle: "@mureeh",
    note: "مشاريع وكواليس وفرص تظهر هنا أولًا",
    href: (process.env.NEXT_PUBLIC_MUREEH_INSTAGRAM_URL ?? "").trim(),
  },
  {
    key: "whatsapp",
    label: "واتساب",
    handle: "محادثة مباشرة",
    note: "لتحديث بياناتك أو سؤال سريع",
    href: (process.env.NEXT_PUBLIC_MUREEH_WHATSAPP_URL ?? "").trim(),
  },
];

export const visibleSocialLinks = SOCIAL_LINKS.filter((link) => link.href.length > 0);

/* ------------------------------------------------------------------ */
/* رسائل الفشل — السبب + مكان السؤال، لا «حاول مرة أخرى» مبهمة          */
/* ------------------------------------------------------------------ */

export const SUBMIT_ERROR_COPY = {
  title: "لم يُرسل الطلب",
  fallback: "تعذّر إرسال الطلب. أعد المحاولة بعد قليل.",
  network: "تعذّر الوصول إلى الشبكة. تأكد من الاتصال ثم أعد المحاولة.",
  incomplete: "الطلب غير مكتمل بعد — بقيت حقول تحتاج تعديلًا في فصول سابقة.",
  stepBlocked: "راجع الحقول المعلّمة في هذا الفصل قبل المتابعة.",
  reason: "السبب",
  location: "الموقع",
  alsoNeeds: "يحتاج تعديلًا أيضًا",
  jump: "خذني إلى مكان السؤال",
  dataSafe: "بياناتك باقية في الصفحة ومحفوظة على جهازك — لن تفقد شيئًا.",
};

/**
 * تسميات الحقول بلغة المستخدم — تُستخدم في رسائل الخطأ لتوجيهه إلى المكان،
 * بدل إظهار اسم العمود (مثل problem_framing_answer).
 */
export const FIELD_LABELS: Record<string, string> = {
  // 01 — الهوية والمجالات
  full_name: "الاسم الكامل",
  preferred_name: "الاسم الذي تفضّله",
  email: "البريد الإلكتروني",
  phone: "رقم التواصل",
  country: "الدولة",
  city: "المدينة",
  services: "الخدمات التي تقدّمها فعلًا",
  primary_specialty: "التخصص الأساسي",

  // 02 — الخبرة
  experience_level: "وصف مستواك",
  years_experience: "سنوات الخبرة",
  project_types_worked_on: "أنواع المشاريع التي عملت عليها",
  portfolio_url: "رابط الأعمال",
  linkedin_url: "رابط LinkedIn",
  github_url: "رابط GitHub",
  website_url: "الموقع الشخصي",

  // 04 — العمل
  project_1: "المشروع الأول",
  project_1_problem: "المشروع الأول — المشكلة",
  project_1_role: "المشروع الأول — دورك",
  project_1_tools: "المشروع الأول — الأدوات",
  project_1_result: "المشروع الأول — النتيجة",
  project_2: "المشروع الثاني",
  project_2_problem: "المشروع الثاني — المشكلة",
  project_2_role: "المشروع الثاني — دورك",
  project_2_tools: "المشروع الثاني — الأدوات",
  project_2_result: "المشروع الثاني — النتيجة",
  project_3: "المشروع الثالث",
  project_3_problem: "المشروع الثالث — المشكلة",
  project_3_role: "المشروع الثالث — دورك",
  project_3_tools: "المشروع الثالث — الأدوات",
  project_3_result: "المشروع الثالث — النتيجة",

  // 05 — التوافق
  ai_tools: "أدوات AI التي تستخدمها",
  ai_experience: "مستوى استخدام AI",
  ai_workflow: "كيف يدخل AI في عملك",
  ai_boundaries: "ما ترفض أن يقرره AI عنك",
  collaboration_type: "طريقة التعاون",
  preferred_project_types: "أنواع المشاريع المفضّلة",
  availability: "التوفر للبدء",
  weekly_capacity: "السعة الأسبوعية",
  pricing_model: "نموذج التسعير",
  expected_project_range: "النطاق السعري المتوقع",
  currency: "العملة",

  // 06 — الإرسال
  why_mureeh_answer: "لماذا مُريح؟",
  understood_project_based_model: "إقرار: الطلب لا يعني التوظيف",
  project_services_model: "إقرار: التعاون حسب المشاريع والخدمات",
  compensation_is_service_based: "إقرار: المقابل مقابل الخدمة",
  no_guaranteed_work: "إقرار: لا ضمان لمشروع",
  agreed_to_contact: "إقرار: الموافقة على التواصل",
  privacy_consent: "إقرار: استخدام البيانات للمراجعة",
};
