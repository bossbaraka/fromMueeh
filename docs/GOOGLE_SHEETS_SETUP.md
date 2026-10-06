# Google Sheets Setup — Mureeh Talent Network

The application writes every submission as **one new row** in a Google Sheet named
**`Talent Applications`** (tab name is configurable via `GOOGLE_SHEET_TAB`).

All Google access happens **server-side only** (`src/lib/sheets.ts`). No credential ever
reaches the browser.

---

## 1. Create the target spreadsheet

1. Go to <https://sheets.new> and rename the file, e.g. `Mureeh — Talent Database`.
2. You do **not** need to create the tab or the header row manually — the app does it
   (see step 5). If you prefer to do it yourself, create a tab named
   `Talent Applications` and paste the header row from
   [`google-sheets-headers.csv`](../google-sheets-headers.csv) into `A1`.

Copy the **spreadsheet ID** from the URL:

```
https://docs.google.com/spreadsheets/d/  1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789  /edit
                                         └──────────── GOOGLE_SHEET_ID ───────────┘
```

---

## 2. Create a Service Account

1. Open <https://console.cloud.google.com/> and select (or create) a project.
2. **APIs & Services → Library** → search for **Google Sheets API** → **Enable**.
3. **APIs & Services → Credentials → Create credentials → Service account**
   * Name: `mureeh-sheets`
   * Role: none required at the project level (access is granted on the file itself).
4. Open the created service account → **Keys → Add key → Create new key → JSON**.
   A `.json` file downloads. It contains:

   ```json
   {
     "client_email": "mureeh-sheets@your-project.iam.gserviceaccount.com",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
   }
   ```

> The JSON key is a secret. Never commit it, never paste it into a client component,
> and never log it.

---

## 3. Share the spreadsheet with the service account

In the spreadsheet: **Share** → paste the `client_email` → give it **Editor** access →
uncheck "Notify people" → **Share**.

Skipping this step is the #1 cause of `403 The caller does not have permission`.

---

## 4. Set environment variables

Copy `.env.example` to `.env.local` (local dev) or add them in your hosting provider:

| Variable | Value |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` from the JSON key |
| `GOOGLE_PRIVATE_KEY` | `private_key` from the JSON key — keep it in double quotes, keep the `\n` sequences as-is |
| `GOOGLE_SHEET_ID` | the ID copied in step 1 |
| `GOOGLE_SHEET_TAB` | `Talent Applications` (default) |
| `ADMIN_BOOTSTRAP_TOKEN` | long random string — protects the bootstrap endpoint |
| `ADMIN_ACCESS_TOKEN` | long random string — protects `/team` in production |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MINUTES` | `5` / `15` (defaults) |
| `STORAGE_FALLBACK` | `local` — used when Sheets keys are absent |

**Vercel / similar:** add the private key as a single-line value with literal `\n`
sequences. The app converts `\\n` → newline at runtime.

---

## 5. Bootstrap the sheet (creates the tab + header row)

With the server running:

```bash
curl -X POST https://your-domain.com/api/talent/setup \
  -H "x-admin-token: $ADMIN_BOOTSTRAP_TOKEN"
```

Expected response:

```json
{ "ok": true, "sheet": "Talent Applications", "created": true, "headersWritten": true }
```

It is idempotent: if the tab already exists with a header row, it only reports state.

Alternative without the API: paste the contents of
[`google-sheets-headers.csv`](../google-sheets-headers.csv) into cell `A1`,
or run `node scripts/print-headers.mjs --tsv` and paste the single row.

---

## 6. Verify

```bash
curl https://your-domain.com/api/health
```

```json
{
  "ok": true,
  "sheet": { "name": "Talent Applications", "columns": 66, "configured": true, "mode": "google", "spreadsheet": "Mureeh — Talent Database" }
}
```

Then submit a real application from `/apply` and confirm the new row appears at the
bottom of the tab with `application_status = NEW`.

---

## Sheet contract

* **Tab:** `Talent Applications`
* **Columns:** 66, order defined in `src/lib/sheets-schema.ts` (single source of truth).
* **Header style:** `Group · key` — e.g. `Personal · full_name`, `Thinking · value_answer`.
  The group prefix keeps a 66-column sheet readable while `key` stays machine-friendly.
* **Row 1 is frozen** by the bootstrap call.
* **Statuses** (`application_status`): `NEW` → `REVIEWING` → `SHORTLISTED` → `CONTACTED`
  → `ACTIVE` / `NOT_A_CURRENT_FIT`. New rows always start as `NEW`; the system never
  decides who gets accepted — a human does.
* **Team-only columns** are intentionally empty and filled by people:
  `reviewer_notes`, `ai_decision_support`.
* **`record_json`** stores the full submission payload (capped at 45 000 chars) so no
  detail is ever lost, even if the column layout evolves.

### Columns added beyond the original list

The original schema listed 10 thinking columns and 4 columns per project, while the form
asks **12 thinking questions** and **5 questions per project**. Rather than dropping
questions, three additions were made (documented in `docs/ARCHITECTURE.md`):

| Added column | Why |
| --- | --- |
| `Thinking · pre_work_question_answer` | «ما السؤال الذي يجب أن تعرف إجابته قبل أن تبدأ أي مشروع؟» |
| `Thinking · tool_vs_outcome_answer` | «الأداة ليست الحل» — سؤال مستقل عن فلسفة AI |
| `Thinking · prompt_vs_understanding_answer` | «Prompt أم فهم؟» |
| `Services · project_types_worked_on` | تفريق «أنواع عملت عليها» عن `preferred_project_types` (ما يتحمّس له) |
| `AI · ai_boundaries` | «ما الشيء الذي ترفض أن تترك AI يقرره نيابة عنك؟» — سؤال جوهري للفريق |
| `Portfolio · project_N_problem` (×3) | «ما المشكلة؟» منفصلة عن الدور والنتيجة، لفصل «شاركت» عن «نفّذت» |

Also note: the four agreement checkboxes about the project-based model are collapsed into
one readable cell (`Agreement · understood_project_based_model` = `TRUE` only if all four
are accepted). The individual values remain in `record_json`.

---

## Duplicate protection

`POST /api/talent` reads the `email` column and rejects a second submission from the same
address with `409 DUPLICATE`. To accept a returning applicant, clear their existing row
or update it manually — then they can submit again.

---

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `403 The caller does not have permission` | Sheet not shared with the service account e-mail (step 3). |
| `400 API key not valid` / `invalid_grant` | `GOOGLE_PRIVATE_KEY` lost its `\n` sequences or was pasted with real newlines inside a broken quote. |
| `Unable to parse range` | `GOOGLE_SHEET_TAB` doesn't match the tab name exactly (case-sensitive, including spaces). |
| Rows land in the wrong columns | Header row was edited by hand. Re-run the bootstrap call — it rewrites `A1` if the row is empty. |
| App stores data locally instead of Sheets | `isSheetsConfigured()` returns false → keys missing. Check `/api/health`. |
