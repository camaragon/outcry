import Link from "next/link";

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mx-auto max-w-3xl space-y-8">
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            Boards that{" "}
            <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
              think
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            AI-native feedback and roadmap tool. Collect and prioritize product
            feedback with AI-powered duplicate detection. $49/mo flat — no
            per-user traps.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
            >
              Get started free
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border px-6 py-3 text-sm font-medium hover:bg-accent transition"
            >
              See pricing
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Outcry. All rights reserved.</p>
      </footer>
    </div>
  );
}
