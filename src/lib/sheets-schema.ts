/**
 * Mureeh — Talent Applications : Google Sheets Schema
 * -----------------------------------------------------------
 * مصدر الحقيقة الواحد لأعمدة الورقة. ترتيب هذا المصفوفة = ترتيب الأعمدة (A..).
 * أي تعديل هنا ينعكس على: كتابة الصفوف، فحص التكرار، وملف الأعمدة الجاهز للّصق.
 *
 * ملاحظة: الأعمدة المعلَّمة بـ added = أعمدة أضفناها فوق قائمة الأعمدة الأساسية،
 * لأن النموذج يحتوي أسئلة أكثر من الأعمدة الأصلية (12 سؤال تفكير، 3 مشاريع × 5 أسئلة).
 * التفاصيل في docs/GOOGLE_SHEETS_SETUP.md
 */

import type { TalentFormValues } from "./schema";

export const SHEET_NAME = process.env.GOOGLE_SHEET_TAB || "Talent Applications";

export type ColumnGroup =
  | "System"
  | "Personal"
  | "Professional"
  | "Services"
  | "AI"
  | "Pricing"
  | "Thinking"
  | "Portfolio"
  | "Agreement"
  | "Team";

export type SheetColumn = {
  key: string;
  group: ColumnGroup;
  /** عمود مملوء آليًا */
  derived?: boolean;
  /** عمود لم نكن نعتزم إضافته (توثيق صريح) */
  added?: boolean;
  /** عمود يُملأ بشريًا داخل الفريق */
  teamOnly?: boolean;
};

export const SHEET_COLUMNS: SheetColumn[] = [
  // ---------------- System ----------------
  { key: "submission_id", group: "System", derived: true },
  { key: "submitted_at", group: "System", derived: true },
  { key: "application_status", group: "System", derived: true },
  { key: "source", group: "System", derived: true },
  { key: "last_updated", group: "System", derived: true },

  // ---------------- Personal ----------------
  { key: "full_name", group: "Personal" },
  { key: "preferred_name", group: "Personal" },
  { key: "email", group: "Personal" },
  { key: "phone", group: "Personal" },
  { key: "country", group: "Personal" },
  { key: "city", group: "Personal" },

  // ---------------- Professional ----------------
  { key: "primary_specialty", group: "Professional" },
  { key: "secondary_specialties", group: "Professional", derived: true },
  { key: "experience_level", group: "Professional" },
  { key: "years_experience", group: "Professional" },
  { key: "portfolio_url", group: "Professional" },
  { key: "linkedin_url", group: "Professional" },
  { key: "github_url", group: "Professional" },
  { key: "website_url", group: "Professional" },

  // ---------------- Services ----------------
  { key: "services", group: "Services" },
  { key: "project_types_worked_on", group: "Services", added: true },
  { key: "preferred_project_types", group: "Services" },
  { key: "collaboration_type", group: "Services" },
  { key: "availability", group: "Services" },
  { key: "weekly_capacity", group: "Services" },

  // ---------------- AI ----------------
  { key: "ai_tools", group: "AI" },
  { key: "ai_experience", group: "AI" },
  { key: "ai_workflow", group: "AI" },
  { key: "ai_boundaries", group: "AI", added: true },

  // ---------------- Pricing ----------------
  { key: "pricing_model", group: "Pricing" },
  { key: "expected_project_range", group: "Pricing" },
  { key: "currency", group: "Pricing" },

  // ---------------- Thinking ----------------
  { key: "problem_framing_answer", group: "Thinking" },
  { key: "pre_work_question_answer", group: "Thinking", added: true },
  { key: "brief_ambiguity_answer", group: "Thinking" },
  { key: "quality_vs_speed_answer", group: "Thinking" },
  { key: "tool_vs_outcome_answer", group: "Thinking", added: true },
  { key: "ai_philosophy_answer", group: "Thinking" },
  { key: "prompt_vs_understanding_answer", group: "Thinking", added: true },
  { key: "failure_definition_answer", group: "Thinking" },
  { key: "ownership_answer", group: "Thinking" },
  { key: "decision_making_answer", group: "Thinking" },
  { key: "changed_belief_answer", group: "Thinking" },
  { key: "value_answer", group: "Thinking" },
  { key: "why_mureeh_answer", group: "Thinking" },

  // ---------------- Portfolio ----------------
  { key: "project_1", group: "Portfolio" },
  { key: "project_1_problem", group: "Portfolio", added: true },
  { key: "project_1_role", group: "Portfolio" },
  { key: "project_1_tools", group: "Portfolio" },
  { key: "project_1_result", group: "Portfolio" },
  { key: "project_2", group: "Portfolio" },
  { key: "project_2_problem", group: "Portfolio", added: true },
  { key: "project_2_role", group: "Portfolio" },
  { key: "project_2_tools", group: "Portfolio" },
  { key: "project_2_result", group: "Portfolio" },
  { key: "project_3", group: "Portfolio" },
  { key: "project_3_problem", group: "Portfolio", added: true },
  { key: "project_3_role", group: "Portfolio" },
  { key: "project_3_tools", group: "Portfolio" },
  { key: "project_3_result", group: "Portfolio" },

  // ---------------- Agreement ----------------
  { key: "understood_project_based_model", group: "Agreement" },
  { key: "agreed_to_contact", group: "Agreement" },
  { key: "privacy_consent", group: "Agreement" },

  // ---------------- Team (بشري + Decision Support) ----------------
  { key: "reviewer_notes", group: "Team", teamOnly: true },
  { key: "ai_decision_support", group: "Team", teamOnly: true },
  { key: "record_json", group: "Team", derived: true },
];

export const COLUMN_KEYS = SHEET_COLUMNS.map((c) => c.key);

/** عنوان العمود بصيغة يفهمها الفريق: المجموعة + المفتاح */
export const headerRow = () =>
  SHEET_COLUMNS.map((c) => `${c.group} · ${c.key}`);

/** تحويل رقم العمود (0-based) إلى حرف A1 */
export function columnLetter(index: number): string {
  let n = index + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export const columnIndex = (key: string) => COLUMN_KEYS.indexOf(key);
export const columnRef = (key: string) => columnLetter(columnIndex(key));
export const emailColumnRef = () => columnRef("email");

/** القيم المملوءة بشريًا داخل الفريق */
export const TEAM_STATUSES = [
  "NEW",
  "REVIEWING",
  "SHORTLISTED",
  "CONTACTED",
  "ACTIVE",
  "NOT_A_CURRENT_FIT",
] as const;
export type TeamStatus = (typeof TEAM_STATUSES)[number];

/* --------------------------- Row builder --------------------------- */

const list = (v: unknown) => (Array.isArray(v) ? v.join(" · ") : String(v ?? ""));
const bool = (v: unknown) => (v === true ? "TRUE" : "FALSE");

export type BuildRowOptions = {
  values: TalentFormValues;
  submissionId: string;
  submittedAt: string;
  source: string;
};

/** يحوّل إجابات النموذج إلى صف مطابق تمامًا لترتيب SHEET_COLUMNS */
export function buildSheetRow({
  values,
  submissionId,
  submittedAt,
  source,
}: BuildRowOptions): string[] {
  const secondary = (values.services ?? []).filter((s) => s !== values.primary_specialty);

  const record = {
    submission_id: submissionId,
    submitted_at: submittedAt,
    application_status: "NEW",
    source,
    last_updated: submittedAt,
    ...values,
    secondary_specialties: list(secondary),
    services: list(values.services),
    project_types_worked_on: list(values.project_types_worked_on),
    preferred_project_types: list(values.preferred_project_types),
    ai_tools: list(values.ai_tools),
    // الأربعة أعمدة الأربعة للفهم مجمّعة في عمود واحد (ولا تُقبل الإرسالية إلا بتحديدها كلها)
    understood_project_based_model: bool(
      values.understood_project_based_model &&
        values.project_services_model &&
        values.compensation_is_service_based &&
        values.no_guaranteed_work,
    ),
    agreed_to_contact: bool(values.agreed_to_contact),
    privacy_consent: bool(values.privacy_consent),
    reviewer_notes: "",
    ai_decision_support: "",
    record_json: JSON.stringify(values).slice(0, 45000),
  } as Record<string, unknown>;

  return SHEET_COLUMNS.map(({ key }) => {
    const v = record[key];
    if (Array.isArray(v)) return v.join(" · ");
    if (typeof v === "boolean") return bool(v);
    if (v === undefined || v === null) return "";
    return String(v);
  });
}
