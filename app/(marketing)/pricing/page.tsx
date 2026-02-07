import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingCard } from "@/components/pricing-card";

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
          <PricingCard
            name="Free"
            price="$0"
            period="/month"
            description="Perfect for trying out Outcry and seeing if it fits your workflow."
            features={[
              { text: "1 feedback board", included: true },
              { text: "Up to 50 posts", included: true },
              { text: "Unlimited voters", included: true },
              { text: "Public roadmap", included: true },
              { text: "Basic status management", included: true },
              { text: "Community support", included: true },
              { text: "AI duplicate detection", included: false },
              { text: "Custom branding", included: false },
              { text: "Priority support", included: false },
            ]}
            cta="Get started"
            ctaHref="/sign-up"
          />
          <PricingCard
            name="Pro"
            price="$49"
            period="/month"
            description="For growing products that need powerful feedback management."
            features={[
              { text: "Unlimited boards", included: true },
              { text: "Unlimited posts", included: true },
              { text: "Unlimited team members", included: true },
              { text: "AI duplicate detection", included: true },
              { text: "Custom branding", included: true },
              { text: "Remove Outcry badge", included: true },
              { text: "Priority support", included: true },
              { text: "Export data", included: true },
            ]}
            cta="Start free trial"
            ctaHref="/sign-up"
            highlighted
            badge="Most popular"
          />
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
                    <span className="text-primary">Outcry Pro</span>
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
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/sign-up">Get started for free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
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
      <td className="py-4 text-center text-primary">{renderCell(outcry)}</td>
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
