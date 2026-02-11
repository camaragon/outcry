"use client";

import Link from "next/link";
import { Check, LogOut, Map, Menu, Moon, Settings, Sun } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useTheme } from "next-themes";
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

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

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
  const { theme, setTheme } = useTheme();

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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun className="mr-2 size-4 dark:hidden" />
            <Moon className="mr-2 hidden size-4 dark:block" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {THEME_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setTheme(option.value)}
                className="flex items-center justify-between"
              >
                {option.label}
                {theme === option.value && <Check className="ml-2 size-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
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
