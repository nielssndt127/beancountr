"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/get-user";

export async function createClient(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.client.create({
    data: {
      userId: user.id,
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || null,
      address: (formData.get("address") as string) || null,
      vatId: (formData.get("vatId") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath("/app/clients");
}

export async function updateClient(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.client.updateMany({
    where: { id, userId: user.id },
    data: {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || null,
      address: (formData.get("address") as string) || null,
      vatId: (formData.get("vatId") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath("/app/clients");
}

export async function deleteClient(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.client.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/app/clients");
}
