import Link from "next/link";
import { LucideIcon, Sparkles, MessageSquare, BarChart3, Zap, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingCard } from "@/components/pricing-card";

export default function MarketingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center md:py-32">
        <div className="mx-auto max-w-4xl space-y-8">
          <Badge variant="secondary" className="gap-2">
            <Sparkles className="size-4 text-primary" />
            AI-powered feedback management
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Boards that{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              think
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            AI-native feedback and roadmap tool. Collect and prioritize product
            feedback with AI-powered duplicate detection. $49/mo flat — no
            per-user pricing traps.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-8 text-lg">
              <Link href="/sign-up">
                Start free trial
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg">
              <Link href="/pricing">See pricing</Link>
            </Button>
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
              icon={Sparkles}
              title="AI Duplicate Detection"
              description="Automatically surfaces similar feedback as users type. No more manually merging duplicates."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Public Feedback Board"
              description="Let customers submit ideas and vote on what matters most. Upvotes, comments, and status updates."
            />
            <FeatureCard
              icon={BarChart3}
              title="Public Roadmap"
              description="Show customers what's planned, in progress, and shipped. Build trust with transparency."
            />
            <FeatureCard
              icon={Zap}
              title="Status Management"
              description="Move feedback through your workflow: Open → Under Review → Planned → In Progress → Complete."
            />
            <FeatureCard
              icon={Check}
              title="Categories & Filtering"
              description="Organize feedback with custom categories. Filter and sort to find what matters."
            />
            <FeatureCard
              icon={ArrowRight}
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
              period="/month"
              description="For trying things out"
              features={[
                { text: "1 feedback board", included: true },
                { text: "50 posts", included: true },
                { text: "Unlimited voters", included: true },
                { text: "Public roadmap", included: true },
                { text: "Powered by Outcry badge", included: true },
              ]}
              cta="Get started"
              ctaHref="/sign-up"
            />
            <PricingCard
              name="Pro"
              price="$49"
              period="/month"
              description="For growing products"
              features={[
                { text: "Unlimited boards", included: true },
                { text: "Unlimited posts", included: true },
                { text: "Unlimited team members", included: true },
                { text: "AI duplicate detection", included: true },
                { text: "Custom branding", included: true },
                { text: "Remove Outcry badge", included: true },
                { text: "Priority support", included: true },
              ]}
              cta="Start free trial"
              ctaHref="/sign-up"
              highlighted
              badge="Most popular"
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
            <Button asChild size="lg" className="h-12 px-8 text-lg">
              <Link href="/sign-up">
                Get started for free
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
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
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
