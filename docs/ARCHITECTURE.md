# Mureeh — Talent & Service Provider Acquisition System

Architecture, product decisions, and engineering rules for the application form behind
**مُريح | Mureeh** — a network, not a job board.

> Core principle: **«لا نبحث فقط عمّن يستطيع تنفيذ المهمة، بل عمّن يفهم لماذا يجب تنفيذها
> وكيف يمكن تحويلها إلى قيمة.»**

---

## 1. Product framing (what this system is *not*)

The form is **not** a job application. It is an application to the **Mureeh Talent
Network**. The user must finish it knowing:

* this is not employment;
* there is no salary, no guaranteed work, no fixed employment relationship;
* compensation is per **service / project**, agreed separately (scope → deliverables →
  timeline → price → responsibilities).

This is stated in four separate places by design: the landing page, the intro screen
before step 1, step 7 (collaboration model), and step 11 (agreement checklist).

---

## 2. User journey

```
Landing (/)
  └─ understands the model, the 5 stages, and the FAQ
        └─ /apply → Intro screen (expectations, 15–20 min, draft saved locally)
              └─ 01 Identity → 02 Craft → 03 Experience
                    └─ 04 Thinking (3 sub-pages × 4 questions)
                          └─ 05 Work (3 projects) → 06 AI → 07 Collaboration
                                └─ 08 Availability → 09 Pricing → 10 Why
                                      └─ 11 Agreement → Submit
                                            └─ Success screen (brand experience + reference ID)
```

Failure path from the team's side is equally defined: a submission that never matches a
project stays in the sheet as a **record of capability** — the sheet is a talent map, not
an inbox.

---

## 3. Information architecture

| Route | Purpose | Notes |
| --- | --- | --- |
| `/` | Positioning + transparency + FAQ | Server component, fully static-friendly |
| `/apply` | The 11-step / 13-page application | `robots: noindex` |
| `/team` | Internal review view of the talent database | Token-gated in production, `noindex` |
| `/api/talent` | Submission endpoint (POST only) | Node runtime, server-only credentials |
| `/api/talent/setup` | Creates tab + header row | `x-admin-token` required |
| `/api/health` | Integration status | Never exposes credentials |

---

## 4. Form schema & step contract

The form is defined once in `src/lib/schema.ts`:

```ts
stepSchemas = { identity, craft, experience, "thinking-a", "thinking-b", "thinking-c",
                work, ai, collaboration, availability, pricing, why, agreement }
STEP_IDS        // ordered list used for navigation & progress
fieldsForStep() // which fields a given page validates on «متابعة»
fullSchema      // the single Zod object used by both client and server
TalentValues    // the explicit data contract (compiled-time checked against Zod)
```

Rules that the implementation follows:

* **One schema, two runtimes.** The client validates for feedback; the server validates
  again with the exact same schema. The server never trusts the client.
* **Plain object schemas only.** Field types are written with literal keys (no computed
  keys, no `.merge()` chains) so TypeScript inference stays exact — a compile-time guard
  asserts `z.infer<typeof fullSchema>` conforms to `TalentValues`.
* **Cross-field rules** live in `partialProjectErrors()` + `superRefine`:
  projects 2/3 must be either complete or empty; `primary_specialty` must be one of the
  selected `services`.
* **"Continue" only validates the current page** (`trigger(fieldsForStep(id))`), so the
  user is never blocked by a page they haven't reached.
* **Submitting from any page jumps back** to the first page that has an error.

### Why step 04 is split into three pages

Twelve long-form questions on one screen is a wall of text. They are grouped by theme —
*reading the problem* → *decisions, quality, tools* → *value & responsibility* — with a
calm progress indication (`1 من 3`). Content and minimum lengths live in
`src/lib/content.ts` (`THINKING_QUESTIONS`) and the Sheet columns are derived from the
same array.

---

## 5. Data model

```
Submission
├── System       submission_id (uuid) · submitted_at (ISO) · application_status · source · last_updated
├── Personal     full_name · preferred_name · email · phone · country · city
├── Professional primary_specialty · secondary_specialties (derived) · experience_level ·
│                years_experience · portfolio_url · linkedin_url · github_url · website_url
├── Services     services · project_types_worked_on · preferred_project_types ·
│                collaboration_type · availability · weekly_capacity
├── AI           ai_tools · ai_experience · ai_workflow · ai_boundaries
├── Pricing      pricing_model · expected_project_range · currency
├── Thinking     12 long-form answers (one column each)
├── Portfolio    3 projects × { name/link · problem · role/ownership · tools · result }
├── Agreement    understood_project_based_model (collapsed) · agreed_to_contact · privacy_consent
└── Team         reviewer_notes · ai_decision_support · record_json
```

Derived by the system, never asked twice:

* `submission_id` — `crypto.randomUUID()`
* `submitted_at` / `last_updated` — server timestamp (ISO 8601, UTC)
* `application_status` — always `NEW` on insert
* `secondary_specialties` — selected services minus the primary specialty
* `understood_project_based_model` — `TRUE` only when all four model-confirmation boxes are checked
* `source` — `web-form` plus an optional `?src=` label

---

## 6. Google Sheets schema

66 columns, order owned by `src/lib/sheets-schema.ts`:

```
System(5) · Personal(6) · Professional(8) · Services(6) · AI(4) · Pricing(3) ·
Thinking(13) · Portfolio(15) · Agreement(3) · Team(3)
```

* Header convention: `Group · key` (`Personal · full_name`).
* `row.length === COLUMN_KEYS.length` is asserted before every append — a schema drift
  fails loudly instead of writing a shifted row.
* Multi-select answers are joined with ` · `; booleans are `TRUE` / `FALSE`.
* `record_json` keeps the complete payload, so column changes never lose data.
* The 6 documented additions (3 thinking, 1 services, 1 AI, 3 portfolio) and the collapsed
  agreement cell are explained in `docs/GOOGLE_SHEETS_SETUP.md`.

---

## 7. Validation rules (Arabic, user-facing)

| Rule | Message style |
| --- | --- |
| Required text | «اكتب اسمك الكامل كما تحب أن نراه.» |
| Email | «أدخل بريدًا إلكترونيًا صالحًا.» |
| Phone | «أدخل رقم تواصل صحيحًا (مع رمز الدولة).» |
| URLs (optional but must be valid) | «أدخل رابطًا صحيحًا يبدأ بـ https://» |
| Long answers | «خلّينا نفهم تفكيرك أكثر — اكتب على الأقل 120 حرفًا.» |
| Multi-select | «اختر خدمة واحدة على الأقل تقدّمها فعلًا.» |
| Agreement | «لازم تأكيد أنك تفهم أن الطلب لا يعني التوظيف.» |
| Partial project | «المشروع الثاني: إمّا تكمل كل حقوله أو تتركه فارغًا بالكامل.» |

Minimum lengths are intentionally enforced **only on long-form answers** (50–120 chars),
so the field is never empty-but-technically-valid.

### Error states

| State | UX |
| --- | --- |
| Field error | Inline, below the field, `aria-live="polite"`, red dot + text (never colour alone) |
| Page error | Banner above the nav: «راجع الحقول المعلّمة قبل المتابعة.» + focus moves to the first invalid field |
| Server validation (422) | `fieldErrors` mapped back onto the exact fields |
| Duplicate (409) | Banner: the email already has a file; the team will update it on request |
| Rate limited (429) | Banner with minutes remaining |
| Storage failure (502) | Reassures that nothing was lost and the page still holds the data |
| Network failure | «تعذّر الوصول إلى الشبكة…» — the draft is still in `localStorage` |

---

## 8. Mobile UX

* Single column, full-width fields, 48px minimum control height (chips ≈44px on mobile).
* **Sticky bottom navigation** (رجوع / متابعة) always reachable; the primary action is on
  the start side of the RTL layout.
* Sticky compact progress header: step number, step name, percentage, thin gold bar.
* Long pages (thinking questions, projects) are split into thematic pages rather than
  endless scroll; projects 2 and 3 are opt-in with a dashed "+ أضف مشروعًا آخر".
* `Enter` in a text input means **متابعة**, never an accidental submit.

---

## 9. Accessibility

* Real `<label>`/`<input>` pairs; radio groups use `<input type="radio">` with a
  `role="radiogroup"` container and a `sr-only` legend; chips are real checkboxes.
* `aria-invalid`, `aria-describedby` (hint + counter + error), and `aria-live="polite"`
  error regions.
* Progress exposed via `role="progressbar"` with `aria-valuenow`.
* Step changes are announced (`aria-live`) and focus moves to the new `<h2 tabIndex={-1}>`.
* Keyboard: full tab order, visible gold focus ring, skip link («تخطَّ إلى المحتوى»),
  no keyboard traps, `Esc`-free flows.
* Motion respects `prefers-reduced-motion` (Framer Studio `useReducedMotion`) — transitions
  collapse to 0 duration.
* Contrast: navy/ivory body copy and gold accents meet WCAG AA; error states use text +
  dot, not colour alone.

---

## 10. Security & anti-spam

| Layer | Implementation |
| --- | --- |
| Credentials | Service-account JWT, server-only (`googleapis`); nothing is exposed to the client bundle |
| Request size | `Content-Length` cap (300 KB) → `413` |
| Honeypot | Hidden `company_website` field; if filled → **silent fake success** (`stored:false`) so bots learn nothing |
| Timing | Submissions faster than 2 s are treated as bots (same silent response) |
| Rate limit | In-memory sliding window, `RATE_LIMIT_MAX` per `RATE_LIMIT_WINDOW_MINUTES` per IP → `429` + `Retry-After` |
| Duplicate | Email uniqueness check against the sheet (`email` column) or the local store → `409` |
| CAPTCHA | Cloudflare Turnstile, optional: renders only when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set; verified server-side with `TURNSTILE_SECRET_KEY` |
| Headers | `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` |
| Privacy | Drafts live only in the applicant's `localStorage`; nothing is sent to the server until submit |

Scaling note: the rate limiter is per-instance. For multiple instances, swap the `Map` in
`src/lib/rate-limit.ts` for Redis/Upstash — the interface (`rateLimit(identifier)`) stays
the same.

---

## 11. Human-in-the-loop (no auto-rejection)

The system never decides who is accepted. `application_status` moves
`NEW → REVIEWING → SHORTLISTED → CONTACTED → ACTIVE / NOT_A_CURRENT_FIT` **by a human**,
from the `/team` panel, and the change is written back to the Sheet
(`application_status` + `last_updated`).

### Review loop (`POST /api/team/review`)

| Action | Effect |
| --- | --- |
| `application_status` | Writes the new status cell |
| `reviewer_notes` | Free-text note, team-only column |
| `analyze: true` | Runs the Decision Support engine and stores a compact summary in `ai_decision_support` |

Auth: `x-admin-token` must equal `ADMIN_ACCESS_TOKEN` (or `ADMIN_BOOTSTRAP_TOKEN`). In
production with no key configured the endpoint returns `503` instead of being open.

### Decision Support engine — `src/lib/decision-support.ts`

Two layers, both **advisory only**:

1. **Deterministic (`mureeh-signals/v1`)** — always on, no external calls, fully
   explainable. It produces:
   * `thinking_themes` — 11 themes (problem-first, measurement, user empathy, systems
     thinking, craft quality, ownership, learning loop, AI leverage, client
     communication, risk awareness, scope discipline) with a confidence value **and the
     answer excerpt that triggered it** (evidence, not vibes);
   * `signals` — `strength` / `watch` / `flag` items such as *"نتائج بلا مؤشر قياس"*,
     *"مفردات تقييم ذاتي بلا دليل"*, *"تعارض محتمل بين البدء والسعة"*;
   * `completeness` — how completely the profile describes itself (never a judgement of
     the person), plus `thin_answers`;
   * `fit` — suggested project types derived from specialty groups + capacity, with notes;
   * `suggested_interview_questions` — what to ask in the first conversation.
2. **Optional LLM (`+llm`)** — if `DECISION_SUPPORT_API_KEY` and `DECISION_SUPPORT_MODEL`
   are set, a 4-line Arabic summary is added for fast reading. 12 s timeout, failures are
   logged and ignored; the deterministic result is returned either way.

There is deliberately **no score, no ranking, no accept/reject suggestion** anywhere in
the output, and `disclaimer` + `human_review_required: true` ship in every payload.

### Arabic numerals

Arabic-Indic digits (`٤٠٠`, `٧`, `١٢%`, pricing like `٣٥٠٠ – ٩٠٠٠`) are converted to ASCII
before validation, analysis, and price parsing (`toAsciiDigits` in `src/lib/utils.ts`).
Phone numbers are normalised to ASCII on submit, so the Sheet stays queryable.


---

## 12. Content & copy rules

Written in `src/lib/content.ts` so the team can edit wording without touching logic:

* No «يرجى تعبئة الحقل» → «خلينا نتعرف عليك».
* No «الخبرات السابقة» → «ما الذي نفّذته بنفسك؟».
* No «الراتب المتوقع» → «كيف تسعّر خدماتك؟».
* No «سبب التقديم» → «لماذا تعتقد أن التعاون مع مُريح قد يكون مناسبًا لك؟».
* First-person plural, warm but precise; Q&A answers explain **why** we ask.

---

## 13. Project structure

```
src/
├── app/
│   ├── page.tsx                    landing (positioning + FAQ)
│   ├── apply/page.tsx              application route
│   ├── team/page.tsx               internal talent database view
│   └── api/
│       ├── talent/route.ts         submission pipeline
│       ├── talent/setup/route.ts   sheet bootstrap
│       └── health/route.ts         integration status
├── components/
│   ├── brand/Logo.tsx              official mark + wordmark
│   ├── form/ApplyForm.tsx          orchestration, progress, drafts, submit
│   ├── form/steps.tsx              the 13 page bodies + STEP_META
│   ├── form/fields.tsx             accessible field primitives
│   ├── form/SuccessScreen.tsx      brand-experience success
│   ├── form/Turnstile.tsx          optional CAPTCHA
│   ├── site/SiteHeader.tsx         header/footer
│   └── ui/Primitives.tsx           buttons, cards, badges, icons
└── lib/
    ├── schema.ts                   Zod + step contract + data contract
    ├── content.ts                  all Arabic copy & options
    ├── sheets-schema.ts            66-column sheet schema + row builder
    ├── sheets.ts                   Google Sheets client (server-only)
    ├── store.ts                    local NDJSON fallback
    ├── rate-limit.ts               sliding window limiter
    ├── turnstile.ts                CAPTCHA verification (optional)
    ├── utils.ts / clsx.ts          helpers
    └── ...
```

---

## 14. Deliberate non-features

Nothing was added that doesn't serve **Understand → Think → Verify → Match → Collaborate**:
no dashboards for applicants, no scoring, no auto-tagging, no email drip, no file uploads
(links and structured answers are enough to verify real work), no dark mode (the ivory
identity is the brand), no login for applicants.
