import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * الخط: IBM Plex Sans Arabic — عربي أولًا مع دعم لاتيني متناسق.
 * مُضاف عبر حزمة @fontsource (ملفات woff2 داخل الـ bundle):
 * استضافة محلية كاملة، بلا أي طلب خارجي عند المستخدم، وبلا اعتماد على الشبكة وقت البناء.
 */
/* ملفات الوزن الكاملة تحمل unicode-range لكل subset (عربي/لاتيني/…) —
   فلا يتحمّل المتصفح إلا الوجوه المستخدمة فعليًا */
import "@fontsource/ibm-plex-sans-arabic/300.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";

export const metadata: Metadata = {
  title: {
    default: "مُريح | Mureeh — Talent & Service Provider Network",
    template: "%s | مُريح",
  },
  description:
    "مُريح تستقطب المشاريع من العملاء، وتتعاون مع مستقلين ومبدعين ومطورين ومقدّمي خدمات لتنفيذ أجزاء منها. هذا الطلب للانضمام إلى شبكة مُريح — وليس طلب توظيف.",
  keywords: [
    "مُريح",
    "Mureeh",
    "مستقلين",
    "مقدّمي خدمات",
    "مشاريع",
    "Talent Network",
    "Freelance",
    "مبدعين",
  ],
  openGraph: {
    title: "مُريح | Mureeh — Talent & Service Provider Network",
    description:
      "لا نبحث فقط عمّن يستطيع تنفيذ المهمة، بل عمّن يفهم لماذا يجب تنفيذها وكيف يمكن تحويلها إلى قيمة.",
    type: "website",
    locale: "ar",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F7F4ED",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:z-50 focus:rounded-full focus:bg-navy focus:px-5 focus:py-3 focus:text-ivory-50 focus:shadow-elev"
        >
          تخطَّ إلى المحتوى
        </a>
        {children}
      </body>
    </html>
  );
}
