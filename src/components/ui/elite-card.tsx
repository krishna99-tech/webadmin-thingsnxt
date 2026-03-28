"use client";

import React from "react";
import { Card, CardBody } from "@heroui/react";
import type { LucideIcon } from "lucide-react";
import { StarBorder } from "@/components/reactbits/star-border";

type EliteCardProps = React.ComponentProps<typeof Card> & {
  /** Gradient frame inspired by React Bits (lightweight; no extra UI library). */
  variant?: "default" | "gradient";
};

export function EliteCard({
  children,
  className,
  variant = "default",
  ...props
}: EliteCardProps) {
  const card = (
    <Card
      shadow="sm"
      className={`
          border border-default-200/80 dark:border-default-100/10
          bg-content1 dark:bg-content1/50
          rounded-2xl shadow-sm shadow-default-500/5
          hover:shadow-md hover:border-default-300/80 dark:hover:border-default-100/15
          transition-shadow duration-200
          ${variant === "gradient" ? "border-0 shadow-none" : ""}
          ${className ?? ""}
        `}
      {...props}
    >
      <CardBody className="p-6 sm:p-7 min-w-0">{children}</CardBody>
    </Card>
  );

  if (variant === "gradient") {
    return <StarBorder innerClassName="overflow-hidden rounded-2xl">{card}</StarBorder>;
  }

  return card;
}

const colorMap: Record<string, string> = {
  primary: "text-primary bg-primary/10 border-primary/20",
  secondary: "text-secondary bg-secondary/10 border-secondary/20",
  success: "text-success bg-success/10 border-success/20",
  danger: "text-danger bg-danger/10 border-danger/20",
  warning: "text-warning bg-warning/10 border-warning/20",
};

export function EliteStatCard({
  title,
  value,
  icon: Icon,
  color = "primary",
  subtitle,
}: {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  color?: keyof typeof colorMap;
  subtitle?: string;
  loading?: boolean;
}) {
  return (
    <EliteCard variant="gradient" className="relative">
      <div className="flex justify-between items-start gap-4 min-w-0">
        <div className="space-y-1 min-w-0 flex-1 overflow-visible">
          <p className="text-xs font-medium text-default-500 tracking-wide uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-2 flex-wrap min-w-0">
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-default-900 font-heading break-words [overflow-wrap:anywhere]">
              {value}
            </h3>
            {subtitle && (
              <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-md">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <div
          className={`p-3 rounded-xl border shrink-0 ${colorMap[color] ?? colorMap.primary}`}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
    </EliteCard>
  );
}
