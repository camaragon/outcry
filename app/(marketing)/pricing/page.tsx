import Link from "next/link";
import { Check, X } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          No per-user fees. No tracked-user limits. No surprises.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {/* Free Plan */}
          <div className="rounded-2xl border bg-card p-8">
            <h2 className="text-xl font-semibold">Free</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="mt-4 text-muted-foreground">
              Perfect for trying out Outcry and seeing if it fits your workflow.
            </p>
            <Link
              href="/sign-up"
              className="mt-8 block w-full rounded-lg border py-3 text-center font-medium hover:bg-accent transition"
            >
              Get started
            </Link>
            <div className="mt-8 space-y-4">
              <h3 className="font-medium">What&apos;s included:</h3>
              <ul className="space-y-3">
                <PricingFeature included>1 feedback board</PricingFeature>
                <PricingFeature included>Up to 50 posts</PricingFeature>
                <PricingFeature included>Unlimited voters</PricingFeature>
                <PricingFeature included>Basic status management</PricingFeature>
                <PricingFeature included>Community support</PricingFeature>
                <PricingFeature>AI duplicate detection</PricingFeature>
                <PricingFeature>Custom branding</PricingFeature>
                <PricingFeature>Public roadmap</PricingFeature>
                <PricingFeature>Priority support</PricingFeature>
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="rounded-2xl border-2 border-violet-500 bg-violet-500/5 p-8 ring-1 ring-violet-500/20">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Pro</h2>
              <span className="rounded-full bg-violet-500 px-3 py-1 text-xs font-medium text-white">
                Most popular
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-bold">$49</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="mt-4 text-muted-foreground">
              For growing products that need powerful feedback management.
            </p>
            <Link
              href="/sign-up"
              className="mt-8 block w-full rounded-lg bg-violet-500 py-3 text-center font-medium text-white hover:bg-violet-600 transition"
            >
              Start free trial
            </Link>
            <div className="mt-8 space-y-4">
              <h3 className="font-medium">Everything in Free, plus:</h3>
              <ul className="space-y-3">
                <PricingFeature included>Unlimited boards</PricingFeature>
                <PricingFeature included>Unlimited posts</PricingFeature>
                <PricingFeature included>Unlimited team members</PricingFeature>
                <PricingFeature included>AI duplicate detection</PricingFeature>
                <PricingFeature included>Custom branding</PricingFeature>
                <PricingFeature included>Public roadmap</PricingFeature>
                <PricingFeature included>Remove Outcry badge</PricingFeature>
                <PricingFeature included>Priority support</PricingFeature>
                <PricingFeature included>Export data</PricingFeature>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t bg-muted/30 px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold">Compare to others</h2>
          <p className="mt-2 text-center text-muted-foreground">
            See how Outcry stacks up against the competition
          </p>
          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-4 text-left font-medium">Feature</th>
                  <th className="py-4 text-center font-medium">
                    <span className="text-violet-500">Outcry Pro</span>
                  </th>
                  <th className="py-4 text-center font-medium text-muted-foreground">
                    Canny
                  </th>
                  <th className="py-4 text-center font-medium text-muted-foreground">
                    Featurebase
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <ComparisonRow
                  feature="Starting price"
                  outcry="$49/mo"
                  canny="$99/mo"
                  featurebase="$29/seat/mo"
                />
                <ComparisonRow
                  feature="Unlimited users"
                  outcry={true}
                  canny={false}
                  featurebase={false}
                />
                <ComparisonRow
                  feature="AI duplicate detection"
                  outcry={true}
                  canny={false}
                  featurebase={false}
                />
                <ComparisonRow
                  feature="Tracked-user limits"
                  outcry="None"
                  canny="From 100"
                  featurebase="Varies"
                />
                <ComparisonRow
                  feature="Public roadmap"
                  outcry={true}
                  canny={true}
                  featurebase={true}
                />
                <ComparisonRow
                  feature="Custom branding"
                  outcry={true}
                  canny="$$$"
                  featurebase={true}
                />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold">
            Frequently asked questions
          </h2>
          <div className="mt-12 space-y-8">
            <FAQ
              question="What's a 'tracked user' and why don't you charge for them?"
              answer="Some feedback tools charge based on how many unique users interact with your board. We think that's a trap that punishes growth. With Outcry, you pay one flat price regardless of how many customers give you feedback."
            />
            <FAQ
              question="Can I upgrade or downgrade anytime?"
              answer="Yes! You can upgrade to Pro anytime and get immediate access to all features. If you downgrade, you'll keep Pro features until the end of your billing period."
            />
            <FAQ
              question="What happens if I go over 50 posts on Free?"
              answer="We'll let you know when you're approaching the limit. Your existing posts will remain accessible, but you'll need to upgrade to Pro to add more."
            />
            <FAQ
              question="Do you offer annual billing?"
              answer="Not yet, but we're planning to add annual billing with a discount soon. Sign up for our newsletter to be notified."
            />
            <FAQ
              question="Can I import from Canny or other tools?"
              answer="We're working on import functionality. If you're migrating from another tool, reach out and we'll help you get set up."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start with Free and upgrade when you need more power.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-8 py-3 font-medium text-white hover:bg-violet-600 transition"
            >
              Get started for free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Outcry</span>
              <span className="text-muted-foreground">
                — Boards that think
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition">
                Home
              </Link>
              <Link href="/sign-in" className="hover:text-foreground transition">
                Sign in
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            © 2026 Outcry. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingFeature({
  children,
  included = false,
}: {
  children: React.ReactNode;
  included?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      {included ? (
        <Check className="size-5 text-violet-500" />
      ) : (
        <X className="size-5 text-muted-foreground/50" />
      )}
      <span className={included ? "" : "text-muted-foreground"}>{children}</span>
    </li>
  );
}

function ComparisonRow({
  feature,
  outcry,
  canny,
  featurebase,
}: {
  feature: string;
  outcry: string | boolean;
  canny: string | boolean;
  featurebase: string | boolean;
}) {
  const renderCell = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="mx-auto size-5 text-green-500" />
      ) : (
        <X className="mx-auto size-5 text-muted-foreground/50" />
      );
    }
    return value;
  };

  return (
    <tr>
      <td className="py-4 font-medium">{feature}</td>
      <td className="py-4 text-center text-violet-500">{renderCell(outcry)}</td>
      <td className="py-4 text-center text-muted-foreground">
        {renderCell(canny)}
      </td>
      <td className="py-4 text-center text-muted-foreground">
        {renderCell(featurebase)}
      </td>
    </tr>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="font-medium">{question}</h3>
      <p className="mt-2 text-muted-foreground">{answer}</p>
    </div>
  );
}
