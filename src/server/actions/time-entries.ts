"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export async function createTimeEntry(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.timeEntry.create({
    data: {
      userId: user.id,
      clientId: formData.get("clientId") as string,
      project: (formData.get("project") as string) || null,
      date: new Date(formData.get("date") as string),
      hours: parseFloat(formData.get("hours") as string),
      rate: parseFloat(formData.get("rate") as string),
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath("/app/time");
}

export async function updateTimeEntry(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.timeEntry.updateMany({
    where: { id, userId: user.id },
    data: {
      clientId: formData.get("clientId") as string,
      project: (formData.get("project") as string) || null,
      date: new Date(formData.get("date") as string),
      hours: parseFloat(formData.get("hours") as string),
      rate: parseFloat(formData.get("rate") as string),
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath("/app/time");
}

export async function deleteTimeEntry(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.timeEntry.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/app/time");
}
