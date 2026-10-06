import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

/**
 * الخط: IBM Plex Sans Arabic — عربي أولًا مع دعم لاتيني متناسق.
 * يُستضاف محليًا عبر next/font (لا طلبات خارجية عند المستخدم).
 */
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-arabic",
});

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
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth" className={arabic.variable}>
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
