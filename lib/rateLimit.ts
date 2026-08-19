type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Xotira cheksiz o'smasin: har tozalashda muddati o'tganlari olib tashlanadi
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Oddiy xotiradagi chegara. Serverless'da har instansiya alohida hisoblaydi,
 * shuning uchun bu mutlaq to'siq emas — qo'pol suiiste'molni to'xtatadi.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  return { ok: true, retryAfter: 0 };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
