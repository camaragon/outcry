/**
 * Redirect the user to Stripe checkout (new subscription) or
 * the billing portal (existing subscription).
 *
 * Throws on failure — callers should catch and display a toast.
 */
export async function redirectToCheckout(workspaceId: string): Promise<void> {
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
    throw new Error(data.error || "Failed to open billing");
  }

  if (!data.url) {
    throw new Error("Failed to open billing. Please try again.");
  }

  window.location.href = data.url;
}
