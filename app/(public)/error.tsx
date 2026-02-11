"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn&apos;t load this page. Please try again.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={reset} variant="outline" size="sm">
            Try Again
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="/">Go Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
