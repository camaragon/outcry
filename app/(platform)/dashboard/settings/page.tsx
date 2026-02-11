import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { WorkspaceNameForm } from "./_components/workspace-name-form";
import { WorkspaceUrlDisplay } from "./_components/workspace-url-display";
import { BillingSection } from "./_components/billing-section";

export default async function SettingsPage() {
  const user = await currentUser();

  if (!user?.id) redirect("/sign-in");

  const dbUser = await db.user.findFirst({
    where: {
      clerkId: user.id,
      role: { in: ["OWNER", "ADMIN"] },
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
          stripeCurrentPeriodEnd: true,
        },
      },
    },
  });

  if (!dbUser?.workspace) {
    redirect("/onboarding");
  }

  const workspace = dbUser.workspace;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/dashboard" aria-label="Back to dashboard">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your workspace settings and billing.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        <WorkspaceNameForm
          workspaceId={workspace.id}
          initialName={workspace.name}
        />

        <WorkspaceUrlDisplay slug={workspace.slug} />

        <BillingSection
          workspaceId={workspace.id}
          isPro={workspace.plan === "PRO"}
          currentPeriodEnd={
            workspace.stripeCurrentPeriodEnd?.toISOString() ?? null
          }
        />
      </div>
    </div>
  );
}
