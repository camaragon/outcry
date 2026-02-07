import Link from "next/link";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: Array<{ text: string; included: boolean }>;
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  ctaHref,
  highlighted = false,
  badge,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col",
        highlighted && "border-primary bg-primary/5 ring-1 ring-primary/20"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{name}</CardTitle>
          {badge && (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          {period && <span className="text-muted-foreground">{period}</span>}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <ul className="flex-1 space-y-3">
          {features.map((feature) => (
            <li key={feature.text} className="flex items-center gap-3 text-sm">
              {feature.included ? (
                <Check className="size-4 text-primary" />
              ) : (
                <X className="size-4 text-muted-foreground/50" />
              )}
              <span className={cn(!feature.included && "text-muted-foreground")}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
        <Button
          asChild
          variant={highlighted ? "default" : "outline"}
          className="mt-6 w-full"
        >
          <Link href={ctaHref}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
