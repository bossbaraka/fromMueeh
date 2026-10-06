import Link from "next/link";
import { ApplyForm } from "@/components/form/ApplyForm";
import { Logo } from "@/components/brand/Logo";

export const metadata = {
  title: "طلب الانضمام إلى شبكة مُريح",
  description:
    "طلب الانضمام إلى Mureeh Talent Network — نتعرف على مهاراتك وأعمالك وطريقة تفكيرك. التقديم لا يعني التوظيف.",
  robots: { index: false, follow: true },
};

export default function ApplyPage() {
  return (
    <div className="min-h-dvh bg-ivory-200">
      <header className="border-b border-line/70 bg-ivory-200/80 backdrop-blur-md">
        <div className="form-shell flex h-[68px] items-center justify-between gap-4">
          <Logo size={34} />
          <div className="flex items-center gap-4">
            <span className="hidden text-[13px] text-ink-faint sm:inline">
              Talent &amp; Service Provider Network
            </span>
            <Link href="/" className="btn-quiet !min-h-0 !px-3 !py-2 !text-[13.5px]">
              خروج
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        <ApplyForm />
      </main>
    </div>
  );
}
