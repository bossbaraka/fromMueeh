import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ivory-200/80 backdrop-blur-md">
      <div className="shell flex h-[72px] items-center justify-between gap-6">
        <Logo size={38} />

        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-8 md:flex">
          <Link href="/#how" className="text-[14px] text-ink-muted transition-colors hover:text-navy">
            كيف نعمل
          </Link>
          <Link href="/#look" className="text-[14px] text-ink-muted transition-colors hover:text-navy">
            ما نبحث عنه
          </Link>
          <Link href="/#faq" className="text-[14px] text-ink-muted transition-colors hover:text-navy">
            أسئلة شائعة
          </Link>
        </nav>

        <Link href="/apply" className="btn-primary !min-h-[44px] !px-5 !text-[14px]">
          ابدأ طلبك
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ivory-100">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Logo size={38} />
          <p className="mt-5 max-w-xs text-[14px] leading-8 text-ink-muted">
            ريح دماغك وسيب الشغل كله لمُريح.
          </p>
        </div>

        <nav aria-label="روابط" className="text-[14px]">
          <p className="eyebrow mb-4">التنقل</p>
          <ul className="space-y-3 text-ink-muted">
            <li>
              <Link href="/" className="hover:text-navy">
                الصفحة الرئيسية
              </Link>
            </li>
            <li>
              <Link href="/apply" className="hover:text-navy">
                الانضمام إلى شبكة مُريح
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-navy">
                أسئلة شائعة
              </Link>
            </li>
          </ul>
        </nav>

        <div className="text-[14px]">
          <p className="eyebrow mb-4">وضوح</p>
          <p className="leading-8 text-ink-muted">
            التقديم لا يعني التوظيف، ولا يوجد راتب ثابت أو ضمان مشاريع. التعاون يتم حسب المشاريع والخدمات المتاحة،
            وبمقابل مقابل الخدمة المنفّذة.
          </p>
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-5 text-[12.5px] text-ink-faint">
          <span className="ltr">© {new Date().getFullYear()} Mureeh — Talent & Service Provider Network</span>
          <span>مُريح · منصة مريح للخدمات الإلكترونية</span>
        </div>
      </div>
    </footer>
  );
}
