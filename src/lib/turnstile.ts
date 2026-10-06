/**
 * Cloudflare Turnstile — تحقق server-side (اختياري).
 * إن لم تُضبط المفاتيح، يُتخطّى التحقق بهدوء ولا يتعطّل النموذج.
 */

const SECRET = process.env.TURNSTILE_SECRET_KEY?.trim() || "";
export const turnstileEnabled = Boolean(SECRET);

export async function verifyTurnstile(
  token: string,
  ip: string,
): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!turnstileEnabled) return { ok: true, skipped: true };
  if (!token) return { ok: false };

  try {
    const body = new URLSearchParams({ secret: SECRET, response: token, remoteip: ip });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      cache: "no-store",
    });
    const data = (await res.json()) as { success?: boolean };
    return { ok: Boolean(data.success) };
  } catch {
    // فشل الشبكة لا يجب أن يُسقط الطلب في بيئة الإنتاج الحرجة، لكن نسجّله
    console.error("[mureeh] turnstile verification failed (network)");
    return { ok: false };
  }
}
