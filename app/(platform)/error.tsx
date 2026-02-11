"use client";

import { ErrorFallback } from "@/components/error-fallback";

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      message="We ran into an error loading this page. Please try again."
      showHomeLink={false}
      boundary="PlatformError"
    />
  );
}
