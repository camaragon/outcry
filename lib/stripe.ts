import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    "Missing STRIPE_SECRET_KEY environment variable. " +
      "Please set STRIPE_SECRET_KEY to your Stripe secret key."
  );
}

export const stripe = new Stripe(stripeSecretKey, {
  typescript: true,
});
