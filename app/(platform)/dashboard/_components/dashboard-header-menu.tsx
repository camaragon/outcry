"use client";

import { useState } from "react";
import { Check, Crown, Loader2, Menu, Moon, Sparkles, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderMenuProps {
  workspaceId: string;
  isPro: boolean;
}

export function DashboardHeaderMenu({
  workspaceId,
  isPro,
}: DashboardHeaderMenuProps) {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleBillingClick = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Checkout failed");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to start checkout. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="size-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isPro && (
          <>
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground">
              <Crown className="size-3" />
              <span className="font-medium">PRO</span>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleBillingClick} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 size-4" />
          )}
          {isPro ? "Manage Billing" : "Upgrade to Pro"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun className="mr-2 size-4 dark:hidden" />
            <Moon className="mr-2 hidden size-4 dark:block" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {(["light", "dark", "system"] as const).map((value) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setTheme(value)}
                className="flex items-center justify-between"
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
                {theme === value && <Check className="ml-2 size-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
