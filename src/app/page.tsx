import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { Badge, Card, CTALink, GoldRule, SectionLabel } from "@/components/ui/Primitives";
import { SPECIALTY_GROUPS, TALENT_STAGES } from "@/lib/content";

export const metadata = {
  title: "مُريح | Talent & Service Provider Network",
};

const LOOK_FOR = [
  {
    title: "شبكة، لا وظيفة",
    body: "هذا طلب انضمام إلى Mureeh Talent Network، وليس طلب توظيف. لا عقد عمل ولا راتب ثابت.",
  },
  {
    title: "مشاريع وخدمات",
    body: "نستقطب مشاريع من العملاء، ونسند أجزاء منها إلى من يملك المهارة المناسبة — عند وجود مشروع، لا بشكل مضمون.",
  },
  {
    title: "مقابل مقابل الخدمة",
    body: "المقابل يكون مقابل الخدمة أو المشروع المنفّذ، ويُتفق على النطاق والمخرجات والمدة والسعر قبل بدء التنفيذ.",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "تعبئ الطلب",
    body: "~10 دقائق وستة فصول: مهاراتك، أعمالك، طريقة تفكيرك (4 أسئلة تختارها من 12)، أدواتك، وتوفرك. مسودتك تُحفظ على جهازك.",
  },
  {
    step: "02",
    title: "مراجعة بشرية",
    body: "يقرأ فريق مُريح الملف: خبرة، أعمال حقيقية، وطريقة تفكير. لا قرار آلي، ولا فرز بالكلمات المفتاحية.",
  },
  {
    step: "03",
    title: "تواصل عند وجود فرصة",
    body: "عندما يظهر مشروع يتقاطع مع ما تقدّمه، نتواصل معك لنعرض الفرصة بالتفصيل.",
  },
  {
    step: "04",
    title: "اتفاق منفصل",
    body: "نطاق العمل، المخرجات، المدة، والمقابل المالي — يُتفق عليها بشكل منفصل قبل بدء أي تنفيذ.",
  },
];

const FAQ = [
  {
    q: "هل هذا طلب توظيف؟",
    a: "لا. هذا طلب انضمام إلى شبكة مُريح للمستقلين ومقدّمي الخدمات. تقديمك لا يعني وجود عقد عمل أو راتب ثابت أو التزام بالحصول على مشاريع.",
  },
  {
    q: "هل يوجد راتب؟",
    a: "لا يوجد راتب وظيفي. المقابل يكون مقابل الخدمة أو المشروع المنفّذ، ويُتفق عليه بشكل منفصل: النطاق، المخرجات، المدة، والسعر.",
  },
  {
    q: "كم يستغرق تعبئة الطلب؟",
    a: "حوالي 10 دقائق في المتوسط: ستة فصول مختصرة. أسئلة التفكير اخترنا لها صيغة مرنة — أجب على 4 من 12 سؤالًا، بالأسئلة التي تشبهك. يمكنك التوقف والعودة، ونحفظ مسودتك على جهازك.",
  },
  {
    q: "ما يحدث بعد الإرسال؟",
    a: "يصل ملفك إلى قاعدة بيانات شبكة مُريح بحالة «طلبات جديدة» (NEW)، ويُراجع بشريًا. عندما يظهر مشروع يتقاطع مع خبرتك، قد يتواصل معك فريق مُريح. لا يوجد وقت متوقع مضمون، وبعض الملفات تبقى في الشبكة لحين ظهور الفرصة المناسبة.",
  },
  {
    q: "أنا مبتدئ — هل أقدّم؟",
    a: "نعم. لا نقيس عدد سنوات الخبرة فقط. المستوى، وطريقة التفكير، وقدرتك على شرح ما نفّذته بنفسك — كلها عوامل مهمة. الصراحة في تقييم مستواك تفيدك أكثر من المبالغة.",
  },
  {
    q: "كيف تُستخدم بياناتي؟",
    a: "تُستخدم لغرض واحد: مراجعة طلبك والتواصل بشأن فرص التعاون. تُحفظ في قاعدة بيانات الفريق، ولا تُنشر ولا تُشارك مع جهات خارجية.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* ------------------------------- Hero ------------------------------- */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 start-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.16),transparent_65%)]"
          />
          <div className="shell relative grid gap-14 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
            <div>
              <Badge tone="gold">Mureeh Talent Network</Badge>
              <h1 className="mt-6 text-[30px] font-semibold leading-[1.55] text-navy sm:text-[40px]">
                لا نبحث عمّن ينفّذ المهمة.
                <br />
                نبحث عمّن يفهم <span className="relative">لماذا</span> تُنفَّذ.
              </h1>
              <p className="mt-6 max-w-prose text-[16px] leading-9 text-ink-soft">
                مُريح تعمل على استقطاب المشاريع من العملاء، ثم إسناد أجزاء منها إلى مستقلين ومبدعين ومطورين
                ومقدّمي خدمات — يفهمون القيمة قبل المهمة.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <CTALink href="/apply" variant="gold">
                  ابدأ طلبك
                </CTALink>
                <CTALink href="#how" variant="ghost">
                  كيف نعمل؟
                </CTALink>
              </div>

              <p className="mt-6 text-[13.5px] leading-7 text-ink-faint">
                التقديم لا يعني التوظيف. التعاون يتم حسب المشاريع والخدمات المتاحة، وبمقابل مقابل الخدمة المنفّذة.
              </p>
            </div>

            {/* بطاقة «ما هذا الطلب؟» */}
            <Card className="p-6 sm:p-8">
              <SectionLabel>ما هذا الطلب؟</SectionLabel>
              <ul className="mt-6 space-y-5">
                {LOOK_FOR.map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <span aria-hidden className="mt-3 h-2 w-2 shrink-0 rounded-full bg-gold" />
                    <div>
                      <p className="text-[15.5px] font-semibold text-navy">{item.title}</p>
                      <p className="mt-1.5 text-[13.5px] leading-7 text-ink-muted">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <GoldRule className="my-7" />
              <p className="text-[13px] leading-7 text-ink-faint">
                نُسمّي الأشياء بأسمائها: هذا نموذج تعاون قائم على المشاريع والخدمات، ونكتبه بوضوح منذ البداية.
              </p>
            </Card>
          </div>
        </section>

        {/* ---------------------------- 5 stages ----------------------------- */}
        <section id="look" className="scroll-mt-header border-y border-line/70 bg-ivory-100/70">
          <div className="shell py-16 lg:py-20">
            <SectionLabel>ما نبحث عنه</SectionLabel>
            <h2 className="mt-5 max-w-3xl text-[26px] font-semibold leading-relaxed text-navy sm:text-[32px]">
              خمس مراحل نقرأ بها كل ملف — بهذا الترتيب.
            </h2>

            <ol className="mt-10 grid gap-4 md:grid-cols-5">
              {TALENT_STAGES.map((s, i) => (
                <li key={s.key} className="surface flex flex-col gap-3 p-5">
                  <span className="ltr text-[12px] font-semibold text-gold-deep">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[16px] font-semibold text-navy">{s.ar}</p>
                    <p className="ltr mt-1 text-[10px] uppercase tracking-[0.22em] text-ink-faint">{s.en}</p>
                  </div>
                  <p className="text-[13px] leading-7 text-ink-muted">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------ Process ---------------------------- */}
        <section id="how" className="scroll-mt-header">
          <div className="shell py-16 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <SectionLabel>كيف تسير الرحلة</SectionLabel>
                <h2 className="mt-5 text-[26px] font-semibold leading-relaxed text-navy sm:text-[32px]">
                  من الطلب إلى أول مشروع.
                </h2>
                <p className="mt-5 max-w-prose text-[15px] leading-9 text-ink-muted">
                  لا نضعك في قائمة انتظار صامتة. نراجع، ثم نتواصل عندما يوجد ما يستحق التواصل — والتعاون يبدأ
                  باتفاق واضح لا بالتوقعات.
                </p>
                <CTALink href="/apply" variant="primary" className="mt-8">
                  ابدأ طلبك الآن
                </CTALink>
              </div>

              <ol className="space-y-4">
                {PROCESS.map((p) => (
                  <li key={p.step} className="surface flex gap-5 p-5 sm:p-6">
                    <span className="ltr mt-1 text-[13px] font-semibold text-gold-deep">{p.step}</span>
                    <div>
                      <p className="text-[16px] font-semibold text-navy">{p.title}</p>
                      <p className="mt-2 text-[14px] leading-8 text-ink-muted">{p.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ---------------------------- Specialties -------------------------- */}
        <section className="border-y border-line/70 bg-ivory-100/70">
          <div className="shell py-16 lg:py-20">
            <SectionLabel>لمن هذا الطلب؟</SectionLabel>
            <h2 className="mt-5 max-w-3xl text-[26px] font-semibold leading-relaxed text-navy sm:text-[32px]">
              كل من يصنع قيمة داخل مشروع — لا المطوّرون فقط.
            </h2>

            <div className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {SPECIALTY_GROUPS.map((g) => (
                <Card key={g.key} className="p-5">
                  <p className="ltr text-[13px] font-semibold uppercase tracking-[0.16em] text-navy">
                    {g.labelEn}
                  </p>
                  <p className="mt-2 text-[13px] leading-7 text-ink-muted">{g.blurb}</p>
                  <ul className="mt-4 space-y-1.5 text-[12.5px] text-ink-soft">
                    {g.items.map((item) => (
                      <li key={item} className="ltr">
                        · {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------- FAQ ------------------------------ */}
        <section id="faq" className="scroll-mt-header">
          <div className="shell py-16 lg:py-24">
            <SectionLabel>أسئلة شائعة</SectionLabel>
            <h2 className="mt-5 text-[26px] font-semibold leading-relaxed text-navy sm:text-[32px]">
              بما أن الشفافية جزء من الهوية.
            </h2>

            <div className="mt-10 grid gap-3 lg:grid-cols-2">
              {FAQ.map((item) => (
                <details key={item.q} className="surface group p-5 transition-colors open:bg-white">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-semibold text-navy">
                    {item.q}
                    <span
                      aria-hidden
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-gold-deep transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-[14px] leading-8 text-ink-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------ Final CTA -------------------------- */}
        <section className="shell pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-14 text-center sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/70 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.28),transparent_65%)]"
            />
            <p className="eyebrow relative">الخطوة التالية</p>
            <h2 className="relative mx-auto mt-5 max-w-2xl text-[26px] font-semibold leading-relaxed text-ivory-50 sm:text-[32px]">
              خلينا نتعرف على طريقة تفكيرك — لا على قائمة مهاراتك.
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-[14.5px] leading-8 text-ivory-300/90">
              ~10 دقائق وستة فصول. مسودة محفوظة على جهازك. ومراجعة بشرية كاملة.
            </p>
            <div className="relative mt-9 flex justify-center">
              <Link href="/apply" className="btn-gold">
                ابدأ طلبك
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
