import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome back, {user?.firstName || "there"}! 👋
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        This is where you&apos;ll manage your feedback boards. Coming soon.
      </p>
    </div>
  );
}
