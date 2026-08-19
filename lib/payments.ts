import { prisma } from "@/lib/prisma";

// To'lovlar ro'yxati o'qilishidan oldin chaqiriladi — holat doim dolzarb bo'lsin.
export async function syncOverduePayments(userId: string): Promise<void> {
  await prisma.payment.updateMany({
    where: {
      status: "PENDING",
      dueDate: { lt: new Date() },
      project: { userId },
    },
    data: { status: "OVERDUE" },
  });
}
