# FreelanceHub

Frilanserlar uchun mijozlar, takliflar, loyihalar, shartnomalar va to'lovlarni bitta panelda boshqarish platformasi.

**Texnologiyalar:** Next.js 16 (App Router) · React 19 · TypeScript · Prisma 6 + PostgreSQL · NextAuth v4 · Tailwind CSS 3 · Stripe

---

## Ishga tushirish

```bash
npm install
cp .env.example .env      # so'ng .env ni to'ldiring
npx prisma generate
npx prisma migrate deploy # yoki dev uchun: npx prisma migrate dev
npm run dev
```

Ilova: http://localhost:3000

### Muhit o'zgaruvchilari

| O'zgaruvchi | Majburiy | Tavsif |
|---|---|---|
| `DATABASE_URL` | ha | Ilova ulanadigan baza (Supabase'da pooler, 6543-port) |
| `DIRECT_URL` | ha | Migratsiyalar uchun to'g'ridan-to'g'ri ulanish (5432-port) |
| `NEXTAUTH_SECRET` | ha | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ha | Masalan `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | yo'q | Bo'lmasa Premium o'chiq, qolgani ishlaydi |
| `STRIPE_PRICE_ID` | yo'q | Premium obuna narxi (`price_...`) |
| `STRIPE_WEBHOOK_SECRET` | yo'q | Webhook siri (`whsec_...`) |
| `NEXT_PUBLIC_APP_URL` | yo'q | Checkout'dan qaytish manzili |

> ⚠️ `.env` da bir o'zgaruvchini ikki marta yozmang — **oxirgisi kuchga kiradi** va yuqoridagisini jimgina bekor qiladi.

---

## Stripe'ni sozlash (Premium tarif)

Stripe kalitlarisiz ham ilova to'liq ishlaydi — faqat "Premium'ga o'tish" tugmasi
"To'lov tizimi sozlanmagan" deb javob beradi.

**1. Mahsulot va narx yarating**
[Stripe Dashboard → Products](https://dashboard.stripe.com/test/products) da takrorlanuvchi (recurring)
narx yarating va `price_...` ID'sini `STRIPE_PRICE_ID` ga yozing.

**2. Maxfiy kalit**
[API keys](https://dashboard.stripe.com/test/apikeys) dan `sk_test_...` ni `STRIPE_SECRET_KEY` ga yozing.

**3. Webhook (lokal ishlab chiqishda)**
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Buyruq bergan `whsec_...` ni `STRIPE_WEBHOOK_SECRET` ga yozing.

**4. Webhook (productionda)**
Dashboard → Webhooks → endpoint qo'shing: `https://sizning-domen.uz/api/stripe/webhook`.
Kerakli hodisalar:
`checkout.session.completed`, `customer.subscription.created`,
`customer.subscription.updated`, `customer.subscription.deleted`.

**5. Sinash** — test kartasi `4242 4242 4242 4242`, istalgan kelajak sana va CVC.

---

## Loyiha tuzilishi

```
app/
  api/
    auth/[...nextauth]/   NextAuth
    register/             Ro'yxatdan o'tish
    clients/              Mijozlar CRUD
    proposals/            Takliflar (ACCEPTED bo'lsa loyiha avtomatik yaratiladi)
    projects/[id]/        Loyiha, uning to'lovlari va shartnomasi
    payments/[id]/        To'lov holati
    subscription/         Joriy tarif
    stripe/               checkout · portal · webhook
  dashboard/  clients/  proposals/  projects/  billing/  pricing/
lib/
  prisma.ts       Prisma klienti (dev'da qayta ishlatiladi)
  auth.ts         NextAuth sozlamalari
  session.ts      getCurrentUserId()
  subscription.ts Tarif tekshiruvi + bepul limit
  payments.ts     Muddati o'tgan to'lovlarni belgilash
  format.ts       Pul va sana formati
proxy.ts          Kirmagan foydalanuvchini /login ga yo'naltiradi
```

## Ish oqimi

1. **Mijoz** qo'shiladi (bepul tarifda 3 tagacha).
2. Mijozga **taklif** yoziladi.
3. Taklif *Qabul qilingan* bo'lsa — **loyiha** avtomatik yaratiladi.
4. Loyiha ichida **shartnoma** yoziladi va imzolanadi (imzolangach matn qulflanadi).
5. Loyihaga **to'lovlar** qo'shiladi; muddati o'tganlari avtomatik *Muddati o'tgan* bo'ladi va boshqaruv panelida ko'rinadi.

## Buyruqlar

```bash
npm run dev     # ishlab chiqish serveri
npm run build   # production build
npm run start   # production server
npm run lint    # ESLint
npx tsc --noEmit  # tiplarni tekshirish
```
