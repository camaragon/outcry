import { ClerkProvider } from "@clerk/nextjs";

// Platform routes depend on Clerk — force dynamic rendering
export const dynamic = "force-dynamic";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
