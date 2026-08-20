/**
 * Stripe webhook va Premium mantiqini haqiqiy Stripe hisobisiz tekshiradi.
 *
 * Stripe SDK'ning imzo generatoridan foydalanib, xuddi Stripe yuborgandek
 * imzolangan hodisa yuboradi. Shu tariqa eng xavfli qism — obunani yoqish va
 * o'chirish — kalitlarsiz ham sinaladi.
 *
 * Ishlatish (ilova ishlab turgan bo'lishi kerak):
 *
 *   STRIPE_SECRET_KEY=sk_test_xxx \
 *   STRIPE_WEBHOOK_SECRET=whsec_xxx \
 *   QA_CONFIRM=1 node scripts/test-stripe-webhook.mjs
 *
 * Kalitlar hali yo'q bo'lsa, soxta qiymat berish kifoya — bu sinov Stripe
 * serveriga umuman chiqmaydi:
 *
 *   STRIPE_SECRET_KEY=sk_test_fake STRIPE_WEBHOOK_SECRET=whsec_fake \
 *   QA_CONFIRM=1 node scripts/test-stripe-webhook.mjs
 *
 * DIQQAT: skript bazada vaqtincha test hisobi yaratadi va oxirida o'chiradi.
 */

import "dotenv/config";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

if (process.env.QA_CONFIRM !== "1") {
  console.error(
    "Bu skript bazada vaqtincha test hisobi yaratadi.\n" +
      "Rozi bo'lsangiz QA_CONFIRM=1 bilan qayta ishga tushiring."
  );
  process.exit(1);
}

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3000";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const EMAIL = "stripe-webhook-test@example.invalid";
const PASSWORD = "QaTest12345";

if (!WEBHOOK_SECRET) {
  console.error("STRIPE_WEBHOOK_SECRET berilmagan.");
  process.exit(1);
}

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_fake");

const results = [];
const check = (name, ok, detail = "") =>
  results.push({ ok, line: `${ok ? "OK  " : "XATO"} ${name}${detail ? " — " + detail : ""}` });

async function main() {
  /* ---- test hisobi va sessiya ---- */

  await prisma.user.deleteMany({ where: { email: EMAIL } });

  await fetch(`${BASE}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Webhook Test", email: EMAIL, password: PASSWORD }),
  });

  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) throw new Error("Test hisobi yaratilmadi — ilova ishlayaptimi?");

  const cookiesFrom = (res) =>
    (res.headers.getSetCookie?.() ?? []).map((raw) => {
      const [pair] = raw.split(";");
      const i = pair.indexOf("=");
      return { name: pair.slice(0, i), value: pair.slice(i + 1) };
    });

  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();
  let jar = cookiesFrom(csrfRes);

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: jar.map((c) => `${c.name}=${c.value}`).join("; "),
    },
    body: new URLSearchParams({ csrfToken, email: EMAIL, password: PASSWORD, json: "true" }),
  });
  jar = [...jar, ...cookiesFrom(loginRes)];
  const cookie = jar.map((c) => `${c.name}=${c.value}`).join("; ");

  const api = (path, init = {}) =>
    fetch(`${BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Cookie: cookie, ...init.headers },
    });

  /* ---- imzolangan hodisa ---- */

  const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

  const subscriptionEvent = (type, status) => ({
    id: `evt_test_${Math.random().toString(36).slice(2)}`,
    object: "event",
    type,
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: "sub_test_qa",
        object: "subscription",
        customer: "cus_test_qa",
        status,
        metadata: { userId: user.id },
        items: {
          object: "list",
          data: [{ id: "si_test_qa", object: "subscription_item", current_period_end: periodEnd }],
        },
      },
    },
  });

  async function postWebhook(event, { forge = false } = {}) {
    const payload = JSON.stringify(event);
    let header = stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
    if (forge) header = header.replace(/v1=[a-f0-9]+/, `v1=${"0".repeat(64)}`);

    const res = await fetch(`${BASE}/api/stripe/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "stripe-signature": header },
      body: payload,
    });
    return res.status;
  }

  /* ---- 1. Obunani yoqish ---- */

  check(
    "webhook: customer.subscription.created",
    (await postWebhook(subscriptionEvent("customer.subscription.created", "active"))) === 200
  );

  const afterCreate = await prisma.subscription.findUnique({ where: { userId: user.id } });
  check("tarif PREMIUM bo'ldi", afterCreate?.plan === "PREMIUM", `plan=${afterCreate?.plan}`);
  check("stripeCustomerId saqlandi", afterCreate?.stripeCustomerId === "cus_test_qa");
  check("amal qilish muddati yozildi", Boolean(afterCreate?.currentPeriodEnd));

  const sub = await (await api("/api/subscription")).json();
  check("/api/subscription isPremium", sub.isPremium === true);
  check("mijoz chegarasi olib tashlandi", sub.clientLimit === null);

  /* ---- 2. Premium imkoniyatlari ---- */

  let created = 0;
  for (let i = 1; i <= 4; i++) {
    const res = await api("/api/clients", {
      method: "POST",
      body: JSON.stringify({ name: `Test mijoz ${i}`, email: `qa${i}@example.invalid` }),
    });
    if (res.status === 201) created += 1;
  }
  check("Premium'da 4 ta mijoz qo'shildi", created === 4, `${created} ta`);

  const clients = await (await api("/api/clients")).json();
  const project = await (
    await api("/api/projects", {
      method: "POST",
      body: JSON.stringify({ clientId: clients[0].id, title: "QA loyiha" }),
    })
  ).json();
  await api(`/api/projects/${project.id}/contract`, {
    method: "PUT",
    body: JSON.stringify({ content: "QA shartnoma matni", title: "QA" }),
  });

  const printPremium = await fetch(`${BASE}/projects/${project.id}/print`, {
    headers: { Cookie: cookie },
    redirect: "manual",
  });
  check("PDF eksport Premium'da ochiq", printPremium.status === 200, `HTTP ${printPremium.status}`);

  /* ---- 3. Obunani bekor qilish ---- */

  check(
    "webhook: customer.subscription.deleted",
    (await postWebhook(subscriptionEvent("customer.subscription.deleted", "canceled"))) === 200
  );

  const afterDelete = await prisma.subscription.findUnique({ where: { userId: user.id } });
  check("tarif FREE ga qaytdi", afterDelete?.plan === "FREE", `plan=${afterDelete?.plan}`);

  const subAfter = await (await api("/api/subscription")).json();
  check("chegara qaytdi", subAfter.clientLimit === 3, `clientLimit=${subAfter.clientLimit}`);

  const printFree = await fetch(`${BASE}/projects/${project.id}/print`, {
    headers: { Cookie: cookie },
    redirect: "manual",
  });
  check("PDF eksport bepulda yopiq", printFree.status === 307, `HTTP ${printFree.status}`);

  /* ---- 4. Soxta imzo ---- */

  check(
    "soxta imzo rad etildi",
    (await postWebhook(subscriptionEvent("customer.subscription.created", "active"), { forge: true })) === 400
  );

  const noSig = await fetch(`${BASE}/api/stripe/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  check("imzosiz so'rov rad etildi", noSig.status === 400, `HTTP ${noSig.status}`);

  const stillFree = await prisma.subscription.findUnique({ where: { userId: user.id } });
  check("soxta hodisa tarifni o'zgartirmadi", stillFree?.plan === "FREE");

  /* ---- 5. checkout / portal himoyalari ---- */

  const noAuth = (path) =>
    fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });

  check("checkout: sessiyasiz 401", (await noAuth("/api/stripe/checkout")).status === 401);
  check("portal: sessiyasiz 401", (await noAuth("/api/stripe/portal")).status === 401);
}

let failed = 0;

try {
  await main();
} catch (error) {
  console.error("\nSinov to'xtadi:", error.message);
  failed = 1;
} finally {
  await prisma.user.deleteMany({ where: { email: EMAIL } });
  await prisma.$disconnect();
}

console.log("\n=== STRIPE WEBHOOK SINOVI ===");
results.forEach((r) => console.log(" " + r.line));

const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} muvaffaqiyatli · test hisobi o'chirildi`);

process.exit(failed || passed === results.length ? failed : 1);
