"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAction } from "@/hooks/use-action";
import { createCategory } from "@/actions/create-category";

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

interface CreateCategoryFormProps {
  workspaceId: string;
}

export function CreateCategoryForm({ workspaceId }: CreateCategoryFormProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[5]);

  const { execute, isLoading, fieldErrors } = useAction(createCategory, {
    onSuccess: () => {
      toast.success("Category created");
      setName("");
      setColor(PRESET_COLORS[5]);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute({ name: name.trim(), color, workspaceId });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-4">
      <h3 className="font-medium">Create category</h3>

      <div className="space-y-2">
        <Label htmlFor="category-name">Name</Label>
        <Input
          id="category-name"
          placeholder="e.g. Bug, Feature, UX"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          disabled={isLoading}
        />
        {fieldErrors?.name && (
          <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="size-7 rounded-full border-2 transition-all"
              style={{
                backgroundColor: c,
                borderColor: color === c ? "currentColor" : "transparent",
                transform: color === c ? "scale(1.2)" : "scale(1)",
              }}
              aria-label={`Color ${c}`}
            />
          ))}
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="size-7 cursor-pointer rounded-full border-0 p-0"
            aria-label="Custom color"
          />
        </div>
        {fieldErrors?.color && (
          <p className="text-sm text-destructive">{fieldErrors.color[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
          style={{ borderColor: color, color }}
        >
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          {name || "Preview"}
        </div>
        <Button type="submit" size="sm" disabled={isLoading || !name.trim()}>
          <Plus className="size-4" />
          Create
        </Button>
      </div>
    </form>
  );
}
