import Link from "next/link";

const features = [
  {
    title: "Mijozlar bazasi",
    text: "Har bir mijozning kontakti, takliflari va loyihalari bitta kartada.",
  },
  {
    title: "Takliflardan loyihaga",
    text: "Taklif qabul qilinsa, loyiha avtomatik ochiladi — qo'lda ko'chirish yo'q.",
  },
  {
    title: "Shartnoma va to'lovlar",
    text: "Shartnomani imzolang, to'lov jadvalini tuzing, muddatlarni nazorat qiling.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-6 sm:px-8">
        <span className="font-display text-xl font-semibold">
          Freelance<span className="gradient-text">Hub</span>
        </span>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/pricing" className="link-muted">
            Tariflar
          </Link>
          <Link href="/login" className="link-muted">
            Kirish
          </Link>
        </nav>
      </header>

      <main className="flex-1 px-6 sm:px-8">
        <section className="mx-auto max-w-3xl pt-16 pb-20 text-center sm:pt-24">
          <span className="badge badge-accent mb-6">
            Frilanserlar uchun ish maydoni
          </span>

          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Mijozlaringizni{" "}
            <span className="gradient-text">bitta joyda</span> boshqaring
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--muted)]">
            Mijozlar, takliflar, loyihalar, shartnomalar va to&apos;lovlar —
            WhatsApp va Excel o&apos;rniga bitta panel.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn btn-accent px-7 py-3">
              Bepul boshlash
            </Link>
            <Link href="/pricing" className="btn btn-ghost px-7 py-3">
              Tariflarni ko&apos;rish
            </Link>
          </div>

          <p className="mt-4 text-sm text-[var(--faint)]">
            Karta talab qilinmaydi · 3 tagacha mijoz bepul
          </p>
        </section>

        <section className="mx-auto grid max-w-4xl gap-4 pb-24 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="card card-hover p-6">
              <h2 className="mb-2 font-semibold">{feature.title}</h2>
              <p className="text-sm text-[var(--muted)]">{feature.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-6 text-center text-sm text-[var(--faint)] sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <span>© 2026 FreelanceHub</span>
          <Link href="/privacy" className="link-muted">Maxfiylik siyosati</Link>
          <Link href="/terms" className="link-muted">Foydalanish shartlari</Link>
        </div>
      </footer>
    </div>
  );
}
