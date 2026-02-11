import { Globe } from "lucide-react";

interface WorkspaceUrlDisplayProps {
  slug: string;
}

export function WorkspaceUrlDisplay({ slug }: WorkspaceUrlDisplayProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://outcry.app";

  return (
    <div className="rounded-lg border p-6">
      <h3 className="text-sm font-medium">Public URL</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        This is where your customers can submit feedback.
      </p>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <Globe className="size-4 text-muted-foreground" />
        <code className="rounded bg-muted px-2 py-1">
          {baseUrl}/b/{slug}
        </code>
      </div>
    </div>
  );
}
