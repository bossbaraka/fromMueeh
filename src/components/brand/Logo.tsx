import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** الأبعاد الحقيقية للشعار (public/brand/mureeh-mark.png) */
const MARK_W = 220;
const MARK_H = 205;

export function Mark({ className, size = 36 }: { className?: string; size?: number }) {
  // نمرّر العرض والارتفاع بنفس النسبة دائمًا → لا تشويه ولا تحذير Next/Image
  return (
    <Image
      src="/brand/mureeh-mark.png"
      alt=""
      aria-hidden="true"
      width={MARK_W}
      height={MARK_H}
      priority
      className={cn("object-contain", className)}
      style={{ width: size, height: Math.round((size * MARK_H) / MARK_W) }}
    />
  );
}

export function Logo({
  href = "/",
  size = 40,
  showWordmark = true,
  className,
}: {
  href?: string | null;
  size?: number;
  showWordmark?: boolean;
  className?: string;
}) {
  const content = (
    <span className={cn("group inline-flex items-center gap-3", className)}>
      <Mark size={size} />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[22px] font-semibold tracking-tight text-navy">
            مُريح
          </span>
          <span className="ltr mt-1 text-[10px] font-medium uppercase tracking-[0.34em] text-ink-faint">
            Mureeh
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="مُريح — الصفحة الرئيسية" className="rounded-xl">
      {content}
    </Link>
  );
}
