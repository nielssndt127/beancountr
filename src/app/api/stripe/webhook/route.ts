import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata.userId;
      if (userId) {
        await prisma.user.update({
          where: { supabaseUserId: userId },
          data: {
            plan: sub.status === "active" || sub.status === "trialing" ? "PRO" : "FREE",
            stripeCustomerId: sub.customer as string,
            stripeSubscriptionId: sub.id,
          },
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata.userId;
      if (userId) {
        await prisma.user.update({
          where: { supabaseUserId: userId },
          data: { plan: "FREE" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
