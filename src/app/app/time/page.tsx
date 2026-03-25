import { getCurrentUser } from "@/lib/get-user";
import { prisma } from "@/lib/prisma";
import { TimeClient } from "./time-client";
import { redirect } from "next/navigation";

export default async function TimePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [timeEntries, clients] = await Promise.all([
    prisma.timeEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      include: { client: { select: { id: true, name: true } } },
    }),
    prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return <TimeClient timeEntries={timeEntries} clients={clients} />;
}
