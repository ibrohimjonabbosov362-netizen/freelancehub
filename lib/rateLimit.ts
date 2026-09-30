import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Xotiradagi chelaklar sonining yuqori chegarasi. Kalitlar (email, IP) tashqi
// tomondan boshqariladi, shuning uchun chegara bo'lmasa Map cheksiz o'sib,
// jarayon xotirasini to'ldirib qo'yardi.
const MAX_BUCKETS = 5000;

function sweep(now: number) {
  if (buckets.size < MAX_BUCKETS) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }

  // Muddati o'tganlar o'chirilgandan keyin ham to'lgan bo'lsa, eng eski
  // yozuvlarni chiqaramiz — Map kalitlarni kiritilish tartibida saqlaydi.
  while (buckets.size >= MAX_BUCKETS) {
    const oldest = buckets.keys().next();
    if (oldest.done) break;
    buckets.delete(oldest.value);
  }
}

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

if (!redis && process.env.NODE_ENV === "production") {
  // Redis bo'lmasa chegara har bir instansiyada alohida hisoblanadi, ya'ni
  // serverless muhitda u deyarli ishlamaydi. Bu jimgina qolib ketmasin.
  console.warn(
    "UPSTASH_REDIS_REST_URL/TOKEN berilmagan — rate-limit faqat bitta instansiya doirasida ishlaydi."
  );
}

const limiterCache = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  let limiter = limiterCache.get(cacheKey);
  if (!limiter && redis) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      analytics: true,
    });
    limiterCache.set(cacheKey, limiter);
  }
  return limiter!;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: boolean; retryAfter: number }> {
  if (redis) {
    const limiter = getLimiter(limit, windowMs);
    const result = await limiter.limit(key);
    return {
      ok: result.success,
      retryAfter: result.success ? 0 : Math.ceil((result.reset - Date.now()) / 1000),
    };
  }

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

/**
 * Ishonchli mijoz IP'sini ajratib oladi.
 *
 * `x-forwarded-for` header'ini mijozning O'ZI ham yuborishi mumkin, proksi esa
 * unga haqiqiy IP'ni faqat OXIRIGA qo'shadi. Shuning uchun ro'yxatning birinchi
 * qiymatiga tayanish xato edi: `X-Forwarded-For: 1.2.3.4` deb yuborilgan har bir
 * so'rov yangi "IP" bo'lib ko'rinib, parol sinash va boshqa chegaralarni
 * butunlay aylanib o'tish mumkin edi. Ishonchli qiymat — OXIRGI element: uni
 * proksining o'zi qo'shadi va mijozdan kelgan matnga aralashib ketmaydi.
 */
function pickClientIp(pick: (key: string) => string | undefined): string {
  const last = (value: string): string | null => {
    const chain = value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    return chain.length > 0 ? chain[chain.length - 1] : null;
  };

  const forwarded = pick("x-forwarded-for");
  if (forwarded) {
    const ip = last(forwarded);
    if (ip) return ip;
  }

  // Vercel o'zi qo'shadigan sarlavha — mijoz yozgan qiymat saqlanmaydi
  const vercelForwarded = pick("x-vercel-forwarded-for");
  if (vercelForwarded) {
    const ip = last(vercelForwarded);
    if (ip) return ip;
  }

  return pick("x-real-ip") ?? "unknown";
}

export function clientIp(request: Request): string {
  return pickClientIp((key) => request.headers.get(key) ?? undefined);
}

export function clientIpFromHeaders(headers: Record<string, unknown> | undefined): string {
  if (!headers) return "unknown";

  return pickClientIp((key) => {
    const value = headers[key] ?? headers[key.toLowerCase()] ?? headers[key.toUpperCase()];
    // Takrorlangan sarlavha massiv bo'lib kelishi mumkin — u holda ham
    // ro'yxatni yaxlit holda ko'rib chiqamiz.
    return Array.isArray(value)
      ? value.join(", ")
      : typeof value === "string"
        ? value
        : undefined;
  });
}