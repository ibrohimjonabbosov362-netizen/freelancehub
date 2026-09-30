/**
 * Qo'llab-quvvatlash manzili muhit o'zgaruvchisidan olinadi — shaxsiy email kod
 * ichida qotib qolmasin va uni almashtirish uchun qayta deploy kerak bo'lmasin.
 *
 * Berilmasa, tegishli havolalar umuman chizilmaydi (ijtimoiy tarmoqlar bilan bir
 * xil qoida): mavjud bo'lmagan manzilga tugma qo'ymaymiz.
 */
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || null;