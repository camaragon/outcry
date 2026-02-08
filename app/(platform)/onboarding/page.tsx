import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { OnboardingForm } from "./_components/onboarding-form";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  // If user already has a workspace, redirect to dashboard
  const existingUser = await db.user.findFirst({
    where: { clerkId: userId },
    select: { workspaceId: true },
  });

  if (existingUser?.workspaceId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create your workspace</h1>
          <p className="mt-2 text-muted-foreground">
            Set up your feedback board in seconds. You can always change these
            later.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
