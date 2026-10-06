/**
 * توجيه المستخدم إلى مكان الخطأ — لا رسالة «حاول مرة أخرى» بلا عنوان.
 *
 * الفكرة: كل حقل في النموذج له «مكان» يُذكر للمستخدم بالعربية:
 *   الفصل 03 · التفكير — سؤال «المشكلة قبل الحل»
 * وبضغطة واحدة ننتقل إليه ونفتح بطاقته ونضع المؤشر داخل الحقل.
 */

import { STEP_IDS, fieldsForStep, type StepId } from "./schema";
import { AGREEMENT_ITEMS, FIELD_LABELS, THINKING_QUESTIONS } from "./content";
import { STEP_META } from "@/components/form/steps";

/** الحدث الذي تلتقطه بطاقات التفكير لتفتح السؤال المطلوب من خارج الفصل */
export const REVEAL_FIELD_EVENT = "mureeh:reveal-field";

export type FieldLocation = {
  field: string;
  stepIndex: number;
  stepId: StepId;
  /** مثال: «الفصل 03 · التفكير» */
  chapter: string;
  /** مثال: «سؤال: المشكلة قبل الحل» أو «البريد الإلكتروني» */
  fieldLabel: string;
  /** رقم السؤال داخل أسئلة التفكير (إن كان الحقل سؤال تفكير) */
  questionNumber: number | null;
};

/** هل هذا الحقل أحد أسئلة التفكير الاثني عشر؟ */
export function thinkingQuestionOf(field: string) {
  const index = THINKING_QUESTIONS.findIndex((q) => q.column === field);
  return index >= 0 ? { index, question: THINKING_QUESTIONS[index] } : null;
}

/** تسمية الحقل بلغة المستخدم — لا باسم العمود */
export function fieldLabel(field: string): string {
  const q = thinkingQuestionOf(field);
  if (q) return `سؤال ${String(q.index + 1).padStart(2, "0")} «${q.question.title}»`;
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];

  const agreement = AGREEMENT_ITEMS.find((item) => item.name === field);
  if (agreement) return agreement.text;

  return field;
}

/** أين يقع هذا الحقل؟ (أي فصل، وبأي تسمية) */
export function locateField(field: string): FieldLocation | null {
  const stepIndex = STEP_IDS.findIndex((id) => fieldsForStep(id).includes(field));
  if (stepIndex < 0) return null;

  const stepId = STEP_IDS[stepIndex];
  const q = thinkingQuestionOf(field);

  return {
    field,
    stepIndex,
    stepId,
    chapter: STEP_META[stepId].eyebrow,
    fieldLabel: fieldLabel(field),
    questionNumber: q ? q.index + 1 : null,
  };
}

/** عنصر الحقل في DOM (الحقل نفسه، أو بطاقة السؤال إن كانت مغلقة) */
function fieldElement(field: string): HTMLElement | null {
  return (
    document.getElementById(`f-${field}`) ??
    document.getElementById(`think-tile-${field}`) ??
    null
  );
}

/**
 * افتح مكان الحقل: بلّغ الفصل (بطاقات التفكير تفتح السؤال)،
 * ثم مرّر إليه وركّز المؤشر داخله.
 *
 * نعيد المحاولة مرتين لأن بطاقة السؤال المغلقة لا تُركّب حقولها إلا بعد انتهاء
 * حركة الفتح (~300ms)، ولأن انتقال الفصل يعيد تركيب الشجرة.
 */
export function revealField(
  field: string,
  { smooth = true, delay = 0 }: { smooth?: boolean; delay?: number } = {},
) {
  if (typeof window === "undefined") return;

  const behavior: ScrollBehavior = smooth ? "smooth" : "auto";
  window.dispatchEvent(new CustomEvent(REVEAL_FIELD_EVENT, { detail: { field } }));

  const attempts = [delay + 40, delay + 200, delay + 420];

  attempts.forEach((attempt, index) => {
    window.setTimeout(() => {
      /* نبثّ الحدث مرة أخرى في المحاولة الأخيرة: قد يكون الفصل (وبطاقة السؤال)
         قد تركّب بعد البثّ الأول، فلا يسمعه أحد */
      if (index > 0) {
        window.dispatchEvent(new CustomEvent(REVEAL_FIELD_EVENT, { detail: { field } }));
      }

      const el = fieldElement(field);
      if (!el) return;
      el.scrollIntoView({ behavior, block: "center" });

      // نركّز فقط في المحاولة الأخيرة حتى لا نخطف التركيز أثناء حركة الفتح
      if (index === attempts.length - 1) {
        const focusable =
          el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
            ? el
            : el.querySelector<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
        focusable?.focus({ preventScroll: true });
      }
    }, attempt);
  });
}
