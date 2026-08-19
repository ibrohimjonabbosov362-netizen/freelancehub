import Link from "next/link";

export const metadata = { title: "Sahifa topilmadi" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display gradient-text text-7xl font-semibold">404</p>
      <h1 className="mt-4 text-xl font-semibold">Bunday sahifa yo&apos;q</h1>
      <p className="hint mt-2 max-w-sm">
        Havola eskirgan yoki manzil noto&apos;g&apos;ri yozilgan bo&apos;lishi mumkin.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard" className="btn btn-accent">
          Boshqaruv paneliga
        </Link>
        <Link href="/" className="btn btn-ghost">
          Bosh sahifa
        </Link>
      </div>
    </div>
  );
}
