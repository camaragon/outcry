"use client";

import Link from "next/link";
import { LogOut, Map, Menu, Settings } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSubMenu } from "@/components/theme-sub-menu";

interface BoardHeaderMenuProps {
  workspaceSlug: string;
  boardSlug: string;
  boardId: string;
  isAdmin: boolean;
  isSignedIn: boolean;
}

export function BoardHeaderMenu({
  workspaceSlug,
  boardSlug,
  boardId,
  isAdmin,
  isSignedIn,
}: BoardHeaderMenuProps) {
  const { signOut } = useClerk();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Menu className="size-4" />
          <span className="sr-only">Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/b/${workspaceSlug}/roadmap?from=${boardSlug}`}>
            <Map className="mr-2 size-4" />
            Roadmap
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/board/${boardId}`}>
              <Settings className="mr-2 size-4" />
              Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <ThemeSubMenu />
        {isSignedIn && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/" })}>
              <LogOut className="mr-2 size-4" />
              Sign Out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
