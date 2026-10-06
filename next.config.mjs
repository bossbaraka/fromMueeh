/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // السماح بطلبات dev من نطاقات المعاينة/النفق (المتصفح هنا ليس localhost)
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai", "localhost", "127.0.0.1"],
  poweredByHeader: false,
  // أمان: لا نكشف أي مفاتيح للـ client. كل تكامل Google يحدث server-side فقط.
  serverExternalPackages: ["googleapis"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
