"use client";

import { useState } from "react";
import { Crown, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface BillingSectionProps {
  workspaceId: string;
  isPro: boolean;
  currentPeriodEnd: string | null;
}

export function BillingSection({
  workspaceId,
  isPro,
  currentPeriodEnd,
}: BillingSectionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBillingClick = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      const text = await response.text();
      let data: { error?: string; url?: string };

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text };
      }

      if (!response.ok) {
        toast.error(data.error || "Failed to open billing");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to open billing. Please try again.");
      }
    } catch {
      toast.error("Failed to open billing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border p-6">
      <h3 className="text-sm font-medium">Billing</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your subscription and billing details.
      </p>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          {isPro ? (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-500">
              <Crown className="size-3.5" />
              Pro
            </span>
          ) : (
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
              Free
            </span>
          )}
          {isPro && currentPeriodEnd && (
            <span className="text-sm text-muted-foreground">
              Renews{" "}
              {new Date(currentPeriodEnd).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
      <div className="mt-4">
        <Button
          onClick={handleBillingClick}
          disabled={isLoading}
          variant={isPro ? "outline" : "default"}
          size="sm"
        >
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : isPro ? (
            <Crown className="mr-2 size-4" />
          ) : (
            <Sparkles className="mr-2 size-4" />
          )}
          {isPro ? "Manage Billing" : "Upgrade to Pro"}
        </Button>
      </div>
    </div>
  );
}
