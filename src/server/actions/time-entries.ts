"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export async function createTimeEntry(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const entryType = (formData.get("entryType") as string) || "HOURLY";
  const isDaily = entryType === "DAILY";
  await prisma.timeEntry.create({
    data: {
      userId: user.id,
      clientId: formData.get("clientId") as string,
      project: (formData.get("project") as string) || null,
      date: new Date(formData.get("date") as string),
      hours: isDaily ? 0 : parseFloat(formData.get("hours") as string),
      rate: isDaily ? 0 : parseFloat(formData.get("rate") as string),
      entryType,
      dayRate: isDaily ? parseFloat(formData.get("dayRate") as string) : 0,
      days: isDaily ? parseFloat(formData.get("days") as string) : 0,
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath("/app/time");
}

export async function updateTimeEntry(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const entryType = (formData.get("entryType") as string) || "HOURLY";
  const isDaily = entryType === "DAILY";
  await prisma.timeEntry.updateMany({
    where: { id, userId: user.id },
    data: {
      clientId: formData.get("clientId") as string,
      project: (formData.get("project") as string) || null,
      date: new Date(formData.get("date") as string),
      hours: isDaily ? 0 : parseFloat(formData.get("hours") as string),
      rate: isDaily ? 0 : parseFloat(formData.get("rate") as string),
      entryType,
      dayRate: isDaily ? parseFloat(formData.get("dayRate") as string) : 0,
      days: isDaily ? parseFloat(formData.get("days") as string) : 0,
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
