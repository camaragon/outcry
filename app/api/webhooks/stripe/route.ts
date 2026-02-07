import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("[STRIPE_WEBHOOK] Signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`[STRIPE_WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK] Handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("[STRIPE_WEBHOOK] checkout.session.completed received", {
    sessionId: session.id,
    metadata: session.metadata,
    subscription: session.subscription,
    customer: session.customer,
  });

  const workspaceId = session.metadata?.workspaceId;
  if (!workspaceId) {
    console.error("[STRIPE_WEBHOOK] No workspaceId in session metadata");
    return;
  }

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (!subscriptionId) {
    console.error("[STRIPE_WEBHOOK] No subscription ID in session");
    return;
  }

  // Fetch subscription to get price and period end
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  console.log("[STRIPE_WEBHOOK] Retrieved subscription", {
    id: subscription.id,
    status: subscription.status,
    priceId: subscription.items.data[0]?.price.id,
    current_period_end: subscription.current_period_end,
    current_period_end_type: typeof subscription.current_period_end,
  });

  // Safely handle current_period_end - Stripe returns Unix timestamp in seconds
  const periodEnd = subscription.current_period_end;
  const periodEndDate = periodEnd && typeof periodEnd === 'number' 
    ? new Date(periodEnd * 1000) 
    : null;
  
  console.log("[STRIPE_WEBHOOK] Period end calculation", {
    raw: periodEnd,
    calculated: periodEndDate,
  });

  await db.workspace.update({
    where: { id: workspaceId },
    data: {
      plan: "PRO",
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: subscription.items.data[0]?.price.id,
      stripeCurrentPeriodEnd: periodEndDate,
    },
  });

  console.log(`[STRIPE_WEBHOOK] Workspace ${workspaceId} upgraded to PRO`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const workspaceId = subscription.metadata?.workspaceId;
  if (!workspaceId) {
    // Try to find workspace by subscription ID
    const workspace = await db.workspace.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!workspace) {
      console.error("[STRIPE_WEBHOOK] Could not find workspace for subscription");
      return;
    }
    await updateWorkspaceSubscription(workspace.id, subscription);
    return;
  }

  await updateWorkspaceSubscription(workspaceId, subscription);
}

async function updateWorkspaceSubscription(
  workspaceId: string,
  subscription: Stripe.Subscription
) {
  const isActive = ["active", "trialing"].includes(subscription.status);

  await db.workspace.update({
    where: { id: workspaceId },
    data: {
      plan: isActive ? "PRO" : "FREE",
      stripePriceId: subscription.items.data[0]?.price.id,
      stripeCurrentPeriodEnd: new Date(
        subscription.current_period_end * 1000
      ),
    },
  });

  console.log(
    `[STRIPE_WEBHOOK] Workspace ${workspaceId} subscription updated: ${subscription.status}`
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const workspace = await db.workspace.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!workspace) {
    console.error("[STRIPE_WEBHOOK] Could not find workspace for deleted subscription");
    return;
  }

  await db.workspace.update({
    where: { id: workspace.id },
    data: {
      plan: "FREE",
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
    },
  });

  console.log(`[STRIPE_WEBHOOK] Workspace ${workspace.id} downgraded to FREE`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const workspace = await db.workspace.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!workspace) {
    console.error("[STRIPE_WEBHOOK] Could not find workspace for failed payment");
    return;
  }

  // Log the failure - could send email notification here
  console.warn(
    `[STRIPE_WEBHOOK] Payment failed for workspace ${workspace.id} (${workspace.name})`
  );

  // Note: We don't immediately downgrade on failed payment
  // Stripe will retry and eventually cancel the subscription if it keeps failing
  // The subscription.deleted webhook will handle the downgrade
}
