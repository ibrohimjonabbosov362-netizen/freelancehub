import Link from "next/link";
import ContentLayout from "../components/ContentLayout";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  const locale = await getLocale();
  return locale === "en"
    ? { title: "Documentation", description: "How every part of FreelanceHub works, section by section." }
    : { title: "Hujjatlar", description: "FreelanceHub'ning har bir bo'limi qanday ishlashi." };
}

export default async function DocsPage() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const en = locale === "en";

  return (
    <ContentLayout
      title={t.footer.docs}
      intro={
        en
          ? "A section-by-section reference for how FreelanceHub behaves."
          : "FreelanceHub qanday ishlashi haqida bo'limma-bo'lim ma'lumot."
      }
    >
      <h2>{t.nav.clients}</h2>
      <p>
        {en
          ? "A client holds a name, email, company, phone, status (Active / Pending / Archived) and private notes only you can see. The list shows how many projects each client has and how much they have actually paid — the revenue column counts only payments marked Paid."
          : "Mijozda ism, email, kompaniya, telefon, holat (Faol / Kutilmoqda / Arxivlangan) va faqat siz ko'radigan ichki izohlar saqlanadi. Ro'yxatda har bir mijozning nechta loyihasi borligi va qancha to'lov qilgani ko'rinadi — daromad ustuni faqat «To'langan» deb belgilangan to'lovlarni hisoblaydi."}
      </p>
      <p>
        {en
          ? "The free plan allows 3 clients. Reaching the limit opens an upgrade dialog instead of a raw error."
          : "Bepul tarifda 3 ta mijoz. Chegaraga yetganda quruq xato o'rniga tarifni ko'tarish oynasi ochiladi."}
      </p>

      <h2>{t.nav.proposals}</h2>
      <p>
        {en
          ? "A proposal belongs to one client and carries a title, optional description and an amount. Its status moves Draft → Sent → Accepted or Rejected."
          : "Taklif bitta mijozga tegishli bo'ladi; unda sarlavha, ixtiyoriy tavsif va summa bo'ladi. Holati: Qoralama → Yuborilgan → Qabul qilingan yoki Rad etilgan."}
      </p>
      <p>
        <strong>{en ? "Important: " : "Muhim: "}</strong>
        {en
          ? "marking a proposal Accepted creates a project automatically, in the same transaction. Setting it back does not delete that project."
          : "taklifni «Qabul qilingan» qilsangiz, bitta tranzaksiya ichida loyiha avtomatik yaratiladi. Holatni qaytarish o'sha loyihani o'chirmaydi."}
      </p>

      <h2>{t.nav.projects}</h2>
      <p>
        {en
          ? "Projects have a title, client, optional description and deadline, and a status used by the board: Backlog, To do, In progress, Under review, Completed, Paused. You can view them as a board or as a table."
          : "Loyihada sarlavha, mijoz, ixtiyoriy tavsif va muddat hamda doskada ishlatiladigan holat bo'ladi: Rejada, Boshlanadi, Jarayonda, Ko'rikda, Tugallangan, To'xtatilgan. Doska yoki jadval ko'rinishida ko'rishingiz mumkin."}
      </p>
      <p>
        {en
          ? "Progress is not entered by hand — it is the share of the project's payment schedule that has been paid."
          : "Bajarilganlik qo'lda kiritilmaydi — u loyiha to'lov jadvalining to'langan ulushidan kelib chiqadi."}
      </p>

      <h2>{t.nav.contracts}</h2>
      <p>
        {en
          ? "Each project can have exactly one contract: an optional title and the body text. Status moves Draft → Pending approval → Approved. Signing sets the Approved status and locks the text; removing the signature unlocks it back to Draft."
          : "Har bir loyihada aynan bitta shartnoma bo'ladi: ixtiyoriy nom va matn. Holati: Qoralama → Tasdiq kutilmoqda → Tasdiqlangan. Imzolash holatni «Tasdiqlangan» qiladi va matnni qulflaydi; imzoni bekor qilish uni qoralamaga qaytaradi."}
      </p>
      <p>
        {en
          ? "Ready-made templates and PDF export are Premium features. The PDF is generated from the app itself through the browser's print dialog — no external service sees your contract."
          : "Tayyor shablonlar va PDF eksport — Premium imkoniyatlari. PDF ilovaning o'zida, brauzerning chop etish oynasi orqali tayyorlanadi — shartnomangizni tashqi xizmat ko'rmaydi."}
      </p>

      <h2>{t.nav.payments}</h2>
      <p>
        {en
          ? "Payments are added inside a project: an amount and a due date. Status is Pending, Paid or Overdue. Anything unpaid past its due date becomes Overdue automatically when the data is loaded."
          : "To'lovlar loyiha ichida qo'shiladi: summa va muddat. Holati — Kutilmoqda, To'langan yoki Muddati o'tgan. Muddati o'tgan va to'lanmagan yozuvlar ma'lumot yuklanganda avtomatik «Muddati o'tgan» bo'ladi."}
      </p>

      <h2>{t.nav.billing}</h2>
      <p>
        {en
          ? "Free covers up to 3 clients with everything else unlimited. Premium removes the client limit and unlocks contract templates, PDF export and priority support. Payment runs through Stripe; if Stripe is not configured on this installation, the page says so plainly instead of showing a button that fails."
          : "Bepul tarif 3 tagacha mijozni qamraydi, qolgani cheklanmagan. Premium mijoz chegarasini olib tashlaydi va shartnoma shablonlari, PDF eksport hamda ustuvor qo'llab-quvvatlashni ochadi. To'lov Stripe orqali o'tadi; agar bu o'rnatmada Stripe sozlanmagan bo'lsa, sahifa ishlamaydigan tugma ko'rsatish o'rniga buni ochiq aytadi."}
      </p>

      <h2>{en ? "Data and access" : "Ma'lumot va ruxsat"}</h2>
      <p>
        {en
          ? "Every record belongs to the account that created it. The server checks ownership on every read and every write, so another user's client id in the URL returns Not found, not their data."
          : "Har bir yozuv uni yaratgan hisobga tegishli. Server har bir o'qish va yozishda egalikni tekshiradi, shuning uchun URL'ga boshqa foydalanuvchining mijoz ID'sini yozsangiz, uning ma'lumoti emas, «topilmadi» javobi keladi."}
      </p>

      <h2>{en ? "Language" : "Til"}</h2>
      <p>
        {en
          ? "The interface is available in Uzbek and English, including the generated contract PDF. Your choice is stored in a cookie in your own browser."
          : "Interfeys o'zbek va ingliz tillarida, shu jumladan tayyorlanadigan shartnoma PDF'i ham. Tanlovingiz brauzeringizdagi cookie'da saqlanadi."}
      </p>

      <p>
        <Link href="/help">{t.footer.help} →</Link>
      </p>
    </ContentLayout>
  );
}
