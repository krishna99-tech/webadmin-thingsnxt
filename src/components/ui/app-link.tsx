import NextLink from "next/link";
import type { ComponentProps } from "react";

export type AppLinkProps = ComponentProps<typeof NextLink> & {
  /** Default false — avoids Next.js RSC prefetch fetch errors in dev / cross-host access. */
  prefetch?: boolean;
};

export function AppLink({ prefetch = false, ...props }: AppLinkProps) {
  return <NextLink prefetch={prefetch} {...props} />;
}
