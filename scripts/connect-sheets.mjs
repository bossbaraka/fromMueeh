#!/usr/bin/env node
/**
 * sheets:connect — ربط مُريح بملف Google Sheets بأمر واحد.
 *
 *   node scripts/connect-sheets.mjs           # يتحقق + ينشئ التاب + يكتب صف العناوين
 *   node scripts/connect-sheets.mjs --check   # تحقق فقط بدون أي كتابة
 *
 * يقرأ القيم من .env.local (أو .env) أو من متغيّرات البيئة مباشرة.
 * لا يحتاج تشغيل السيرفر.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { google } from "googleapis";

/* ----------------------------- env loader ---------------------------- */

function loadEnv() {
  const env = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (env[key] === undefined || env[key] === "") env[key] = value;
    }
  }
  return env;
}

const env = loadEnv();
const checkOnly = process.argv.includes("--check");

const email = (env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "").trim();
const key = (env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n").trim();
const sheetId = (env.GOOGLE_SHEET_ID ?? "").trim();
const tab = (env.GOOGLE_SHEET_TAB ?? "Talent Applications").trim();

/* ------------------------------ preflight ---------------------------- */

const problems = [];
if (!email.includes("@") || !email.includes(".iam.gserviceaccount.com")) {
  problems.push("GOOGLE_SERVICE_ACCOUNT_EMAIL ناقص أو غير صحيح (يجب أن ينتهي بـ .iam.gserviceaccount.com)");
}
if (!key.includes("BEGIN PRIVATE KEY")) {
  problems.push(
    'GOOGLE_PRIVATE_KEY غير صالح: يجب أن يحتوي "-----BEGIN PRIVATE KEY-----" مع إبقاء \\n كما هي داخل علامات التنصيص',
  );
}
if (!/^[a-zA-Z0-9-_]{20,}$/.test(sheetId)) {
  problems.push("GOOGLE_SHEET_ID ناقص أو غير صحيح (الجزء بين /d/ و /edit في رابط الملف)");
}

const csvPath = resolve(process.cwd(), "google-sheets-headers.csv");
if (!existsSync(csvPath)) {
  problems.push("google-sheets-headers.csv غير موجود — شغّل: npm run sheet:headers");
}
const headers = existsSync(csvPath)
  ? readFileSync(csvPath, "utf8").trim().split("\n")[0].split(",")
  : [];

if (problems.length > 0) {
  console.error("\n  ✖ لا يمكن الربط بعد — ينقص ما يلي:\n");
  problems.forEach((p) => console.error(`    • ${p}`));
  console.error(`
  الخطوات (5 دقائق):
    1) أنشئ ملف Google Sheet جديد.
    2) Google Cloud Console → APIs & Services → Library → فعّل "Google Sheets API".
    3) Credentials → Create credentials → Service account → بعدها Keys → Add key → JSON.
    4) افتح ملف الشيت → Share → الصق بريد حساب الخدمة → Editor → Share.
    5) انسخ .env.example إلى .env.local واملأ القيم الثلاث من ملف JSON:
         GOOGLE_SERVICE_ACCOUNT_EMAIL = client_email
         GOOGLE_PRIVATE_KEY           = private_key   (بين علامتي تنصيص، وأبقِ \\n)
         GOOGLE_SHEET_ID              = معرّف الملف من الرابط
    ثم أعد تشغيل: npm run sheets:connect

  التفاصيل الكاملة: docs/GOOGLE_SHEETS_SETUP.md
`);
  process.exit(1);
}

/* -------------------------------- run -------------------------------- */

const friendly = (error) => {
  const message = error?.message ?? String(error);
  if (/invalid_grant|Invalid JWT|decoder|DECODER/i.test(message)) {
    return "المفتاح الخاص غير صالح أو أُبطل — أنشئ مفتاحًا جديدًا من Service account → Keys، وتأكد أن \\n بقيت داخل الـ env.";
  }
  if (message.includes("403") || /permission/i.test(message)) {
    return `لا يملك حساب الخدمة صلاحية على الملف. شارك الملف مع ${email} بصلاحية Editor.`;
  }
  if (message.includes("404") || /not found/i.test(message)) {
    return "GOOGLE_SHEET_ID غير صحيح، أو الملف محذوف.";
  }
  if (/ENOTFOUND|EAI_AGAIN|fetch failed/i.test(message)) {
    return "تعذّر الوصول إلى Google من هذه البيئة (شبكة).";
  }
  return message;
};

const auth = new google.auth.JWT({
  email,
  key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

console.log("\n  مُريح — ربط Google Sheets\n  " + "─".repeat(52));
console.log(`  حساب الخدمة : ${email}`);
console.log(`  الملف        : ${sheetId}`);
console.log(`  الورقة       : ${tab}`);
console.log(`  الأعمدة      : ${headers.length}`);
console.log("  " + "─".repeat(52));

try {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
    fields: "properties.title,sheets.properties(title,sheetId)",
  });
  console.log(`  ✔ الاتصال ناجح — الملف: «${meta.data.properties?.title}»`);

  const existing = meta.data.sheets?.map((s) => s.properties?.title ?? "") ?? [];
  console.log(`    الأوراق الموجودة: ${existing.join(" · ") || "(لا شيء)"}`);

  if (checkOnly) {
    console.log("\n  ℹ وضع التحقق فقط (--check): لم تُكتب أي بيانات.\n");
    process.exit(0);
  }

  let tabId = meta.data.sheets?.find((s) => s.properties?.title === tab)?.properties?.sheetId;
  if (tabId === undefined || tabId === null) {
    const created = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: tab } } }] },
    });
    tabId = created.data.replies?.[0]?.addSheet?.properties?.sheetId ?? 0;
    console.log(`  ✔ أُنشئت ورقة «${tab}»`);
  } else {
    console.log(`  ✔ الورقة «${tab}» موجودة`);
  }

  const current = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'${tab}'!A1:1`,
  });
  const existingHeaders = current.data.values?.[0] ?? [];

  if (existingHeaders.length === headers.length) {
    console.log("  ✔ صف العناوين موجود ومطابق للمخطط — لن يُستبدل");
  } else {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `'${tab}'!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
    console.log(
      `  ✔ كُتب صف العناوين (${headers.length} عمودًا)${existingHeaders.length ? " — استُبدل صف قديم" : ""}`,
    );
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: { sheetId: tabId, gridProperties: { frozenRowCount: 1 } },
            fields: "gridProperties.frozenRowCount",
          },
        },
      ],
    },
  });
  console.log("  ✔ ثُبّت الصف الأول (Frozen header)");

  console.log("  " + "─".repeat(52));
  console.log(`
  تم الربط. الخطوات التالية:
    1) أعد تشغيل السيرفر:  npm run dev
    2) تحقّق:              curl http://localhost:3000/api/health
    3) أرسل تجربة:         /apply  → يجب أن يظهر صف جديد بحالة NEW
`);
} catch (error) {
  console.error(`\n  ✖ فشل الربط: ${friendly(error)}\n`);
  process.exit(1);
}
