"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlowEffectProps {
  children: ReactNode;
  className?: string;
  intensity?: "sm" | "md" | "lg";
  active?: boolean;
}

const INTENSITY_CLASSES: Record<NonNullable<GlowEffectProps["intensity"]>, string> = {
  sm: "shadow-glow-sm",
  md: "shadow-glow",
  lg: "shadow-[0_0_60px_rgba(249,115,22,0.25)]",
};

/**
 * Wraps children in a soft orange glow. Set `active={false}` to render
 * without the glow (e.g. toggled on hover from a parent's state).
 */
export function GlowEffect({ children, className, intensity = "md", active = true }: GlowEffectProps) {
  return (
    <div className={cn(active && INTENSITY_CLASSES[intensity], "rounded-card transition-shadow duration-300", className)}>
      {children}
    </div>
  );
}
