import Link from "next/link";
import {
  Sparkles,
  MessageSquare,
  BarChart3,
  Zap,
  Check,
  ArrowRight,
} from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center md:py-32">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
            <Sparkles className="size-4 text-violet-500" />
            <span>AI-powered feedback management</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Boards that{" "}
            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              think
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            AI-native feedback and roadmap tool. Collect and prioritize product
            feedback with AI-powered duplicate detection. $49/mo flat — no
            per-user pricing traps.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition"
            >
              Start free trial
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg border px-8 py-4 text-lg font-medium hover:bg-accent transition"
            >
              See pricing
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Free tier available • No credit card required
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y bg-muted/30 px-4 py-12">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-medium text-muted-foreground">
            TIRED OF CANNY&apos;S PRICING? YOU&apos;RE NOT ALONE.
          </p>
          <p className="mt-2 text-lg">
            Join product teams switching from overpriced feedback tools
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-24" id="features">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage feedback
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built for modern product teams who want simplicity without
              sacrificing power
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Sparkles className="size-6" />}
              title="AI Duplicate Detection"
              description="Automatically surfaces similar feedback as users type. No more manually merging duplicates."
            />
            <FeatureCard
              icon={<MessageSquare className="size-6" />}
              title="Public Feedback Board"
              description="Let customers submit ideas and vote on what matters most. Upvotes, comments, and status updates."
            />
            <FeatureCard
              icon={<BarChart3 className="size-6" />}
              title="Public Roadmap"
              description="Show customers what's planned, in progress, and shipped. Build trust with transparency."
            />
            <FeatureCard
              icon={<Zap className="size-6" />}
              title="Status Management"
              description="Move feedback through your workflow: Open → Under Review → Planned → In Progress → Complete."
            />
            <FeatureCard
              icon={<Check className="size-6" />}
              title="Categories & Filtering"
              description="Organize feedback with custom categories. Filter and sort to find what matters."
            />
            <FeatureCard
              icon={<ArrowRight className="size-6" />}
              title="Simple Pricing"
              description="$49/mo flat. Unlimited users, unlimited feedback, unlimited boards. No surprises."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y bg-muted/30 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get up and running in minutes
            </p>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            <Step
              number="1"
              title="Create your board"
              description="Set up your workspace and customize your feedback board with your brand."
            />
            <Step
              number="2"
              title="Share with customers"
              description="Give customers your board link. They can submit feedback and vote on ideas."
            />
            <Step
              number="3"
              title="Prioritize & ship"
              description="AI helps you spot duplicates. You decide what to build. Customers see your roadmap."
            />
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No per-user fees. No tracked-user traps. Just one flat price.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <PricingCard
              name="Free"
              price="$0"
              description="For trying things out"
              features={[
                "1 feedback board",
                "50 posts",
                "Unlimited voters",
                "Basic analytics",
                "Powered by Outcry badge",
              ]}
              cta="Get started"
              ctaHref="/sign-up"
              highlighted={false}
            />
            <PricingCard
              name="Pro"
              price="$49"
              period="/month"
              description="For growing products"
              features={[
                "Unlimited boards",
                "Unlimited posts",
                "Unlimited team members",
                "AI duplicate detection",
                "Custom branding",
                "Public roadmap",
                "Priority support",
              ]}
              cta="Start free trial"
              ctaHref="/sign-up"
              highlighted={true}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-muted/30 px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to build what customers want?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join product teams who use Outcry to collect, organize, and
            prioritize customer feedback.
          </p>
          <div className="mt-8">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition"
            >
              Get started for free
              <ArrowRight className="size-5" />
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
              <Link href="/pricing" className="hover:text-foreground transition">
                Pricing
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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex size-12 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-violet-500 text-xl font-bold text-white">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  ctaHref,
  highlighted,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-8 ${
        highlighted
          ? "border-violet-500 bg-violet-500/5 ring-1 ring-violet-500"
          : "bg-card"
      }`}
    >
      <h3 className="text-lg font-semibold">{name}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold">{price}</span>
        {period && <span className="text-muted-foreground">{period}</span>}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <Check className="size-4 text-violet-500" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`mt-8 block w-full rounded-lg py-3 text-center font-medium transition ${
          highlighted
            ? "bg-violet-500 text-white hover:bg-violet-600"
            : "border hover:bg-accent"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
