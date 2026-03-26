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
      address: (formData.get("address") as string) || null,
      phone: (formData.get("phone") as string) || null,
      website: (formData.get("website") as string) || null,
      taxReserveRate: parseFloat(formData.get("taxReserveRate") as string) / 100,
      pensionRate: parseFloat(formData.get("pensionRate") as string) / 100,
      invoicePrefix: (formData.get("invoicePrefix") as string) || "INV",
      paymentTerms: parseInt(formData.get("paymentTerms") as string) || 30,
      invoiceNotes: (formData.get("invoiceNotes") as string) || null,
      paypalEmail: (formData.get("paypalEmail") as string) || null,
      bankName: (formData.get("bankName") as string) || null,
      bankAccountName: (formData.get("bankAccountName") as string) || null,
      bankSortCode: (formData.get("bankSortCode") as string) || null,
      bankAccountNo: (formData.get("bankAccountNo") as string) || null,
      bankIban: (formData.get("bankIban") as string) || null,
    },
  });
  revalidatePath("/app/settings");
  revalidatePath("/app/dashboard");
}
