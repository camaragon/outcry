import { ClerkProvider } from "@clerk/nextjs";

// All platform routes require auth — skip static generation for CI builds
export const dynamic = "force-dynamic";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
