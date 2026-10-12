"use client";

import { useState, useSyncExternalStore } from "react";
import { Modal } from "./ui";
import { useI18n } from "@/lib/i18n/client";

// Chrome/Edge/Samsung Internet o'rnatish oynasini shu event orqali beradi
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Mode = "hidden" | "prompt" | "ios";

// Brauzer bu event'ni sahifa hydrate bo'lishidan oldin yuborishi mumkin —
// komponent mount bo'lguncha yo'qolib ketmasin deb modul yuklanishi bilan
// ushlab, kichik global store'da saqlaymiz (header va sidebar bitta event'ni bo'lishadi).
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function setPrompt(value: BeforeInstallPromptEvent | null) {
  deferredPrompt = value;
  listeners.forEach((notify) => notify());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    setPrompt(e as BeforeInstallPromptEvent);
  });
  window.addEventListener("appinstalled", () => setPrompt(null));
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari'ning eski usuli
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  const ua = navigator.userAgent;
  // iPadOS 13+ o'zini Mac deb ko'rsatadi, sensorli ekran orqali ajratamiz
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

function isIosSafari() {
  // Chrome/Firefox/Edge iOS'da o'z belgisini qo'shadi; ularda "Bosh ekranga qo'shish" yo'q
  return !/crios|fxios|edgios|opios/i.test(navigator.userAgent);
}

function getMode(): Mode {
  if (isStandalone()) return "hidden";
  if (isIos()) return "ios";
  return deferredPrompt ? "prompt" : "hidden";
}

// Serverda brauzer haqida hech narsa bilmaymiz — tugma chizilmaydi
const getServerMode = (): Mode => "hidden";

/**
 * "Ilovani o'rnatish" tugmasi.
 * - Android/desktop Chrome: bir bosishda brauzerning o'rnatish oynasi chiqadi.
 * - iPhone: Apple bunday API bermaydi, shuning uchun qadamlar ko'rsatiladi.
 * - Ilova allaqachon o'rnatilgan yoki brauzer qo'llamasa — tugma chizilmaydi.
 */
export default function InstallAppButton({
  variant = "header",
}: {
  variant?: "header" | "sidebar";
}) {
  const { t } = useI18n();
  const mode = useSyncExternalStore(subscribe, getMode, getServerMode);
  const [iosOpen, setIosOpen] = useState(false);

  if (mode === "hidden") return null;

  async function handleClick() {
    if (mode === "ios") {
      setIosOpen(true);
      return;
    }
    const prompt = deferredPrompt;
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    // Event faqat bir marta ishlatiladi
    setPrompt(null);
  }

  const downloadIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
    </svg>
  );

  const steps = [t.install.iosStep1, t.install.iosStep2, t.install.iosStep3];

  return (
    <>
      {variant === "sidebar" ? (
        <button
          onClick={handleClick}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--accent-soft)] transition-colors hover:bg-[var(--surface-2)]"
        >
          {downloadIcon}
          {t.install.button}
        </button>
      ) : (
        <button
          onClick={handleClick}
          aria-label={t.install.button}
          title={t.install.button}
          className="btn btn-ghost btn-sm gap-1.5 px-2 sm:px-3"
        >
          {downloadIcon}
          <span className="hidden sm:inline">{t.install.button}</span>
        </button>
      )}

      <Modal
        open={iosOpen}
        onClose={() => setIosOpen(false)}
        title={t.install.iosTitle}
        description={t.install.iosDescription}
        closeLabel={t.install.done}
        tone="accent"
        footer={
          <button onClick={() => setIosOpen(false)} className="btn btn-accent w-full">
            {t.install.done}
          </button>
        }
      >
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-3)] text-xs font-semibold">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
        {!isIosSafari() && (
          <p className="hint mt-4 text-[var(--warning)]">{t.install.iosNotSafari}</p>
        )}
      </Modal>
    </>
  );
}
