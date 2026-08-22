import Link from "next/link";
import ContentLayout from "../components/ContentLayout";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  return locale === "en"
    ? pageMetadata(
        "/about",
        "About",
        "FreelanceHub is a workspace for freelancers: clients, proposals, projects, contracts and payments in one place."
      )
    : pageMetadata(
        "/about",
        "Loyiha haqida",
        "FreelanceHub — frilanserlar uchun ish maydoni: mijozlar, takliflar, loyihalar, shartnomalar va to'lovlar bitta joyda."
      );
}

export default async function AboutPage() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const en = locale === "en";

  return (
    <ContentLayout
      title={en ? "About FreelanceHub" : "FreelanceHub haqida"}
      intro={
        en
          ? "Everything you need to run your freelance business — without stitching together five different tools."
          : "Frilanser biznesingizni yuritish uchun kerak bo'lgan hamma narsa — besh xil vositani bir-biriga ulab yurmasdan."
      }
    >
      <h2>{en ? "Why it exists" : "Nima uchun kerak"}</h2>
      <p>
        {en
          ? "Most freelancers keep client details in a messaging app, proposals in a document, the project plan in their head, the contract in a folder somewhere, and payment dates on a sticky note. Nothing is connected, so something always slips."
          : "Ko'pchilik frilanser mijoz ma'lumotini messenjerda, taklifni hujjatda, loyiha rejasini xayolida, shartnomani qaysidir papkada, to'lov sanasini esa qog'ozda saqlaydi. Hech biri bir-biriga bog'lanmagan, shuning uchun doim biror narsa e'tibordan chetda qoladi."}
      </p>
      <p>
        {en
          ? "FreelanceHub connects the whole chain: a client becomes a proposal, an accepted proposal becomes a project, the project carries its contract and its payment schedule."
          : "FreelanceHub butun zanjirni bog'laydi: mijozdan taklif tug'iladi, qabul qilingan taklif loyihaga aylanadi, loyiha esa o'z shartnomasi va to'lov jadvalini o'zi bilan olib yuradi."}
      </p>

      <h2>{en ? "The workflow" : "Ish oqimi"}</h2>
      <ul>
        <li>
          <strong>{t.projectDetail.stepClient}</strong> →{" "}
          {en
            ? "contact details, company, status and internal notes."
            : "kontakt, kompaniya, holat va ichki eslatmalar."}
        </li>
        <li>
          <strong>{t.projectDetail.stepProposal}</strong> →{" "}
          {en
            ? "title, scope and amount; you track it from draft to accepted."
            : "sarlavha, hajm va summa; qoralamadan qabul qilingangacha kuzatasiz."}
        </li>
        <li>
          <strong>{t.projectDetail.stepProject}</strong> →{" "}
          {en
            ? "created automatically when a proposal is accepted."
            : "taklif qabul qilinganda avtomatik ochiladi."}
        </li>
        <li>
          <strong>{t.projectDetail.stepContract}</strong> →{" "}
          {en
            ? "written inside the project, moves from draft to signed."
            : "loyiha ichida yoziladi, qoralamadan imzolangangacha o'tadi."}
        </li>
        <li>
          <strong>{t.projectDetail.stepPayment}</strong> →{" "}
          {en
            ? "a schedule per project; overdue items are flagged automatically."
            : "har loyihaga jadval; muddati o'tganlari avtomatik belgilanadi."}
        </li>
      </ul>

      <h2>{en ? "Who it is for" : "Kimlar uchun"}</h2>
      <p>{t.landing.audience}</p>

      <h2>{en ? "Honest status" : "Halol holat"}</h2>
      <p>
        {en
          ? "FreelanceHub is a young product built by a small team. Features that are not finished are simply not shown — you will not find a button here that pretends to work."
          : "FreelanceHub — kichik jamoa qo'lidagi yosh mahsulot. Tugallanmagan imkoniyatlar shunchaki ko'rsatilmaydi — bu yerda ishlayotgandek ko'rinadigan, aslida ishlamaydigan tugma yo'q."}
      </p>

      <p>
        <Link href="/register">{t.landing.ctaPrimary} →</Link>
      </p>
    </ContentLayout>
  );
}
