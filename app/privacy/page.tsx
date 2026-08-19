import LegalLayout from "../LegalLayout";

export const metadata = {
  title: "Maxfiylik siyosati",
  description: "FreelanceHub qanday ma'lumot to'playdi va uni qanday himoya qiladi.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Maxfiylik siyosati" updated="19.08.2026">
      <div className="notice">
        <strong>Diqqat:</strong> bu hujjat namuna sifatida tayyorlangan.
        Xizmatni tijoriy ishga tushirishdan oldin yurist ko&apos;rigidan
        o&apos;tkazing va kompaniya rekvizitlarini to&apos;ldiring.
      </div>

      <h2>1. Umumiy ma&apos;lumot</h2>
      <p>
        Ushbu siyosat FreelanceHub (keyingi o&apos;rinlarda &laquo;Xizmat&raquo;)
        foydalanuvchilarining shaxsiy ma&apos;lumotlari qanday to&apos;planishi,
        ishlatilishi va himoyalanishini tushuntiradi. Xizmatdan foydalanish
        orqali siz ushbu shartlarga rozilik bildirasiz.
      </p>

      <h2>2. Qanday ma&apos;lumot to&apos;playmiz</h2>
      <ul>
        <li><strong>Hisob ma&apos;lumotlari:</strong> ism, email manzil va parol xeshi.</li>
        <li><strong>Google orqali kirganda:</strong> Google hisobingizdagi ism, email va profil rasmi.</li>
        <li><strong>Siz kiritgan ma&apos;lumotlar:</strong> mijozlar, takliflar, loyihalar, shartnoma matnlari va to&apos;lov yozuvlari.</li>
        <li><strong>Texnik ma&apos;lumotlar:</strong> IP manzil va so&apos;rov vaqti — suiiste&apos;molning oldini olish uchun.</li>
      </ul>
      <p>
        To&apos;lov kartangiz ma&apos;lumotlari <strong>bizda saqlanmaydi</strong> —
        ular to&apos;g&apos;ridan-to&apos;g&apos;ri Stripe tomonidan qayta ishlanadi.
      </p>

      <h2>3. Ma&apos;lumotdan qanday foydalanamiz</h2>
      <ul>
        <li>Xizmatni ko&apos;rsatish va hisobingizni yuritish;</li>
        <li>obuna to&apos;lovlarini amalga oshirish;</li>
        <li>parolni tiklash kabi xizmat xatlarini yuborish;</li>
        <li>xavfsizlikni ta&apos;minlash va suiiste&apos;molni aniqlash.</li>
      </ul>
      <p>
        Ma&apos;lumotlaringizni reklama maqsadida sotmaymiz va uchinchi
        shaxslarga bermaymiz.
      </p>

      <h2>4. Uchinchi tomon xizmatlari</h2>
      <ul>
        <li><strong>Supabase</strong> — ma&apos;lumotlar bazasi;</li>
        <li><strong>Vercel</strong> — hosting;</li>
        <li><strong>Stripe</strong> — to&apos;lovlarni qayta ishlash;</li>
        <li><strong>Resend</strong> — xizmat xatlarini yuborish;</li>
        <li><strong>Google</strong> — ixtiyoriy autentifikatsiya.</li>
      </ul>

      <h2>5. Saqlash muddati va xavfsizlik</h2>
      <p>
        Ma&apos;lumotlar hisobingiz faol bo&apos;lgan davrda saqlanadi. Parollar
        <strong> bcrypt</strong> algoritmi bilan xeshlanadi — ochiq ko&apos;rinishda
        saqlanmaydi. Ulanish HTTPS orqali shifrlanadi. Parolni tiklash havolalari
        1 soatdan keyin kuchini yo&apos;qotadi.
      </p>

      <h2>6. Sizning huquqlaringiz</h2>
      <p>
        Siz istalgan vaqtda ma&apos;lumotlaringizni ko&apos;rish, tuzatish yoki
        hisobingizni o&apos;chirishni so&apos;rash huquqiga egasiz. Hisob
        o&apos;chirilganda unga bog&apos;liq mijoz, taklif, loyiha, shartnoma va
        to&apos;lov yozuvlari ham o&apos;chiriladi.
      </p>

      <h2>7. Cookie fayllari</h2>
      <p>
        Xizmat faqat sessiyani saqlash uchun zarur cookie&apos;lardan foydalanadi.
        Ular sizni kuzatish yoki reklama uchun ishlatilmaydi.
      </p>

      <h2>8. O&apos;zgartirishlar va aloqa</h2>
      <p>
        Siyosat o&apos;zgarganda ushbu sahifadagi sana yangilanadi. Savollar
        bo&apos;yicha: <a href="mailto:ibrohimjonabbosov362@gmail.com">ibrohimjonabbosov362@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
