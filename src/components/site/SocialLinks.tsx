import { SOCIAL_LINKS, visibleSocialLinks } from "@/lib/content";
import { cn } from "@/lib/utils";

/* أيقونات بسيطة بخط رفيع يطابق هوية مُريح (لا علامات تجارية مزخرفة) */

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-4 w-4", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.9" />
      <circle cx="17.1" cy="6.9" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-4 w-4", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.4 11.7a8.3 8.3 0 0 1-12.2 7.3L4 20.6l1.7-4A8.3 8.3 0 1 1 20.4 11.7Z" />
      <path d="M9.1 9.3c.2 1.6 1.4 2.8 3 3l.6-.6a1 1 0 0 1 1-.2l1.3.5c.2.1.3.3.2.5-.3 1-1.3 1.7-2.4 1.6-2.3-.2-4.2-2.1-4.3-4.5 0-1.1.7-2 1.7-2.3.2-.1.4 0 .5.2l.5 1.3c.1.3 0 .6-.1.8Z" />
    </svg>
  );
}

const ICONS = {
  instagram: InstagramIcon,
  whatsapp: WhatsAppIcon,
} as const;

const TONES = {
  // على الريل الكحلي
  rail: "border-ivory-50/15 bg-navy-800/70 text-ivory-100 hover:border-gold/50 hover:text-gold-soft",
  // على الخلفية العاجية
  light: "border-line bg-white/70 text-ink-soft hover:border-gold/50 hover:text-navy",
} as const;

/**
 * أزرار متابعة صفحات مُريح.
 * تُخفى الكتلة بالكامل إن لم تُضبط الروابط في متغيّرات البيئة —
 * لا نعرض روابط فارغة أو مكسورة أبدًا.
 */
export function SocialLinks({
  tone = "light",
  className,
  showNote = false,
}: {
  tone?: keyof typeof TONES;
  className?: string;
  showNote?: boolean;
}) {
  const links = visibleSocialLinks;
  if (links.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3", className)}>
      {links.map((link) => {
        const Icon = ICONS[link.key];
        return (
          <a
            key={link.key}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex min-h-[46px] items-center gap-2.5 rounded-full border px-5 text-[14px] font-medium transition-all duration-200 ease-calm",
              TONES[tone],
            )}
          >
            <Icon />
            <span>{link.label}</span>
            {showNote && (
              <span className="hidden text-[12px] font-normal opacity-70 sm:inline">
                · {link.handle}
              </span>
            )}
            <span className="sr-only">
              {link.label} — {link.note} (يُفتح في نافذة جديدة)
            </span>
          </a>
        );
      })}
    </div>
  );
}

/** أسماء الروابط لمن يريد عرضها كنص (مثل الفوتر) */
export const ALL_SOCIAL_KEYS = SOCIAL_LINKS.map((link) => link.key);
