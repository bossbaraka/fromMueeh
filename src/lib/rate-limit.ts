/**
 * Rate limiting — نافذة منزلقة في الذاكرة لكل IP.
 * مناسب لعملية واحدة (single instance). عند التوسّع الأفقي:
 * استبدل Map بـ Redis / Upstash دون تغيير الواجهة.
 */

type Hit = { timestamps: number[] };

const buckets = new Map<string, Hit>();

const MAX = Number(process.env.RATE_LIMIT_MAX ?? 5);
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MINUTES ?? 15) * 60 * 1000;

export type RateResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(identifier: string, cost = 1): RateResult {
  const now = Date.now();
  const bucket = buckets.get(identifier) ?? { timestamps: [] };

  bucket.timestamps = bucket.timestamps.filter((t) => now - t < WINDOW_MS);

  const used = bucket.timestamps.reduce((sum, t) => sum + 1, 0) + cost;
  if (used > MAX) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
    buckets.set(identifier, bucket);
    return { ok: false, remaining: 0, retryAfterSeconds };
  }

  bucket.timestamps.push(now);
  buckets.set(identifier, bucket);
  return { ok: true, remaining: Math.max(0, MAX - used), retryAfterSeconds: 0 };
}

export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}

/** تنظيف دوري بسيط لمنع تضخّم الذاكرة */
if (!(globalThis as { __mureehRlTimer?: boolean }).__mureehRlTimer) {
  (globalThis as { __mureehRlTimer?: boolean }).__mureehRlTimer = true;
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, bucket] of buckets) {
        const fresh = bucket.timestamps.filter((t) => now - t < WINDOW_MS);
        if (fresh.length === 0) buckets.delete(key);
        else bucket.timestamps = fresh;
      }
    },
    10 * 60 * 1000,
  ).unref?.();
}
