import Link from "next/link";
import ContentLayout from "../components/ContentLayout";
import { getDictionary, getLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  const locale = await getLocale();
  return locale === "en"
    ? { title: "Help", description: "Getting started with FreelanceHub and answers to common questions." }
    : { title: "Yordam", description: "FreelanceHub bilan ishni boshlash va tez-tez uchraydigan savollar." };
}

export default async function HelpPage() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const en = locale === "en";

  return (
    <ContentLayout
      title={t.footer.help}
      intro={
        en
          ? "Short answers to the questions that come up most often. If something is still unclear, write to us."
          : "Eng ko'p uchraydigan savollarga qisqa javoblar. Biror narsa tushunarsiz bo'lsa, bizga yozing."
      }
    >
      <h2>{en ? "Getting started" : "Ishni boshlash"}</h2>
      <ul>
        <li>
          {en ? "Create an account at " : "Hisob yarating: "}
          <Link href="/register">/register</Link>
          {en ? " — no card required." : " — karta talab qilinmaydi."}
        </li>
        <li>
          {en ? "Add your first client on the " : "Birinchi mijozni "}
          <Link href="/clients">{t.nav.clients}</Link>
          {en ? " page." : " sahifasida qo'shing."}
        </li>
        <li>
          {en
            ? "Write a proposal for that client. When you mark it Accepted, a project opens automatically."
            : "O'sha mijozga taklif yozing. Uni «Qabul qilingan» deb belgilaganingizda loyiha avtomatik ochiladi."}
        </li>
        <li>
          {en
            ? "Inside the project, write the contract and add the payment schedule."
            : "Loyiha ichida shartnoma yozing va to'lov jadvalini qo'shing."}
        </li>
      </ul>

      <h2>{en ? "Common questions" : "Tez-tez so'raladigan savollar"}</h2>

      <p>
        <strong>{en ? "I forgot my password." : "Parolni unutdim."}</strong>
        <br />
        {en ? "Use " : "«"}
        <Link href="/forgot-password">{t.auth.forgotTitle}</Link>
        {en
          ? ". The reset link is valid for one hour. If no email arrives, the mail service may not be configured on this installation."
          : "» sahifasidan foydalaning. Havola bir soat amal qiladi. Xat kelmasa, bu o'rnatmada pochta xizmati sozlanmagan bo'lishi mumkin."}
      </p>

      <p>
        <strong>{en ? "Why can I only add 3 clients?" : "Nega faqat 3 ta mijoz qo'sha olaman?"}</strong>
        <br />
        {en
          ? "That is the free plan limit. Premium removes it — see "
          : "Bu bepul tarif chegarasi. Premium uni olib tashlaydi — "}
        <Link href="/billing">{t.nav.billing}</Link>
        {en ? "." : " sahifasiga qarang."}
      </p>

      <p>
        <strong>
          {en ? "A payment shows as overdue on its own." : "To'lov o'z-o'zidan «muddati o'tgan» bo'lib qoldi."}
        </strong>
        <br />
        {en
          ? "That is intentional: any unpaid item past its due date is marked overdue automatically and surfaces on the dashboard."
          : "Bu ataylab shunday: muddati o'tgan va to'lanmagan har bir yozuv avtomatik ravishda «muddati o'tgan» bo'ladi va boshqaruv panelida ko'rinadi."}
      </p>

      <p>
        <strong>{en ? "Can I change the interface language?" : "Interfeys tilini o'zgartira olamanmi?"}</strong>
        <br />
        {en
          ? "Yes — the switcher sits at the bottom of the sidebar and in the footer. The choice is remembered in your browser."
          : "Ha — almashtirgich yon panel pastida va footer'da turadi. Tanlov brauzeringizda eslab qolinadi."}
      </p>

      <p>
        <strong>{en ? "I deleted something by mistake." : "Xato bilan biror narsani o'chirdim."}</strong>
        <br />
        {en
          ? "Deletion is permanent and there is no undo yet. Deleting a client also removes their proposals, projects, contracts and payments — the confirmation dialog tells you exactly how much will go."
          : "O'chirish qaytarilmaydi, hozircha «bekor qilish» yo'q. Mijozni o'chirsangiz, uning takliflari, loyihalari, shartnomalari va to'lovlari ham ketadi — tasdiqlash oynasi qancha narsa o'chishini aniq aytadi."}
      </p>

      <h2>{en ? "Still stuck?" : "Muammo hal bo'lmadimi?"}</h2>
      <p>
        {en ? "Write to " : "Bizga yozing: "}
        <a href="mailto:ibrohimjonabbosov362@gmail.com">ibrohimjonabbosov362@gmail.com</a>
        {en ? " and describe what you were doing when it went wrong." : " — nima qilayotganingizni va nima bo'lganini yozing."}
      </p>
      <p>
        <Link href="/#faq">{t.landing.faqTitle} →</Link>
      </p>
    </ContentLayout>
  );
}
