"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, Loader2, LogOut, Menu, Settings, Sparkles } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { redirectToCheckout } from "@/lib/checkout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSubMenu } from "@/components/theme-sub-menu";

interface DashboardHeaderMenuProps {
  workspaceId: string;
  isPro: boolean;
  isAdmin: boolean;
}

export function DashboardHeaderMenu({
  workspaceId,
  isPro,
  isAdmin,
}: DashboardHeaderMenuProps) {
  const { signOut } = useClerk();
  const [isLoading, setIsLoading] = useState(false);

  const handleBillingClick = async () => {
    try {
      setIsLoading(true);
      await redirectToCheckout(workspaceId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed");
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
            <DropdownMenuLabel className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Crown className="size-3" />
              PRO
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleBillingClick();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 size-4" />
          )}
          {isPro ? "Manage Billing" : "Upgrade to Pro"}
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <ThemeSubMenu />
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut({ redirectUrl: "/" })}>
          <LogOut className="mr-2 size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
