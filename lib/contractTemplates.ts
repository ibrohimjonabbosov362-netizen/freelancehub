// Premium foydalanuvchilar uchun tayyor shartnoma matnlari.

export type TemplateContext = {
  freelancerName: string;
  clientName: string;
  clientCompany: string | null;
  projectTitle: string;
  amount: string;
  date: string;
};

export type ContractTemplate = {
  id: string;
  name: string;
  description: string;
  build: (ctx: TemplateContext) => string;
};

const party = (ctx: TemplateContext) =>
  ctx.clientCompany ? `${ctx.clientName} (${ctx.clientCompany})` : ctx.clientName;

export const contractTemplates: ContractTemplate[] = [
  {
    id: "standard",
    name: "Standart xizmat shartnomasi",
    description: "Ko'pchilik loyihalar uchun umumiy shartlar",
    build: (ctx) => `XIZMAT KO'RSATISH SHARTNOMASI

Sana: ${ctx.date}

TARAFLAR
Ijrochi: ${ctx.freelancerName}
Buyurtmachi: ${party(ctx)}

1. SHARTNOMA PREDMETI
Ijrochi "${ctx.projectTitle}" loyihasi doirasidagi ishlarni bajarish,
Buyurtmachi esa qabul qilib olish va haq to'lash majburiyatini oladi.

2. ISH HAJMI
2.1. Ishlar taraflar kelishgan texnik topshiriq asosida bajariladi.
2.2. Texnik topshiriqqa kirmagan qo'shimcha ishlar alohida kelishiladi.

3. MUDDATLAR
3.1. Ishlar boshlanish sanasi: ${ctx.date}.
3.2. Har bir bosqich muddati taraflar tomonidan yozma kelishiladi.

4. TO'LOV
4.1. Ishlar umumiy qiymati: ${ctx.amount}.
4.2. To'lovlar shartnomaga ilova qilingan jadval asosida amalga oshiriladi.
4.3. To'lov kechiktirilsa, Ijrochi ishlarni to'xtatib turishga haqli.

5. HUQUQLAR
5.1. To'liq to'lov amalga oshirilgach, natijaga bo'lgan mulkiy huquqlar
     Buyurtmachiga o'tadi.
5.2. Ijrochi ishni o'z portfoliosida ko'rsatish huquqini saqlab qoladi.

6. MAXFIYLIK
Taraflar loyiha davomida bir-biri haqida bilgan tijorat ma'lumotlarini
uchinchi shaxslarga oshkor qilmaslik majburiyatini oladi.

7. SHARTNOMANI BEKOR QILISH
Har bir taraf 10 kun oldin yozma xabar berib shartnomani bekor qilishi mumkin.
Bunda bajarilgan ish hajmiga mos to'lov amalga oshiriladi.

IMZOLAR
Ijrochi: ${ctx.freelancerName} ______________
Buyurtmachi: ${ctx.clientName} ______________`,
  },
  {
    id: "fixed-price",
    name: "Qat'iy narxli loyiha",
    description: "Boshidan aniq hajm va aniq summa belgilangan ishlar uchun",
    build: (ctx) => `QAT'IY NARXLI LOYIHA SHARTNOMASI

Sana: ${ctx.date}
Loyiha: ${ctx.projectTitle}

TARAFLAR
Ijrochi: ${ctx.freelancerName}
Buyurtmachi: ${party(ctx)}

1. QIYMAT
1.1. Loyihaning qat'iy qiymati: ${ctx.amount}.
1.2. Bu summa kelishilgan ish hajmini to'liq qamrab oladi va
     hajm o'zgarmasa qayta ko'rib chiqilmaydi.

2. TO'LOV TARTIBI
2.1. Avans: 50% — ishlar boshlanishidan oldin.
2.2. Yakuniy to'lov: 50% — ishlar topshirilgandan so'ng 5 kun ichida.

3. TUZATISHLAR
3.1. Kelishilgan hajm doirasida 2 (ikki) marta bepul tuzatish kiritiladi.
3.2. Undan keyingi yoki hajmdan tashqari tuzatishlar alohida to'lanadi.

4. TOPSHIRISH VA QABUL
4.1. Ijrochi ishni topshirgach, Buyurtmachi 5 kun ichida qabul qiladi
     yoki asosli e'tirozlarini yozma bildiradi.
4.2. 5 kun ichida javob bo'lmasa, ish qabul qilingan hisoblanadi.

5. KECHIKISH
Buyurtmachi tomonidan zarur materiallar kechiktirilsa, topshirish
muddati shunga mos ravishda suriladi.

IMZOLAR
Ijrochi: ${ctx.freelancerName} ______________
Buyurtmachi: ${ctx.clientName} ______________`,
  },
  {
    id: "retainer",
    name: "Oylik abonent xizmati",
    description: "Uzluksiz, oyma-oy davom etadigan hamkorlik uchun",
    build: (ctx) => `OYLIK ABONENT XIZMATI SHARTNOMASI

Sana: ${ctx.date}
Xizmat: ${ctx.projectTitle}

TARAFLAR
Ijrochi: ${ctx.freelancerName}
Buyurtmachi: ${party(ctx)}

1. XIZMAT
1.1. Ijrochi har oy kelishilgan hajmda xizmat ko'rsatadi.
1.2. Oylik hajm va ustuvorliklar har oy boshida kelishiladi.

2. TO'LOV
2.1. Oylik to'lov: ${ctx.amount}.
2.2. To'lov har oyning boshida, oldindan amalga oshiriladi.
2.3. Ishlatilmagan soatlar keyingi oyga o'tmaydi.

3. MUDDAT
3.1. Shartnoma 1 (bir) oy muddatga tuziladi va taraflar e'tiroz
     bildirmasa avtomatik uzayadi.
3.2. Bekor qilish uchun 30 kun oldin yozma xabar beriladi.

4. JAVOB BERISH MUDDATI
Ijrochi ish kunlari davomida murojaatlarga 24 soat ichida javob beradi.

IMZOLAR
Ijrochi: ${ctx.freelancerName} ______________
Buyurtmachi: ${ctx.clientName} ______________`,
  },
];

export function getTemplate(id: string): ContractTemplate | undefined {
  return contractTemplates.find((t) => t.id === id);
}
