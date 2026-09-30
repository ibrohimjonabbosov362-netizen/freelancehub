import { getAppUrl } from "@/lib/stripe";

export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

type Mail = { to: string; subject: string; html: string; text: string };

/** Resend orqali xat yuboradi. Kalit yo'q bo'lsa jimgina o'tkazib yuboradi. */
export async function sendMail(mail: Mail): Promise<boolean> {
  if (!isMailConfigured()) {
    console.warn("Email xizmati sozlanmagan, xat yuborilmadi:", mail.subject);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM,
        to: [mail.to],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      }),
    });

    if (!res.ok) {
      console.error("Resend xatosi:", res.status, await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Xat yuborishda xatolik:", error);
    return false;
  }
}

function layout(title: string, body: string, action?: { url: string; label: string }) {
  return `<!doctype html><html><body style="margin:0;background:#f6f6f9;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:520px;background:#fff;border-radius:12px;padding:32px" cellpadding="0" cellspacing="0">
<tr><td style="font-size:18px;font-weight:700;color:#111827;padding-bottom:20px">Freelance<span style="color:#7c3aed">Hub</span></td></tr>
<tr><td style="font-size:20px;font-weight:600;color:#111827;padding-bottom:12px">${title}</td></tr>
<tr><td style="font-size:14px;line-height:1.7;color:#4b5563">${body}</td></tr>
${action ? `<tr><td style="padding-top:24px"><a href="${action.url}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">${action.label}</a></td></tr>
<tr><td style="padding-top:20px;font-size:12px;color:#9ca3af;word-break:break-all">Tugma ishlamasa, shu manzilni brauzerga nusxalang:<br>${action.url}</td></tr>` : ""}
<tr><td style="padding-top:28px;border-top:1px solid #e5e7eb;margin-top:24px;font-size:12px;color:#9ca3af">FreelanceHub — frilanserlar uchun ish maydoni</td></tr>
</table></td></tr></table></body></html>`;
}

export function passwordResetMail(to: string, token: string): Mail {
  // Token manzilning `#` qismida ketadi (query parametrida emas): u server
  // loglariga, Referer sarlavhasiga va analitika yozuvlariga tushmaydi.
  const url = `${getAppUrl()}/reset-password#token=${token}`;

  return {
    to,
    subject: "Parolni tiklash — FreelanceHub",
    html: layout(
      "Parolni tiklash",
      "Hisobingiz parolini tiklash so'raldi. Quyidagi tugma orqali yangi parol o'rnating. Havola <strong>1 soat</strong> davomida amal qiladi.<br><br>Agar bu so'rovni siz yubormagan bo'lsangiz, bu xatni e'tiborsiz qoldiring — parolingiz o'zgarmaydi.",
      { url, label: "Yangi parol o'rnatish" }
    ),
    text: `Parolni tiklash uchun quyidagi manzilga o'ting (1 soat amal qiladi):\n${url}\n\nAgar so'rovni siz yubormagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.`,
  };
}
