"use client";

import { useEffect, useState, type ReactNode } from "react";

export function FadeIn({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(true), []);

  return (
    <div
      className={`transition-opacity duration-500 ease-out ${on ? "opacity-100" : "opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}
