"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";
import { BusinessType } from "@prisma/client";

export async function updateSettings(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: (formData.get("fullName") as string) || null,
      businessName: (formData.get("businessName") as string) || null,
      businessType: formData.get("businessType") as BusinessType,
      taxReserveRate: parseFloat(formData.get("taxReserveRate") as string) / 100,
      pensionRate: parseFloat(formData.get("pensionRate") as string) / 100,
      invoicePrefix: (formData.get("invoicePrefix") as string) || "INV",
      paymentTerms: parseInt(formData.get("paymentTerms") as string) || 30,
      invoiceNotes: (formData.get("invoiceNotes") as string) || null,
    },
  });
  revalidatePath("/app/settings");
  revalidatePath("/app/dashboard");
}
