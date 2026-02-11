"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "@/hooks/use-action";
import { updateWorkspace } from "@/actions/update-workspace";

interface WorkspaceNameFormProps {
  workspaceId: string;
  initialName: string;
}

export function WorkspaceNameForm({
  workspaceId,
  initialName,
}: WorkspaceNameFormProps) {
  const [name, setName] = useState(initialName);

  const { execute, fieldErrors, error, isLoading } = useAction(
    updateWorkspace,
    {
      onSuccess: () => {
        toast.success("Workspace name updated!");
      },
      onError: (error) => {
        toast.error(error);
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === initialName) return;
    execute({ workspaceId, name: name.trim() });
  };

  const isDirty = name.trim() !== initialName;

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-lg border p-6">
        <h3 className="text-sm font-medium">Workspace Name</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          This is the name displayed to your team and on public pages.
        </p>
        <div className="mt-4 flex gap-2">
          <label htmlFor="workspace-name" className="sr-only">
            Workspace name
          </label>
          <Input
            id="workspace-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Workspace"
            className="max-w-sm"
            disabled={isLoading}
            aria-invalid={!!fieldErrors?.name}
            aria-describedby={fieldErrors?.name ? "name-error" : undefined}
          />
          <Button type="submit" size="sm" disabled={isLoading || !isDirty}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
        {fieldErrors?.name && (
          <p id="name-error" className="mt-2 text-sm text-destructive">
            {fieldErrors.name[0]}
          </p>
        )}
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    </form>
  );
}
