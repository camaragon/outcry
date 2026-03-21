"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { createWorkspace } from "@/actions/create-workspace";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const PRODUCT_CATEGORIES = [
  { value: "DEVELOPER_TOOL", label: "Developer Tool" },
  { value: "SAAS", label: "SaaS Platform" },
  { value: "ECOMMERCE", label: "Ecommerce" },
  { value: "MOBILE_APP", label: "Mobile App" },
  { value: "OTHER", label: "Other" },
] as const;

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
  const [productCategory, setProductCategory] = useState<string>("");

  const { execute, fieldErrors, isLoading } = useAction(createWorkspace, {
    onSuccess: () => {
      toast.success("Workspace created! Check your email for your first digest.");
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
    execute({
      name,
      slug,
      productCategory: productCategory as
        | "DEVELOPER_TOOL"
        | "ECOMMERCE"
        | "SAAS"
        | "MOBILE_APP"
        | "OTHER",
    });
  };

  const nameError = fieldErrors?.name?.[0];
  const slugError = fieldErrors?.slug?.[0];
  const categoryError = fieldErrors?.productCategory?.[0];

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
          aria-invalid={!!nameError}
          aria-describedby={nameError ? "name-error" : undefined}
        />
        {nameError && (
          <p id="name-error" className="text-sm text-destructive" role="alert">
            {nameError}
          </p>
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
            aria-invalid={!!slugError}
            aria-describedby={slugError ? "slug-error" : undefined}
          />
        </div>
        {slugError && (
          <p id="slug-error" className="text-sm text-destructive" role="alert">
            {slugError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="product-category">What kind of product do you build?</Label>
        <Select
          value={productCategory}
          onValueChange={setProductCategory}
          disabled={isLoading}
        >
          <SelectTrigger id="product-category" aria-invalid={!!categoryError}>
            <SelectValue placeholder="Select your product type" />
          </SelectTrigger>
          <SelectContent>
            {PRODUCT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          We&apos;ll seed your board with sample feedback so you can see Outcry in action
        </p>
        {categoryError && (
          <p className="text-sm text-destructive" role="alert">
            {categoryError}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !name || !slug || !productCategory}
      >
        {isLoading ? "Creating..." : "Create workspace"}
      </Button>
    </form>
  );
};
