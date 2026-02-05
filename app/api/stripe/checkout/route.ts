import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId } = await req.json();
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID required" },
        { status: 400 }
      );
    }

    // Get workspace and verify user has access
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        users: {
          some: {
            clerkId: userId,
            role: { in: ["OWNER", "ADMIN"] },
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found or access denied" },
        { status: 404 }
      );
    }

    // If already pro, redirect to billing portal
    if (workspace.stripeSubscriptionId && workspace.stripeCustomerId) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: workspace.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      });
      return NextResponse.json({ url: portalSession.url });
    }

    // Get user email for Stripe customer
    const user = await db.user.findFirst({
      where: { clerkId: userId },
    });

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: workspace.stripeCustomerId ? undefined : user?.email,
      customer: workspace.stripeCustomerId || undefined,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      metadata: {
        workspaceId: workspace.id,
      },
      subscription_data: {
        metadata: {
          workspaceId: workspace.id,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
