import type { ReactNode } from "react";

type StarBorderProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

/**
 * React Bits–style animated gradient frame (no extra npm; works with HeroUI).
 */
export function StarBorder({ children, className = "", innerClassName = "" }: StarBorderProps) {
  return (
    <div
      className={`relative rounded-2xl p-px bg-gradient-to-br from-primary/45 via-secondary/35 to-primary/45 dark:from-primary/35 dark:via-primary/15 dark:to-secondary/25 bg-[length:200%_200%] animate-gradient-shift ${className}`}
    >
      <div className={`rounded-[calc(1rem-1px)] bg-content1 ${innerClassName}`}>{children}</div>
    </div>
  );
}
