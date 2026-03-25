import { PrismaClient, BusinessType, InvoiceStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo data...");

  // Create a demo user (supabaseUserId would be replaced with real auth)
  const user = await prisma.user.upsert({
    where: { email: "demo@beancountr.com" },
    update: {},
    create: {
      supabaseUserId: "demo-supabase-user-id",
      email: "demo@beancountr.com",
      fullName: "Alex Freeman",
      businessName: "Freeman Digital Ltd",
      businessType: BusinessType.LIMITED_COMPANY,
      taxReserveRate: 0.25,
      pensionRate: 0.10,
      invoicePrefix: "INV",
      paymentTerms: 30,
    },
  });

  // Create 3 clients
  const client1 = await prisma.client.upsert({
    where: { id: "seed-client-1" },
    update: {},
    create: {
      id: "seed-client-1",
      userId: user.id,
      name: "Acme Corp",
      email: "accounts@acme.com",
      address: "1 Business Park, London, EC1A 1BB",
      notes: "Main retainer client",
    },
  });

  const client2 = await prisma.client.upsert({
    where: { id: "seed-client-2" },
    update: {},
    create: {
      id: "seed-client-2",
      userId: user.id,
      name: "TechStart Ltd",
      email: "finance@techstart.io",
      address: "42 Innovation Way, Manchester, M1 2AB",
    },
  });

  const client3 = await prisma.client.upsert({
    where: { id: "seed-client-3" },
    update: {},
    create: {
      id: "seed-client-3",
      userId: user.id,
      name: "Design Co",
      email: "hello@design.co",
      address: "7 Creative Quarter, Bristol, BS1 3CD",
    },
  });

  // Create invoices
  const invoice1 = await prisma.invoice.upsert({
    where: { userId_invoiceNumber: { userId: user.id, invoiceNumber: "INV-001" } },
    update: {},
    create: {
      userId: user.id,
      clientId: client1.id,
      invoiceNumber: "INV-001",
      issueDate: new Date("2024-01-05"),
      dueDate: new Date("2024-02-05"),
      status: InvoiceStatus.PAID,
      subtotal: 4800,
      vatAmount: 0,
      total: 4800,
      notes: "Website redesign — Phase 1",
    },
  });

  const invoice2 = await prisma.invoice.upsert({
    where: { userId_invoiceNumber: { userId: user.id, invoiceNumber: "INV-002" } },
    update: {},
    create: {
      userId: user.id,
      clientId: client2.id,
      invoiceNumber: "INV-002",
      issueDate: new Date("2024-01-15"),
      dueDate: new Date("2024-02-15"),
      status: InvoiceStatus.SENT,
      subtotal: 3200,
      vatAmount: 0,
      total: 3200,
      notes: "API integration work",
    },
  });

  const invoice3 = await prisma.invoice.upsert({
    where: { userId_invoiceNumber: { userId: user.id, invoiceNumber: "INV-003" } },
    update: {},
    create: {
      userId: user.id,
      clientId: client3.id,
      invoiceNumber: "INV-003",
      issueDate: new Date("2024-01-22"),
      dueDate: new Date("2024-02-22"),
      status: InvoiceStatus.DRAFT,
      subtotal: 2250,
      vatAmount: 0,
      total: 2250,
      notes: "Brand guidelines document",
    },
  });

  // Line items
  await prisma.invoiceLineItem.createMany({
    skipDuplicates: true,
    data: [
      { invoiceId: invoice1.id, description: "Website redesign — frontend development", quantity: 32, unitPrice: 90, amount: 2880 },
      { invoiceId: invoice1.id, description: "CMS configuration and content migration", quantity: 24, unitPrice: 80, amount: 1920 },
      { invoiceId: invoice2.id, description: "REST API integration", quantity: 20, unitPrice: 90, amount: 1800 },
      { invoiceId: invoice2.id, description: "Testing and documentation", quantity: 14, unitPrice: 100, amount: 1400 },
      { invoiceId: invoice3.id, description: "Brand guidelines document", quantity: 15, unitPrice: 75, amount: 1125 },
      { invoiceId: invoice3.id, description: "Logo refinements and asset export", quantity: 15, unitPrice: 75, amount: 1125 },
    ],
  });

  // Time entries
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  await prisma.timeEntry.createMany({
    skipDuplicates: true,
    data: [
      { id: "seed-te-1", userId: user.id, clientId: client1.id, project: "Website Redesign", date: new Date(thisMonth.getTime() + 1 * 24 * 60 * 60 * 1000), hours: 4, rate: 90, notes: "Homepage layout" },
      { id: "seed-te-2", userId: user.id, clientId: client1.id, project: "Website Redesign", date: new Date(thisMonth.getTime() + 3 * 24 * 60 * 60 * 1000), hours: 6, rate: 90, notes: "Component library" },
      { id: "seed-te-3", userId: user.id, clientId: client2.id, project: "API Integration", date: new Date(thisMonth.getTime() + 4 * 24 * 60 * 60 * 1000), hours: 5, rate: 90, notes: "Auth endpoints" },
      { id: "seed-te-4", userId: user.id, clientId: client2.id, project: "API Integration", date: new Date(thisMonth.getTime() + 7 * 24 * 60 * 60 * 1000), hours: 4, rate: 90, notes: "Data models" },
      { id: "seed-te-5", userId: user.id, clientId: client3.id, project: "Brand Guidelines", date: new Date(thisMonth.getTime() + 8 * 24 * 60 * 60 * 1000), hours: 3, rate: 75, notes: "Typography exploration" },
      { id: "seed-te-6", userId: user.id, clientId: client1.id, project: "Website Redesign", date: new Date(thisMonth.getTime() + 10 * 24 * 60 * 60 * 1000), hours: 5, rate: 90, notes: "Responsive design" },
      { id: "seed-te-7", userId: user.id, clientId: client3.id, project: "Brand Guidelines", date: new Date(thisMonth.getTime() + 12 * 24 * 60 * 60 * 1000), hours: 4, rate: 75, notes: "Color palette" },
      { id: "seed-te-8", userId: user.id, clientId: client2.id, project: "API Integration", date: new Date(thisMonth.getTime() + 14 * 24 * 60 * 60 * 1000), hours: 6, rate: 90, notes: "Testing + docs" },
    ],
  });

  // Expenses
  await prisma.expense.createMany({
    skipDuplicates: true,
    data: [
      { id: "seed-exp-1", userId: user.id, date: new Date(thisMonth.getTime() + 1 * 24 * 60 * 60 * 1000), category: "Software", description: "Figma subscription", amount: 15, deductible: true },
      { id: "seed-exp-2", userId: user.id, date: new Date(thisMonth.getTime() + 2 * 24 * 60 * 60 * 1000), category: "Software", description: "GitHub Pro", amount: 4, deductible: true },
      { id: "seed-exp-3", userId: user.id, date: new Date(thisMonth.getTime() + 5 * 24 * 60 * 60 * 1000), category: "Equipment", description: "External SSD", amount: 89, deductible: true },
      { id: "seed-exp-4", userId: user.id, date: new Date(thisMonth.getTime() + 6 * 24 * 60 * 60 * 1000), category: "Travel", description: "Train to client meeting", amount: 42, deductible: true },
      { id: "seed-exp-5", userId: user.id, date: new Date(thisMonth.getTime() + 9 * 24 * 60 * 60 * 1000), category: "Office", description: "Co-working space day pass", amount: 25, deductible: true },
      { id: "seed-exp-6", userId: user.id, date: new Date(thisMonth.getTime() + 11 * 24 * 60 * 60 * 1000), category: "Marketing", description: "LinkedIn Premium", amount: 35, deductible: true },
    ],
  });

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
