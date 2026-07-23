import { Construction } from "lucide-react";

export function AdminPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-primary">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>

      <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <Construction className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold text-primary">Coming soon</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This module is ready for future functionality. The page structure and navigation are in
          place — feature implementation will follow.
        </p>
      </div>
    </div>
  );
}
