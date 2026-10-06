#!/usr/bin/env node
/**
 * تقرير دعم القرار لطلب واحد — ملف Markdown للمشاركة الداخلية.
 *
 *   node scripts/decision-report.mjs <submission_id> [--out docs/report.md]
 *   BASE_URL=http://localhost:3000 ADMIN_TOKEN=xxx node scripts/decision-report.mjs …
 */

import { writeFileSync } from "node:fs";

const [, , submissionId, ...rest] = process.argv;
const outFlag = rest.indexOf("--out");
const outFile = outFlag >= 0 ? rest[outFlag + 1] : null;

if (!submissionId) {
  console.error("الاستخدام: node scripts/decision-report.mjs <submission_id> [--out file.md]");
  process.exit(1);
}

const base = process.env.BASE_URL ?? "http://localhost:3000";
const token = process.env.ADMIN_TOKEN ?? "";

const res = await fetch(`${base}/api/team/review`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-admin-token": token },
  body: JSON.stringify({ submission_id: submissionId, analyze: true }),
});

const data = await res.json();
if (!res.ok || !data.ok) {
  console.error("فشل التقرير:", data.message ?? res.status);
  process.exit(1);
}

const d = data.decision_support;
const ar = (v) => (v === null || v === undefined || v === "" ? "—" : v);

const md = `# تقرير دعم القرار — ${submissionId}

> ${d.disclaimer}
> مُولَّد آليًا: ${d.generated_at} · المحرّك: \`${d.engine}\`

## الملف باختصار

| | |
| --- | --- |
| التخصص الأساسي | ${ar(d.profile.primary_specialty)} |
| تخصصات ثانوية | ${d.profile.secondary_specialties.join(" · ") || "—"} |
| المجالات | ${d.profile.groups.join(" · ") || "—"} |
| المستوى / المدة | ${ar(d.profile.experience_level)} · ${ar(d.profile.years_experience)} |
| بيئات العمل | ${d.profile.domains.join(" · ") || "—"} |
| التوفر | ${ar(d.availability.start)} · ${ar(d.availability.weekly_capacity)} (≈${ar(d.availability.estimated_weekly_hours)} ساعة/أسبوع) |
| التسعير | ${ar(d.pricing.model)} · ${ar(d.pricing.range_raw)} ${ar(d.pricing.currency)} |
| أدوات AI | ${d.tools.ai_tools.join(" · ") || "—"} |
| أدوات المشاريع | ${d.tools.project_tools.join(" · ") || "—"} |
| تغطية الأدوات | ${d.tools.tools_coverage} |

## اكتمال الوصف (ليس تقييمًا للشخص)

* الدرجة: **${d.completeness.score}%**
* مشاريع مذكورة: ${d.completeness.portfolio_projects} · روابط: ${d.completeness.links}
* متوسط طول الإجابات مقابل الحد الأدنى: ×${d.completeness.avg_answer_ratio}
${d.completeness.thin_answers.length ? `* إجابات قريبة من الحد الأدنى: ${d.completeness.thin_answers.join(" · ")}` : "* لا إجابات رقيقة."}

## ثيمات التفكير

${d.thinking_themes.length === 0 ? "_لم تظهر ثيمات واضحة._" : d.thinking_themes.map((t) => `### ${t.label} — ثقة ${Math.round(t.confidence * 100)}%\n\nمن «${t.from}»:\n\n> ${t.evidence}`).join("\n\n")}

## إشارات للمراجعة

${["strength", "watch", "flag"].map((type) => {
  const labels = { strength: "قوة", watch: "يحتاج سؤالًا", flag: "تحقّق" };
  const items = d.signals.filter((s) => s.type === type);
  if (items.length === 0) return "";
  return `**${labels[type]}**\n\n${items.map((s) => `- **${s.label}** — ${s.detail}`).join("\n")}`;
}).filter(Boolean).join("\n\n")}

## ملاءمة مبدئية

* أنواع المشاريع: ${d.fit.project_types.join(" · ") || "—"}
* طرق التعاون المفضّلة: ${d.fit.collaboration_types.join(" · ") || "—"}
${d.fit.notes.map((n) => `* ${n}`).join("\n")}

## أسئلة مقترحة للتواصل الأول

${d.suggested_interview_questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

${d.llm_summary ? `## خلاصة النموذج اللغوي (اختيارية)\n\n${d.llm_summary}\n` : ""}
---

**القرار النهائي بشري.** الحالات: \`NEW → REVIEWING → SHORTLISTED → CONTACTED → ACTIVE / NOT_A_CURRENT_FIT\`
`;

if (outFile) {
  writeFileSync(outFile, md, "utf8");
  console.log(`✔ كُتب التقرير: ${outFile}`);
} else {
  process.stdout.write(md);
}
