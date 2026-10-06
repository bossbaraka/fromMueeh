import { ApplyForm } from "@/components/form/ApplyForm";
import type { Viewport } from "next";

export const metadata = {
  title: "طلب الانضمام إلى شبكة مُريح",
  description:
    "طلب الانضمام إلى Mureeh Talent Network — نتعرف على مهاراتك وأعمالك وطريقة تفكيرك. التقديم لا يعني التوظيف.",
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B1320",
  width: "device-width",
  initialScale: 1,
};

/**
 * صفحة التقديم — الشاشة المقسّمة (ريل كحلي + عمود النموذج)
 * مبنية بالكامل داخل ApplyForm، بما فيها الهوية والتنقل والتقدم.
 */
export default function ApplyPage() {
  return (
    <main id="main" className="bg-ivory-200">
      <ApplyForm />
    </main>
  );
}
