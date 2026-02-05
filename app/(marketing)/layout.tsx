import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <nav className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            Outcry
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Pricing
            </Link>
            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
            >
              Get started
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
