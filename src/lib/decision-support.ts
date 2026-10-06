/**
 * Decision Support Engine — محرّك قراءة الملفات.
 * ---------------------------------------------------------------
 * ما يفعله: يستخرج إشارات (Signals) وثيمات تفكير (Thinking Themes) من إجابات
 * المتقدّم، ويقترح نوع المشاريع التي قد تناسبه، مع نقاط تحتاج سؤالًا في المقابلة.
 *
 * ما لا يفعله: لا يقبل، ولا يرفض، ولا يرتّب المتقدمين. لا يوجد Score للقبول.
 * القرار النهائي بشري دائمًا — وهذا مكتوب في كل مخرجات المحرّك.
 *
 * الطبقتان:
 *  1) طبقة حتمية (Deterministic): تعمل دائمًا، بلا أي API خارجي، وقابلة للتفسير:
 *     كل إشارة مربوطة بنص من إجاباته (evidence).
 *  2) طبقة اختيارية (LLM): إن ضُبط DECISION_SUPPORT_API_KEY، تُضاف خلاصة نصية.
 *     فشلها لا يُسقط شيئًا — تُتجاهل بهدوء.
 */

import type { TalentValues } from "./schema";
import { SPECIALTY_GROUPS, THINKING_QUESTIONS } from "./content";
import { hasAnyDigit, toAsciiDigits } from "./utils";

/* ------------------------------ Types ------------------------------ */

export type SignalType = "strength" | "watch" | "flag";

export type ThinkingTheme = {
  key: string;
  label: string;
  hits: number;
  confidence: number; // 0..1
  evidence: string; // مقتطف من إجابته
  from: string; // عنوان السؤال الذي ظهر فيه
};

export type Signal = {
  type: SignalType;
  label: string;
  detail: string;
};

export type DecisionSupport = {
  generated_at: string;
  engine: "mureeh-signals/v1" | "mureeh-signals/v1+llm";
  disclaimer: string;
  human_review_required: true;
  profile: {
    primary_specialty: string;
    secondary_specialties: string[];
    groups: string[];
    domains: string[];
    experience_level: string;
    years_experience: string;
    environments: string[];
  };
  tools: {
    ai_tools: string[];
    project_tools: string[];
    tools_coverage: "narrow" | "balanced" | "broad";
  };
  availability: {
    start: string;
    weekly_capacity: string;
    estimated_weekly_hours: number | null;
  };
  pricing: {
    model: string;
    range_raw: string;
    currency: string;
    parsed_min: number | null;
    parsed_max: number | null;
  };
  completeness: {
    score: number; // 0..100 (اكتمال الوصف، لا جودة الشخص)
    portfolio_projects: number;
    links: number;
    avg_answer_ratio: number; // متوسط طول الإجابات المُجابة ÷ الحد الأدنى المطلوب
    thin_answers: string[]; // أسئلة إجاباتها قريبة من الحد الأدنى
    answered_questions: number; // عدد أسئلة التفكير المُجابة (الحصة 4 من 12)
    total_questions: number; // 12
  };
  thinking_themes: ThinkingTheme[];
  signals: Signal[];
  fit: {
    project_types: string[];
    collaboration_types: string[];
    notes: string[];
  };
  suggested_interview_questions: string[];
  llm_summary: string | null;
};

/* --------------------------- Theme lexicon -------------------------- */

const THEMES: {
  key: string;
  label: string;
  keywords: string[];
  /** الثيمة تُظهر فقط عند بلوغ هذا العدد من الإشارات */
  threshold: number;
}[] = [
  {
    key: "problem_first",
    label: "يبدأ من المشكلة قبل الحل",
    keywords: ["المشكلة", "جذر", "سبب", "لماذا", "سياق", "إعادة تعريف", "الهدف الحقيقي", "الاحتياج"],
    threshold: 4,
  },
  {
    key: "measurement",
    label: "يفكّر بالقياس والنتيجة",
    keywords: ["قياس", "مؤشر", "نتيجة", "نسبة", "رقم", "تحسّن", "تحسن", "أثر", "معيار النجاح", "%"],
    threshold: 3,
  },
  {
    key: "user_empathy",
    label: "يبدأ من المستخدم",
    keywords: ["المستخدم", "التجربة", "العميل", "احتياج", "يفهم", "رحلة", "سهولة"],
    threshold: 3,
  },
  {
    key: "systems_thinking",
    label: "يفكّر بنظام وتدفّق",
    keywords: ["نظام", "تدفّق", "أتمتة", "workflow", "خطوات", "تكامل", "عملية", "مراحل"],
    threshold: 3,
  },
  {
    key: "craft_quality",
    label: "يهتم بالجودة والتفاصيل",
    keywords: ["جودة", "تفاصيل", "مراجعة", "اختبار", "معيار", "دقّة", "دقة", "أساس"],
    threshold: 3,
  },
  {
    key: "ownership",
    label: "يتحمّل المسؤولية حتى النهاية",
    keywords: ["مسؤولية", "أتحمّل", "اتحمّل", "أتابع", "أتابع", "حتى النهاية", "أفترض", "أضمن"],
    threshold: 3,
  },
  {
    key: "learning_loop",
    label: "يتعلّم من التجربة ويغيّر رأيه",
    keywords: ["تعلّمت", "تعلمت", "اختبرت", "جرّبت", "جربت", "دليل", "أخطاء", "غيّرت", "غيرت رأيي"],
    threshold: 3,
  },
  {
    key: "ai_leverage",
    label: "يوظّف AI كأداة لا كبديل",
    keywords: ["ai", "أتمتة", "prompt", "برومبت", "تسريع", "أدوات", "مولّد", "مولد"],
    threshold: 3,
  },
  {
    key: "client_communication",
    label: "يتواصل ويوضّح قبل التنفيذ",
    keywords: ["أوضّح", "أشرح", "أتفق", "أشارك", "أسأل", "العميل", "تواصل", "أتأكد"],
    threshold: 3,
  },
  {
    key: "risk_awareness",
    label: "يُدير المخاطر والافتراضات",
    keywords: ["مخاطر", "افتراض", "بديل", "احتياطي", "نسخة", "خطة ب", "حدود", "قيود"],
    threshold: 3,
  },
  {
    key: "scope_discipline",
    label: "يضبط النطاق ويرفض التمدّد",
    keywords: ["نطاق", "زيادة الطلبات", "خارج الاتفاق", "أرفض", "حدود واضحة", "scope"],
    threshold: 2,
  },
];

const BUZZWORDS = ["خبير", "محترف جدًا", "الأفضل", "متميز جدًا", "أنجز أي شيء", "بدون مشاكل"];

/* ------------------------------ Helpers ----------------------------- */

const norm = (s: string) => s.toLowerCase().replace(/[إأآا]/g, "ا").replace(/ى/g, "ي").replace(/\s+/g, " ");

// تحويل الأرقام العربية-الهندية يتم في utils.ts (مشترك مع التحقق والواجهة)

const allAnswerTexts = (v: TalentValues): { title: string; text: string }[] =>
  THINKING_QUESTIONS.map((q) => ({
    title: q.title,
    text: String((v as unknown as Record<string, string>)[q.column] ?? ""),
  }));

const capacityHours: Record<string, number | null> = {
  "أقل من 5 ساعات": 3,
  "5–10 ساعات": 8,
  "10–20 ساعة": 15,
  "20–30 ساعة": 25,
  "30+ ساعة": 35,
};

function parseRange(raw: string): { parsed_min: number | null; parsed_max: number | null } {
  const numbers = toAsciiDigits(raw).match(/\d[\d,.\s]*\d|\d/g);
  if (!numbers) return { parsed_min: null, parsed_max: null };
  const cleaned = numbers
    .map((n) => Number(n.replace(/[,\s]/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (cleaned.length === 0) return { parsed_min: null, parsed_max: null };
  return { parsed_min: Math.min(...cleaned), parsed_max: Math.max(...cleaned) };
}

function excerpt(text: string, keyword: string, span = 90): string {
  const idx = norm(text).indexOf(norm(keyword));
  if (idx < 0) return text.slice(0, span).trim() + "…";
  const start = Math.max(0, idx - Math.floor(span / 3));
  return (start > 0 ? "…" : "") + text.slice(start, start + span).trim() + "…";
}

/* --------------------------- Main function -------------------------- */

export function buildDecisionSupport(values: TalentValues, now = new Date()): DecisionSupport {
  const answers = allAnswerTexts(values);
  const corpus = norm(answers.map((a) => a.text).join(" \n "));

  /* -------- التفكير: ثيمات -------- */
  const thinking_themes: ThinkingTheme[] = THEMES.map((theme) => {
    let hits = 0;
    let evidenceSource = { title: answers[0]?.title ?? "", text: "" };
    let evidenceKeyword = theme.keywords[0];

    for (const answer of answers) {
      const haystack = norm(answer.text);
      const localHits = theme.keywords.reduce(
        (sum, kw) => sum + (haystack.split(norm(kw)).length - 1),
        0,
      );
      if (localHits > 0 && answer.text.length > evidenceSource.text.length) {
        evidenceSource = answer;
      }
      hits += localHits;
    }

    const found = theme.keywords.find((kw) => corpus.includes(norm(kw)));
    if (found) evidenceKeyword = found;

    return {
      key: theme.key,
      label: theme.label,
      hits,
      confidence: Math.max(0, Math.min(1, Number((hits / (theme.threshold * 2)).toFixed(2)))),
      evidence: evidenceSource.text
        ? excerpt(evidenceSource.text, evidenceKeyword)
        : "لا يوجد نص كافٍ",
      from: evidenceSource.title,
    };
  })
    .filter((t) => t.hits >= THEMES.find((x) => x.key === t.key)!.threshold)
    .sort((a, b) => b.confidence - a.confidence);

  /* -------- الأدوات -------- */
  const projectTools = [1, 2, 3]
    .map((n) => String((values as unknown as Record<string, string>)[`project_${n}_tools`] ?? ""))
    .join(" · ")
    .split(/[·,،|]/)
    .map((t) => t.trim())
    .filter(Boolean);

  const uniqueProjectTools = Array.from(new Set(projectTools));
  const aiTools = values.ai_tools ?? [];

  const tools_coverage: DecisionSupport["tools"]["tools_coverage"] =
    aiTools.length + uniqueProjectTools.length <= 3
      ? "narrow"
      : aiTools.length + uniqueProjectTools.length >= 9
        ? "broad"
        : "balanced";

  /* -------- الاكتمال -------- */
  // أسئلة التفكير اختيارية منذ v2 (حصة 4 من 12) — لذا يُحسب المتوسط على المُجاب فقط،
  // ويُذكر عدد المُجاب صراحةً حتى لا تُقرأ التغطية المختارة كأنها ضعف في الملف.
  const ratios = THINKING_QUESTIONS.map((q) => {
    const text = String((values as unknown as Record<string, string>)[q.column] ?? "");
    return { title: q.title, ratio: text.trim().length / q.minLength, length: text.trim().length };
  });
  const answeredRatios = ratios.filter((r) => r.length > 0);
  const answeredCount = answeredRatios.length;

  const avgAnswerRatio = answeredCount
    ? answeredRatios.reduce((sum, r) => sum + r.ratio, 0) / answeredCount
    : 0;
  const thinAnswers = answeredRatios.filter((r) => r.ratio < 1.25).map((r) => r.title);

  const projects = [1, 2, 3].filter(
    (n) => String((values as unknown as Record<string, string>)[`project_${n}`] ?? "").trim().length > 0,
  );
  const links = [
    values.portfolio_url,
    values.linkedin_url,
    values.github_url,
    values.website_url,
  ].filter((l) => l && l.trim().length > 0).length;

  const hasNumbersInResults = projects.some((n) =>
    hasAnyDigit(String((values as unknown as Record<string, string>)[`project_${n}_result`] ?? "")),
  );

  // 20 نقطة لتغطية أسئلة التفكير (من 6 إجابات فأكثر) + 35 لعمق الإجابات المُجابة
  const completenessScore = Math.round(
    Math.min(1, answeredCount / 6) * 20 +
      Math.min(1, avgAnswerRatio / 2) * 35 +
      Math.min(1, projects.length / 2) * 20 +
      Math.min(1, links / 2) * 10 +
      (hasNumbersInResults ? 10 : 0) +
      (uniqueProjectTools.length >= 3 ? 5 : 0),
  );

  /* -------- الإشارات -------- */
  const signals: Signal[] = [];

  if (thinking_themes.length >= 4) {
    signals.push({
      type: "strength",
      label: "إجابات متسقة الطابع",
      detail: `ظهرت ${thinking_themes.length} ثيمات تفكير واضحة — يمكن قراءة طريقة عمله من نصوصه.`,
    });
  }
  if (thinking_themes[0]?.key === "measurement" || hasNumbersInResults) {
    signals.push({
      type: "strength",
      label: "يتحدث بلغة النتيجة",
      detail: hasNumbersInResults
        ? "ذكر أرقامًا أو مؤشرات في نتائج مشاريعه."
        : "لغة إجاباته مرتبطة بالقياس والنتيجة.",
    });
  }
  if ((values.ai_boundaries ?? "").trim().length >= 80) {
    signals.push({
      type: "strength",
      label: "حدود واضحة مع AI",
      detail: "شرح بوضوح ما يرفض أن يقرره AI نيابة عنه — مؤشر نضج في العمل بالأدوات.",
    });
  }
  if (thinking_themes.some((t) => t.key === "ownership")) {
    signals.push({
      type: "strength",
      label: "ملكية العمل (Ownership)",
      detail: "يتحدث عن مسؤوليته الشخصية في النتيجة، لا عن المهمة فقط.",
    });
  }

  if (thinAnswers.length >= 3) {
    signals.push({
      type: "watch",
      label: "إجابات قريبة من الحد الأدنى",
      detail: `${thinAnswers.length} أسئلة بإجابات قصيرة نسبيًا (${thinAnswers.slice(0, 3).join(" · ")}…) — تحتاج أسئلة متابعة في التواصل.`,
    });
  }
  if (answeredCount < THINKING_QUESTIONS.length) {
    signals.push({
      type: answeredCount >= 6 ? "watch" : "flag",
      label: "تغطية تفكير مختارة",
      detail: `أجاب على ${answeredCount} من ${THINKING_QUESTIONS.length} سؤالًا (النموذج يسمح باختيار 4 على الأقل) — الثيمات أدناه مبنية على المُجاب فقط، ويمكن تعميقها في التواصل الأول.`,
    });
  }
  if (!hasNumbersInResults) {
    signals.push({
      type: "watch",
      label: "نتائج بلا مؤشر قياس",
      detail: "لم تُذكر أرقام أو مؤشرات في نتائج المشاريع — اسأله: كيف قِست النجاح؟",
    });
  }
  if (uniqueProjectTools.length < 3) {
    signals.push({
      type: "watch",
      label: "أدوات المشاريع قليلة الوصف",
      detail: "الأدوات المذكورة في المشاريع محدودة — قد يكون الوصف مختصرًا لا الخبرة ناقصة.",
    });
  }
  if (links === 0) {
    signals.push({
      type: "watch",
      label: "لا توجد روابط أعمال",
      detail: "لم يُضف أي رابط (Portfolio / LinkedIn / GitHub) — التحقق البصري سيكون عبر التواصل.",
    });
  }
  if (values.availability === "Immediately" && (capacityHours[values.weekly_capacity] ?? 0) <= 3) {
    signals.push({
      type: "watch",
      label: "تعارض محتمل بين البدء والسعة",
      detail: "يستطيع البدء فورًا لكن بسعة أسبوعية محدودة جدًا — وضّحا التوقعات قبل الاتفاق.",
    });
  }

  if (BUZZWORDS.some((word) => corpus.includes(norm(word)))) {
    signals.push({
      type: "flag",
      label: "مفردات تقييم ذاتي بلا دليل",
      detail: "ظهرت عبارات مثل «خبير» أو «بدون مشاكل» — طابقها مع أعمال فعلية قبل الاعتماد عليها.",
    });
  }
  if (values.experience_level === "Professional" && projects.length < 2) {
    signals.push({
      type: "flag",
      label: "مستوى مرتفع بأعمال قليلة",
      detail: "وصف نفسه بـ Professional لكن المشاريع المذكورة أقل من اثنين — يستحق توضيحًا.",
    });
  }
  if ((values.why_mureeh_answer ?? "").trim().length < 140) {
    signals.push({
      type: "flag",
      label: "«لماذا مُريح؟» بإجابة مختصرة",
      detail: "الجزء الخاص بما سيضيفه لمُريح مقتضب — اسأله مباشرة في أول تواصل.",
    });
  }

  /* -------- الملاءمة -------- */
  const groups = SPECIALTY_GROUPS.filter((g) =>
    [values.primary_specialty, ...(values.services ?? [])].some((s) => g.items.includes(s)),
  ).map((g) => g.label);

  const fitProjectTypes: string[] = [];
  const notes: string[] = [];

  if (groups.includes("Software")) fitProjectTypes.push("منتجات رقمية (Web / Mobile)", "منصات وSaaS");
  if (groups.includes("Design")) fitProjectTypes.push("هوية وعلامة تجارية");
  if (groups.includes("Content")) fitProjectTypes.push("حملات ومحتوى", "فيديو وإنتاج بصري");
  if (groups.includes("AI")) fitProjectTypes.push("أتمتة وذكاء اصطناعي");
  if (groups.includes("Business")) fitProjectTypes.push("تحليل ونمو (Marketing / SEO)");
  if (capacityHours[values.weekly_capacity] !== null && (capacityHours[values.weekly_capacity] ?? 0) >= 15) {
    fitProjectTypes.push("إدارة مشاريع ومتابعة تنفيذ");
  }

  const fit = Array.from(new Set([...fitProjectTypes, ...(values.preferred_project_types ?? [])]));

  const capacity = capacityHours[values.weekly_capacity] ?? null;
  if (capacity !== null && capacity <= 8) {
    notes.push("السعة الأسبوعية مناسبة لمهام مركّزة أو مراحل محددة، لا لمشروع كامل متوازٍ.");
  }
  if (capacity !== null && capacity >= 25) {
    notes.push("السعة الأسبوعية تسمح بمشروع كامل أو تعاون طويل المدى.");
  }
  if (values.collaboration_type === "Hourly" && (groups.includes("Design") || groups.includes("Content"))) {
    notes.push("يفضّل التسعير بالساعة — ضع سقفًا واضحًا للمراجعات قبل البدء.");
  }
  if (values.collaboration_type === "Long-term collaboration") {
    notes.push("يبحث عن تعاون طويل المدى — مناسب لتوزيع أجزاء متكررة من مشاريع العملاء.");
  }

  /* -------- أسئلة مقترحة للتواصل الأول -------- */
  const suggested = new Set<string>();
  if (thinAnswers[0]) suggested.add(`«${thinAnswers[0]}» — اطلب مثالًا ملموسًا من مشروع سابق.`);
  if (!hasNumbersInResults) suggested.add("كيف قِست نجاح آخر مشروع؟ وما الرقم الذي تغيّر؟");
  if (signals.some((s) => s.label.includes("AI")) || (values.ai_boundaries ?? "").length > 0) {
    suggested.add("أين يتوقف دور AI في عملك، ومتى ترفض نتيجة جاهزة؟");
  }
  if (fit.length > 0) suggested.add(`أي جزء من «${fit[0]}» تريد أن تتخصص فيه معنا؟`);
  if (values.availability === "Within a month") suggested.add("ما الذي يحتاج شهرًا قبل البدء؟");
  suggested.add("ما آخر قرار غيّرته في مشروع بعد أن اكتشفت أنك مخطئ؟");

  return {
    generated_at: now.toISOString(),
    engine: "mureeh-signals/v1",
    disclaimer:
      "دعم قرار فقط (Decision Support). لا يوجد هنا قبول أو رفض أو ترتيب — القرار النهائي بشري.",
    human_review_required: true,
    profile: {
      primary_specialty: values.primary_specialty,
      secondary_specialties: (values.services ?? []).filter((s) => s !== values.primary_specialty),
      groups,
      domains: values.project_types_worked_on ?? [],
      experience_level: values.experience_level,
      years_experience: values.years_experience,
      environments: values.project_types_worked_on ?? [],
    },
    tools: {
      ai_tools: aiTools,
      project_tools: uniqueProjectTools.slice(0, 12),
      tools_coverage,
    },
    availability: {
      start: values.availability,
      weekly_capacity: values.weekly_capacity,
      estimated_weekly_hours: capacity,
    },
    pricing: {
      model: values.pricing_model,
      range_raw: values.expected_project_range,
      currency: values.currency,
      ...parseRange(values.expected_project_range ?? ""),
    },
    completeness: {
      score: Math.max(0, Math.min(100, completenessScore)),
      portfolio_projects: projects.length,
      links,
      avg_answer_ratio: Number(avgAnswerRatio.toFixed(2)),
      thin_answers: thinAnswers,
      answered_questions: answeredCount,
      total_questions: THINKING_QUESTIONS.length,
    },
    thinking_themes,
    signals,
    fit: {
      project_types: fit,
      collaboration_types: [values.collaboration_type].filter(Boolean),
      notes,
    },
    suggested_interview_questions: Array.from(suggested).slice(0, 5),
    llm_summary: null,
  };
}

/* ------------------------- Optional LLM layer ------------------------ */

export const llmConfigured = () =>
  Boolean(process.env.DECISION_SUPPORT_API_KEY && process.env.DECISION_SUPPORT_MODEL);

/**
 * طبقة اختيارية: خلاصة نصية من نموذج لغوي (أي مزود متوافق مع OpenAI API).
 * وجودها لا يغيّر أي قرار — تُضاف كملاحظة للفريق فقط، وإن فشلت تُتجاهل.
 */
export async function enrichWithLlm(
  values: TalentValues,
  base: DecisionSupport,
): Promise<DecisionSupport> {
  if (!llmConfigured()) return base;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(
      `${process.env.DECISION_SUPPORT_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DECISION_SUPPORT_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.DECISION_SUPPORT_MODEL,
          temperature: 0.2,
          max_tokens: 400,
          messages: [
            {
              role: "system",
              content:
                "أنت مساعد لفريق مُريح. لخّص ملف متقدّم في 4 أسطر عربية: نقاط قوة موثّقة بالأعمال، وثيمات تفكيره، ونقطة تحتاج سؤالًا في التواصل. لا تقترح قبولًا أو رفضًا ولا تعطِ تقييمًا رقميًا. اكتب نصًا فقط.",
            },
            {
              role: "user",
              content: JSON.stringify({
                profile: base.profile,
                thinking_themes: base.thinking_themes.map((t) => t.label),
                signals: base.signals,
                answers: allAnswerTexts(values)
                  .filter((a) => a.text.trim().length > 0)
                  .map((a) => ({ q: a.title, a: a.text })),
              }),
            },
          ],
        }),
      },
    );

    if (!res.ok) throw new Error(`llm ${res.status}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const summary = data.choices?.[0]?.message?.content?.trim();
    if (!summary) throw new Error("empty");

    return { ...base, engine: "mureeh-signals/v1+llm", llm_summary: summary };
  } catch (error) {
    console.error("[mureeh] decision-support llm skipped:", error instanceof Error ? error.message : error);
    return base;
  } finally {
    clearTimeout(timeout);
  }
}

/** سطر مضغوط يُكتب في عمود ai_decision_support داخل Google Sheet */
export function toSheetCell(d: DecisionSupport): string {
  const themes = d.thinking_themes.map((t) => t.label).join(" · ") || "—";
  const strengths = d.signals.filter((s) => s.type === "strength").length;
  const watch = d.signals.filter((s) => s.type !== "strength").length;
  return [
    `themes: ${themes}`,
    `signals: +${strengths} / !${watch}`,
    `completeness: ${d.completeness.score}% (thinking ${d.completeness.answered_questions}/${d.completeness.total_questions})`,
    `fit: ${d.fit.project_types.slice(0, 3).join(" · ")}`,
    `review: human`,
  ].join(" | ");
}
