/**
 * Shared HeroUI classNames — use on Button / Input / Card for a consistent “React Bits” polish.
 */
export const buttonPrimaryClasses =
  "font-semibold shadow-md shadow-primary/25 data-[hover=true]:shadow-lg data-[hover=true]:opacity-[0.98]";

export const buttonSecondaryClasses =
  "font-medium border border-default-200/80 dark:border-default-100/15";

export const inputComfortableClasses = {
  label: "text-default-700 dark:text-default-300 font-medium text-sm",
  input: "text-[15px] placeholder:text-default-400",
  innerWrapper: "gap-2",
  inputWrapper:
    "h-[48px] px-3 bg-default-50 dark:bg-default-100/10 border border-default-200 dark:border-default-100/15 " +
    "data-[hover=true]:border-default-300 dark:data-[hover=true]:border-default-100/25 " +
    "group-data-[focus=true]:border-primary group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-primary/20 " +
    "rounded-xl transition-colors",
} as const;
