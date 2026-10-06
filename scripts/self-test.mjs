#!/usr/bin/env node
/**
 * self-test — فحوصات انحراف المخطط (Schema Drift) بدون سيرفر.
 * الفكرة: Google Sheet هو قاعدة بيانات الفريق، لذا أي اختلاف بين
 * النموذج (schema.ts / content.ts) والأعمدة (sheets-schema.ts) يجب أن يفشل بصوت عالٍ.
 *
 *   node scripts/self-test.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (p) => readFileSync(resolve(root, p), "utf8");

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

const SRC = {
  sheets: read("src/lib/sheets-schema.ts"),
  schema: read("src/lib/schema.ts"),
  content: read("src/lib/content.ts"),
};

const sheetColumns = [...SRC.sheets.matchAll(/\{\s*key:\s*"([^"]+)",\s*group:\s*"([^"]+)"/g)].map(
  (m) => ({ key: m[1], group: m[2] }),
);

const talentValuesBlock = SRC.schema.slice(
  SRC.schema.indexOf("export type TalentValues = {"),
  SRC.schema.indexOf("export type TalentFormValues"),
);
const talentValuesKeys = [...talentValuesBlock.matchAll(/^\s{2}([a-z0-9_]+):/gm)].map((m) => m[1]);

const thinkingColumns = [...SRC.content.matchAll(/column:\s*"([^"]+)"/g)].map((m) => m[1]);
const agreementNames = [...SRC.content.matchAll(/name:\s*"([^"]+)",/g)].map((m) => m[1]);

/* ------------------------------- Tests ------------------------------- */

test("صف العناوين الجاهز يطابق المخطط (google-sheets-headers.csv)", () => {
  const csvPath = resolve(root, "google-sheets-headers.csv");
  if (!existsSync(csvPath)) {
    throw new Error("الملف غير موجود — شغّل: node scripts/print-headers.mjs");
  }
  const headers = readFileSync(csvPath, "utf8").trim().split("\n")[0].split(",");
  if (headers.length !== sheetColumns.length) {
    throw new Error(`CSV فيه ${headers.length} عمودًا، والمخطط فيه ${sheetColumns.length}`);
  }
  const expected = sheetColumns.map((c) => `${c.group} · ${c.key}`);
  const mismatch = headers.filter((h, i) => h !== expected[i]);
  if (mismatch.length) throw new Error(`اختلاف في ${mismatch.length} عنوانًا، أولها: ${mismatch[0]}`);
});

test("لا توجد أعمدة مكرّرة", () => {
  const seen = new Set();
  const dup = sheetColumns.filter((c) => (seen.has(c.key) ? true : (seen.add(c.key), false)));
  if (dup.length) throw new Error(`أعمدة مكرّرة: ${dup.map((d) => d.key).join(", ")}`);
});

test("كل سؤال تفكير له عمود في الـ Sheet (12)", () => {
  if (thinkingColumns.length !== 12) throw new Error(`عدد أسئلة التفكير ${thinkingColumns.length} لا 12`);
  const missing = thinkingColumns.filter((c) => !sheetColumns.some((s) => s.key === c));
  if (missing.length) throw new Error(`أسئلة بلا أعمدة: ${missing.join(", ")}`);
});

test("كل حقل في عقد TalentValues له عمود (أو مشتق)", () => {
  // أعمدة مشتقة أو مجمّعة بقرار مقصود (موثّق في docs/GOOGLE_SHEETS_SETUP.md):
  // الأربعة تأكيدات الخاصة بنموذج المشاريع تُجمع في understood_project_based_model،
  // والقيم الفردية تبقى كاملة داخل record_json.
  const derived = new Set([
    "secondary_specialties",
    "understood_project_based_model",
    "project_services_model",
    "compensation_is_service_based",
    "no_guaranteed_work",
    "agreed_to_contact",
    "privacy_consent",
  ]);
  const missing = talentValuesKeys.filter(
    (k) => !sheetColumns.some((s) => s.key === k) && !derived.has(k),
  );
  if (missing.length) throw new Error(`حقول بلا أعمدة: ${missing.join(", ")}`);
});

test("مفاتيح الموافقة في العقد تطابق محتوى الخطوة 11", () => {
  const expected = [
    "understood_project_based_model",
    "project_services_model",
    "compensation_is_service_based",
    "no_guaranteed_work",
    "agreed_to_contact",
    "privacy_consent",
  ];
  const missing = expected.filter(
    (k) => !talentValuesKeys.includes(k) || !agreementNames.includes(k),
  );
  if (missing.length) throw new Error(`مفاتيح موافقة ناقصة: ${missing.join(", ")}`);
});

test("حالات المراجعة الست معرّفة كما في المواصفة", () => {
  const expected = [
    "NEW",
    "REVIEWING",
    "SHORTLISTED",
    "CONTACTED",
    "ACTIVE",
    "NOT_A_CURRENT_FIT",
  ];
  const block = SRC.sheets.slice(SRC.sheets.indexOf("TEAM_STATUSES"), SRC.sheets.indexOf("];", SRC.sheets.indexOf("TEAM_STATUSES")));
  const missing = expected.filter((s) => !block.includes(`"${s}"`));
  if (missing.length) throw new Error(`حالات ناقصة: ${missing.join(", ")}`);
});

test("صفحة المشاريع تحتوي الحقول الخمسة للمشروع الأول", () => {
  const required = ["project_1", "project_1_problem", "project_1_role", "project_1_tools", "project_1_result"];
  const missing = required.filter((k) => !talentValuesKeys.includes(k) || !sheetColumns.some((s) => s.key === k));
  if (missing.length) throw new Error(`حقول مشروع ناقصة: ${missing.join(", ")}`);
});

test("عدد أعمدة الورقة مستقر (لا تغيير صامت)", () => {
  const EXPECTED = 66;
  if (sheetColumns.length !== EXPECTED) {
    throw new Error(
      `عدد الأعمدة ${sheetColumns.length} بدل ${EXPECTED} — إن كان التغيير مقصودًا حدّث هذا الفحص والوثائق.`,
    );
  }
});

/* ------------------------------- Runner ------------------------------ */

let failed = 0;
console.log("\n  مُريح — فحوصات المخطط\n" + "  " + "─".repeat(52));

for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`  ✔ ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`  ✖ ${name}\n      → ${error.message}`);
  }
}

console.log("  " + "─".repeat(52));
console.log(
  failed === 0
    ? `  كل الفحوصات نجحت (${tests.length}) — المخطط متوافق مع Google Sheets.\n`
    : `  فشل ${failed} من ${tests.length} فحوصات.\n`,
);

process.exit(failed === 0 ? 0 : 1);
