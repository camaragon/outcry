"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { createWorkspace } from "@/actions/create-workspace";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const OnboardingForm = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const { execute, fieldErrors, isLoading } = useAction(createWorkspace, {
    onSuccess: () => {
      toast.success("Workspace created!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugEdited(true);
    setSlug(slugify(value));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute({ name, slug });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workspace name</Label>
        <Input
          id="name"
          placeholder="Acme Inc"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          disabled={isLoading}
        />
        {fieldErrors?.name && (
          <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Board URL</Label>
        <div className="flex items-center gap-0">
          <span className="flex h-9 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
            outcry.app/
          </span>
          <Input
            id="slug"
            className="rounded-l-none"
            placeholder="acme"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            disabled={isLoading}
          />
        </div>
        {fieldErrors?.slug && (
          <p className="text-sm text-destructive">{fieldErrors.slug[0]}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || !name || !slug}>
        {isLoading ? "Creating..." : "Create workspace"}
      </Button>
    </form>
  );
};
