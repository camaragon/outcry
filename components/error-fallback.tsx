"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  message?: string;
  showHomeLink?: boolean;
  boundary?: string;
}

export function ErrorFallback({
  error,
  reset,
  message = "We couldn\u2019t load this page. Please try again.",
  showHomeLink = true,
  boundary = "ErrorBoundary",
}: ErrorFallbackProps) {
  useEffect(() => {
    console.error(`[${boundary}]`, error);
  }, [boundary, error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="flex size-12 items-center justify-center rounded-full bg-destructive/10"
          aria-hidden="true"
        >
          <AlertCircle className="size-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={reset} variant="outline" size="sm">
            Try Again
          </Button>
          {showHomeLink && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Go Home</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
