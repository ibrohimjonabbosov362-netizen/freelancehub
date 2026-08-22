import LegalLayout from "../LegalLayout";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "/terms",
  "Foydalanish shartlari",
  "FreelanceHub xizmatidan foydalanish qoidalari."
);

export default function TermsPage() {
  return (
    <LegalLayout title="Foydalanish shartlari" updated="19.08.2026">
      <div className="notice">
        <strong>Diqqat:</strong> bu hujjat namuna sifatida tayyorlangan.
        Tijoriy ishga tushirishdan oldin yurist ko&apos;rigidan o&apos;tkazing.
      </div>

      <h2>1. Shartlarni qabul qilish</h2>
      <p>
        FreelanceHub&apos;da hisob ochish yoki xizmatdan foydalanish orqali siz
        ushbu shartlarga rozilik bildirasiz. Rozi bo&apos;lmasangiz, xizmatdan
        foydalanmang.
      </p>

      <h2>2. Xizmat tavsifi</h2>
      <p>
        FreelanceHub — frilanserlarga mijozlar, takliflar, loyihalar, shartnomalar
        va to&apos;lov yozuvlarini yuritishga yordam beruvchi veb-platforma.
        Xizmat &laquo;qanday bo&apos;lsa shundayligicha&raquo; taqdim etiladi.
      </p>

      <h2>3. Hisob</h2>
      <ul>
        <li>Ro&apos;yxatdan o&apos;tishda to&apos;g&apos;ri ma&apos;lumot berishingiz kerak.</li>
        <li>Parolingiz maxfiyligi uchun siz javobgarsiz.</li>
        <li>Bitta shaxs uchun bitta hisob. Hisobni boshqaga berish taqiqlanadi.</li>
        <li>18 yoshga to&apos;lmagan shaxslar xizmatdan foydalana olmaydi.</li>
      </ul>

      <h2>4. Tariflar va to&apos;lov</h2>
      <ul>
        <li><strong>Bepul tarif:</strong> 3 tagacha mijoz, asosiy funksiyalar.</li>
        <li><strong>Premium:</strong> cheksiz mijoz, shartnoma shablonlari, PDF eksport.</li>
        <li>Obuna oylik asosda avtomatik uzayadi va kartangizdan avtomatik yechiladi.</li>
        <li>Obunani istalgan vaqtda bekor qilishingiz mumkin — u joriy davr oxirigacha amal qiladi.</li>
        <li>To&apos;lovlar Stripe orqali amalga oshiriladi.</li>
      </ul>

      <h2>5. Pulni qaytarish</h2>
      <p>
        Obuna to&apos;lovi amalga oshirilgandan keyin <strong>14 kun</strong> ichida
        murojaat qilsangiz va xizmatdan jiddiy foydalanmagan bo&apos;lsangiz, to&apos;lov
        qaytariladi. Keyingi davrlar uchun to&apos;langan summa qaytarilmaydi.
      </p>

      <h2>6. Foydalanuvchi mazmuni</h2>
      <p>
        Siz kiritgan barcha ma&apos;lumotlar (mijozlar, shartnoma matnlari va
        boshqalar) <strong>sizga tegishli</strong> bo&apos;lib qoladi. Biz ularni faqat
        xizmatni ko&apos;rsatish uchun qayta ishlaymiz. Kiritilgan ma&apos;lumotning
        qonuniyligi uchun siz javobgarsiz.
      </p>
      <p>
        Xizmat orqali yaratilgan shartnoma matnlari <strong>yuridik maslahat emas</strong>.
        Muhim bitimlar uchun yurist bilan maslahatlashing.
      </p>

      <h2>7. Taqiqlangan harakatlar</h2>
      <ul>
        <li>Xizmatga ruxsatsiz kirishga urinish yoki uni buzishga harakat qilish;</li>
        <li>avtomatlashtirilgan vositalar bilan ortiqcha yuk berish;</li>
        <li>boshqalarning ma&apos;lumotlariga kirishga urinish;</li>
        <li>qonunga zid mazmun joylash.</li>
      </ul>

      <h2>8. Xizmatni to&apos;xtatish</h2>
      <p>
        Ushbu shartlar buzilgan taqdirda hisobingizni ogohlantirishsiz to&apos;xtatib
        qo&apos;yish huquqini saqlab qolamiz. Siz ham istalgan vaqtda hisobingizni
        o&apos;chirishingiz mumkin.
      </p>

      <h2>9. Javobgarlik chegarasi</h2>
      <p>
        Xizmat uzluksiz yoki xatosiz ishlashiga kafolat bermaymiz. Ma&apos;lumot
        yo&apos;qolishi, foyda ko&apos;rilmasligi yoki bilvosita zarar uchun
        javobgarlik qonun ruxsat etgan darajada cheklanadi. Muhim
        ma&apos;lumotlarning zaxira nusxasini saqlashni tavsiya qilamiz.
      </p>

      <h2>10. O&apos;zgartirishlar</h2>
      <p>
        Shartlar o&apos;zgarishi mumkin. Jiddiy o&apos;zgarishlar haqida email orqali
        xabar beramiz. O&apos;zgarishdan keyin xizmatdan foydalanishda davom etish
        yangi shartlarni qabul qilish deb hisoblanadi.
      </p>

      <h2>11. Aloqa</h2>
      <p>
        Savollar: <a href="mailto:ibrohimjonabbosov362@gmail.com">ibrohimjonabbosov362@gmail.com</a>
      </p>
    </LegalLayout>
  );
}
