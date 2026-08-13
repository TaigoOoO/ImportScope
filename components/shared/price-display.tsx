"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { formatBRL, formatUSD, cn } from "@/lib/utils";

interface PriceDisplayProps {
  value: number;
  currency?: "BRL" | "USD";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  accent?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<PriceDisplayProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-number-card",
  lg: "text-2xl",
  xl: "text-number-lg",
};

/**
 * Conta até o valor em vez de aparecer pronto — efeito "estação de
 * trading". Mantém a formatação de moeda de verdade (Intl.NumberFormat via
 * formatBRL/formatUSD) em vez do prefixo genérico + toFixed(2) do brief
 * original, porque FOB é sempre USD e precisa do símbolo/formato certo,
 * não um "R$" fixo.
 */
export function PriceDisplay({
  value,
  currency = "BRL",
  size = "md",
  className,
  accent = false,
}: PriceDisplayProps) {
  const spring = useSpring(0, { duration: 900, bounce: 0 });
  const display = useTransform(spring, (v) => (currency === "BRL" ? formatBRL(v) : formatUSD(v)));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span
      className={cn(
        "font-mono font-semibold tabular-nums",
        SIZE_CLASSES[size],
        accent ? "text-foreground-accent" : "text-foreground",
        className
      )}
    >
      {display}
    </motion.span>
  );
}
