import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "left" | "center";
  tone?: "default" | "surface" | "navy";
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  align = "left",
  tone = "default",
}: SectionProps) {
  const toneClass =
    tone === "surface"
      ? "bg-surface"
      : tone === "navy"
        ? "bg-navy text-navy-foreground"
        : "bg-background";
  return (
    <section id={id} className={cn("section-y", toneClass, className)}>
      <div className="container-x">
        {(eyebrow || title || description) && (
          <div
            className={cn(
              "mb-10 md:mb-14 max-w-3xl",
              align === "center" && "mx-auto text-center",
            )}
          >
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && (
              <h2
                className={cn(
                  "mt-3 text-3xl md:text-5xl font-bold text-balance",
                  tone === "navy" ? "text-white" : "text-primary",
                )}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className={cn(
                  "mt-4 text-base md:text-lg",
                  tone === "navy" ? "text-white/75" : "text-muted-foreground",
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
