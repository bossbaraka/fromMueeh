#!/usr/bin/env node
/**
 * يطبع صف عناوين Google Sheet انطلاقًا من مصدر الحقيقة الواحد: src/lib/sheets-schema.ts
 *   node scripts/print-headers.mjs          → CSV (يكتبه في google-sheets-headers.csv)
 *   node scripts/print-headers.mjs --tsv    → صف واحد مفصول بـ Tab (للّصق المباشر في A1)
 *   node scripts/print-headers.mjs --keys   → مفاتيح الأعمدة فقط
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const source = readFileSync(resolve(root, "src/lib/sheets-schema.ts"), "utf8");

const entry = /\{\s*key:\s*"([^"]+)",\s*group:\s*"([^"]+)"/g;
const columns = [];
for (const match of source.matchAll(entry)) {
  columns.push({ key: match[1], group: match[2] });
}

if (columns.length === 0) {
  console.error("✖ لم أجد أعمدة في src/lib/sheets-schema.ts — تحقق من الصيغة.");
  process.exit(1);
}

const csvEscape = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const headers = columns.map((c) => `${c.group} · ${c.key}`);

if (process.argv.includes("--keys")) {
  process.stdout.write(columns.map((c) => c.key).join("\n") + "\n");
  process.exit(0);
}

if (process.argv.includes("--tsv")) {
  process.stdout.write(headers.join("\t") + "\n");
  process.exit(0);
}

const csv = headers.map(csvEscape).join(",") + "\n";
writeFileSync(resolve(root, "google-sheets-headers.csv"), csv, "utf8");
process.stdout.write(csv);
console.log(`\n✔ ${columns.length} عمودًا — كُتب الملف: google-sheets-headers.csv`);
