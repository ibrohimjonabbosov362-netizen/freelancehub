"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

export default function Faq({ stripeReady = false }: { stripeReady?: boolean }) {
  const { locale, t } = useI18n();
  const en = locale === "en";
  const [open, setOpen] = useState<number | null>(0);

  const items = en
    ? [
        { q: "Is FreelanceHub free?", a: "Yes. The free plan lets you manage up to 3 clients with unlimited proposals and projects. No credit card required." },
        { q: "Who is FreelanceHub for?", a: "Freelance designers, web and software developers, and small creative teams who work directly with clients." },
        { q: "Can I manage multiple clients?", a: "Up to 3 on the free plan. Pro removes the limit entirely." },
        { q: "Can I manage projects?", a: "Yes. Accepted proposals become projects automatically, and you move them across a board from backlog to completed." },
        { q: "Can I track payments?", a: "Yes. Add a payment schedule to any project. Overdue items are flagged automatically and surface on your dashboard." },
        {
          q: "Can I upgrade to Pro?",
          a: stripeReady
            ? "Yes — from the Billing page. Pro adds unlimited clients, contract templates and PDF export."
            : "Not yet: online payment is not switched on for this installation, so Pro cannot be purchased at the moment. Everything on the free plan works normally.",
        },
        {
          q: "How does billing work?",
          a: stripeReady
            ? "Pro is billed through Stripe and renews automatically. You can cancel any time and keep access until the period ends."
            : "Once payment is switched on, Pro will be billed through Stripe and renew automatically, with cancellation any time. Nothing is charged today.",
        },
      ]
    : [
        { q: "FreelanceHub bepulmi?", a: "Ha. Bepul tarifda 3 tagacha mijoz, cheksiz taklif va loyiha bilan ishlaysiz. Karta talab qilinmaydi." },
        { q: "Kimlar uchun?", a: "Frilanser dizaynerlar, veb va dastur ishlab chiquvchilar hamda mijoz bilan bevosita ishlaydigan kichik ijodiy jamoalar uchun." },
        { q: "Bir nechta mijoz bilan ishlay olamanmi?", a: "Bepul tarifda 3 tagacha. Premium tarifda cheklov umuman yo'q." },
        { q: "Loyihalarni boshqarish mumkinmi?", a: "Ha. Qabul qilingan taklif avtomatik loyihaga aylanadi va uni doskada rejadan tugallanganga qadar surib borasiz." },
        { q: "To'lovlarni kuzata olamanmi?", a: "Ha. Har bir loyihaga to'lov jadvali qo'shiladi. Muddati o'tganlari avtomatik belgilanadi va panelda ko'rinadi." },
        {
          q: "Premium'ga qanday o'taman?",
          a: stripeReady
            ? "Tarif sahifasidan. Premium cheksiz mijoz, shartnoma shablonlari va PDF eksportni ochadi."
            : "Hozircha yo'q: bu o'rnatmada onlayn to'lov yoqilmagan, shuning uchun Premium'ni sotib bo'lmaydi. Bepul tarifdagi hamma narsa odatdagidek ishlaydi.",
        },
        {
          q: "To'lov qanday amalga oshadi?",
          a: stripeReady
            ? "Premium Stripe orqali to'lanadi va avtomatik uzayadi. Istalgan vaqtda bekor qilsangiz, davr oxirigacha amal qiladi."
            : "To'lov yoqilgach, Premium Stripe orqali to'lanadi va avtomatik uzayadi; istalgan vaqtda bekor qilish mumkin bo'ladi. Bugun hech qanday pul yechilmaydi.",
        },
      ];

  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <h2 className="font-display mb-10 text-center text-3xl font-semibold tracking-tight">
        {t.landing.faqTitle}
      </h2>

      <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)]">
        {items.map((item, i) => (
          <div key={item.q}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-[var(--surface)]"
            >
              {item.q}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                   strokeLinecap="round" aria-hidden="true"
                   className={`h-4 w-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
                   style={{ color: "var(--faint)" }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {open === i && (
              <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
