"use client";

import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { StarBorder } from "@/components/reactbits/star-border";

/* ─────────────────────── types ─────────────────────── */

type CardVariant = "default" | "glass" | "gradient" | "outline" | "flat";

type EliteCardProps = Omit<React.ComponentProps<typeof Card>, "children"> & {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  children?: React.ReactNode;
  className?: string;
};

type StatColor = "primary" | "secondary" | "success" | "danger" | "warning" | "info";

type TrendDirection = "up" | "down" | "neutral";

interface EliteStatCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  color?: StatColor;
  /** Small badge text top-right e.g. "Live", "+12%" */
  badge?: string;
  badgeColor?: StatColor;
  /** Trend indicator */
  trend?: TrendDirection;
  trendLabel?: string;
  /** Show skeleton shimmer */
  loading?: boolean;
  /** Optional click handler */
  onClick?: () => void;
}

interface EliteActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  color?: StatColor;
  label?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
}

interface EliteInfoCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  accent?: StatColor;
  mono?: boolean;
  className?: string;
}

/* ─────────────────────── color maps ─────────────────────── */

const COLOR_MAP: Record<StatColor, {
  icon: string;
  badge: string;
  trend: string;
  glow: string;
}> = {
  primary: {
    icon: "text-primary bg-primary/10 border-primary/20",
    badge: "bg-primary/10 text-primary border-primary/20",
    trend: "text-primary",
    glow: "shadow-primary/10",
  },
  secondary: {
    icon: "text-secondary bg-secondary/10 border-secondary/20",
    badge: "bg-secondary/10 text-secondary border-secondary/20",
    trend: "text-secondary",
    glow: "shadow-secondary/10",
  },
  success: {
    icon: "text-success bg-success/10 border-success/20",
    badge: "bg-success/10 text-success border-success/20",
    trend: "text-success",
    glow: "shadow-success/10",
  },
  danger: {
    icon: "text-danger bg-danger/10 border-danger/20",
    badge: "bg-danger/10 text-danger border-danger/20",
    trend: "text-danger",
    glow: "shadow-danger/10",
  },
  warning: {
    icon: "text-warning bg-warning/10 border-warning/20",
    badge: "bg-warning/10 text-warning border-warning/20",
    trend: "text-warning",
    glow: "shadow-warning/10",
  },
  info: {
    icon: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    badge: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    trend: "text-blue-400",
    glow: "shadow-blue-400/10",
  },
};

const PADDING_MAP: Record<NonNullable<EliteCardProps["padding"]>, string> = {
  none: "p-0",
  sm: "p-4 sm:p-5",
  md: "p-6 sm:p-8",
  lg: "p-8 sm:p-10",
};

const TREND_ICON: Record<TrendDirection, React.ReactNode> = {
  up: <TrendingUp size={11} />,
  down: <TrendingDown size={11} />,
  neutral: <Minus size={11} />,
};

const TREND_COLOR: Record<TrendDirection, string> = {
  up: "text-success bg-success/8 border-success/20",
  down: "text-danger bg-danger/8 border-danger/20",
  neutral: "text-muted-foreground bg-muted/30 border-border/30",
};

/* ─────────────────────── EliteCard ─────────────────────── */

/**
 * Base card container. Use `variant` to switch between surface styles
 * and `padding` to control inner spacing independently of className overrides.
 *
 * variants:
 *  - "default"  → bordered card with hover lift
 *  - "glass"    → frosted-glass surface (uses .glass-card)
 *  - "gradient" → StarBorder animated gradient ring
 *  - "outline"  → border-only, no background fill
 *  - "flat"     → flat muted surface, no border
 */
export function EliteCard({
  children,
  className = "",
  variant = "default",
  padding = "lg",
  ...props
}: EliteCardProps) {
  const variantClasses: Record<CardVariant, string> = {
    default:
      "border border-border/50 bg-card shadow-sm hover:shadow-xl hover:border-primary/25 transition-all duration-500",
    glass: "glass-card border-none",
    gradient: "border border-border/50 bg-card shadow-sm",
    outline:
      "border-2 border-border/60 bg-transparent hover:border-primary/40 transition-all duration-300",
    flat: "bg-muted/30 border-none shadow-none",
  };

  const card = (
    <Card
      shadow="none"
      className={`rounded-[2rem] overflow-hidden ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <CardBody className={PADDING_MAP[padding]}>{children}</CardBody>
    </Card>
  );

  if (variant === "gradient") {
    return (
      <StarBorder innerClassName="overflow-hidden rounded-[2rem]">
        {card}
      </StarBorder>
    );
  }

  return card;
}

/* ─────────────────────── EliteStatCard ─────────────────────── */

/**
 * Metric stat tile used in dashboard overview grids.
 *
 * Supports:
 *  - color-coded icon
 *  - optional badge (top-right)
 *  - optional trend pill (bottom)
 *  - loading skeleton
 *  - click handler
 */
export function EliteStatCard({
  title,
  value,
  icon: Icon,
  color = "primary",
  badge,
  badgeColor,
  trend,
  trendLabel,
  loading = false,
  onClick,
}: EliteStatCardProps) {
  const c = COLOR_MAP[color];
  const bc = badgeColor ? COLOR_MAP[badgeColor] : c;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={`stats-card group relative overflow-hidden
        ${onClick ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" : ""}
      `}
    >
      {/* ambient glow layer */}
      <div className="stats-card-bg" />

      <div className="relative z-10 flex flex-col gap-4 h-full">
        {/* top row: icon + badge */}
        <div className="flex items-start justify-between gap-2">
          <div
            className={`p-3 rounded-2xl border shrink-0 transition-transform duration-400 group-hover:scale-110 ${c.icon}`}
          >
            <Icon size={22} strokeWidth={2.5} />
          </div>

          {badge && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${bc.badge}`}
            >
              {badge}
            </span>
          )}
        </div>

        {/* value block */}
        <div className="flex-1">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] mb-1.5">
            {title}
          </p>
          {loading ? (
            <div className="h-9 w-24 rounded-xl bg-muted/50 animate-pulse" />
          ) : (
            <h3 className="text-3xl font-black text-foreground tracking-tighter italic leading-none">
              {value}
            </h3>
          )}
        </div>

        {/* trend pill */}
        {trend && trendLabel && !loading && (
          <div
            className={`inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${TREND_COLOR[trend]}`}
          >
            {TREND_ICON[trend]}
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── EliteActionCard ─────────────────────── */

/**
 * Clickable card for navigational CTAs and feature shortcuts.
 * Renders an anchor when `href` is provided, otherwise a button-like div.
 */
export function EliteActionCard({
  title,
  description,
  icon: Icon,
  color = "primary",
  label,
  onClick,
  href,
  disabled = false,
  className = "",
}: EliteActionCardProps) {
  const c = COLOR_MAP[color];

  const inner = (
    <div
      className={`relative overflow-hidden group flex items-center justify-between gap-5 p-6 rounded-2xl border-2 transition-all duration-300
        ${disabled
          ? "border-border/20 bg-muted/20 opacity-50 cursor-not-allowed"
          : "border-border/30 bg-muted/20 hover:border-primary/35 hover:bg-primary/[0.04] cursor-pointer hover:scale-[1.005]"
        } ${className}`}
      role={!href && onClick ? "button" : undefined}
      tabIndex={disabled ? -1 : 0}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={!disabled && onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {/* hover glow */}
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-primary/8 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-300 group-hover:rotate-6 bg-primary shadow-primary/30`}
        >
          <Icon size={22} />
        </div>
        <div>
          {label && (
            <p className={`text-[9px] font-black uppercase tracking-[0.35em] mb-0.5 ${c.trend}`}>
              {label}
            </p>
          )}
          <p className="text-base font-black tracking-tighter italic uppercase text-foreground group-hover:text-primary transition-colors leading-none">
            {title}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground font-medium mt-1">{description}</p>
          )}
        </div>
      </div>

      <div className="relative w-9 h-9 rounded-full bg-background border border-border/50 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );

  if (href) {
    return <a href={href} className="block">{inner}</a>;
  }

  return inner;
}

/* ─────────────────────── EliteInfoCard ─────────────────────── */

/**
 * Compact key-value display row.
 * Used inside detail panels and config sections.
 */
export function EliteInfoCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  mono = false,
  className = "",
}: EliteInfoCardProps) {
  const c = COLOR_MAP[accent];

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-xl bg-muted/20 border border-border/30 group hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-200 ${className}`}
    >
      <div className="flex items-center gap-2.5 text-muted-foreground">
        {Icon && <Icon size={13} className={`shrink-0 ${c.trend}`} />}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <span className={`text-xs font-bold text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

/* ─────────────────────── EliteSectionCard ─────────────────────── */

/**
 * Titled section wrapper — a labeled card with a header strip and content area.
 * Useful for grouping related controls inside a page.
 */
export function EliteSectionCard({
  label,
  sub,
  icon: Icon,
  children,
  action,
  className = "",
}: {
  label: string;
  sub?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border/40 bg-muted/20 overflow-hidden ${className}`}>
      {/* header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-muted/10">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Icon size={14} />
            </div>
          )}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary leading-none">
              {label}
            </p>
            {sub && (
              <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{sub}</p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      {/* body */}
      <div className="p-6">{children}</div>
    </div>
  );
}