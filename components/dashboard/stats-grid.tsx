"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Search, TrendingUp, Wallet, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { cn } from "@/lib/utils";

interface StatCard {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: string;
}

interface StatsGridProps {
  oportunidadesAnalisadas: number;
  margemMedia: number;
  economiaEstimadaBRL: number;
  alertasRisco: number;
}

export function StatsGrid({
  oportunidadesAnalisadas,
  margemMedia,
  economiaEstimadaBRL,
  alertasRisco,
}: StatsGridProps) {
  const cards: StatCard[] = [
    {
      label: "Oportunidades Analisadas",
      value: oportunidadesAnalisadas,
      icon: Search,
      color: "#3B82F6",
    },
    {
      label: "Margem Média",
      value: margemMedia,
      icon: TrendingUp,
      color: "#10B981",
      suffix: "%",
      decimals: 1,
    },
    {
      label: "Economia Estimada",
      value: economiaEstimadaBRL,
      icon: Wallet,
      color: "#F97316",
      prefix: "R$ ",
      decimals: 0,
    },
    {
      label: "Alertas de Risco",
      value: alertasRisco,
      icon: AlertTriangle,
      color: "#EF4444",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, delay: i * 0.08, ease: "easeOut" }}
        >
          <Card>
            <CardContent className="flex flex-col gap-3 pt-5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-md"
                style={{ backgroundColor: `${card.color}1A`, color: card.color }}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <p className="text-caption uppercase text-foreground-tertiary">{card.label}</p>
              <p className={cn("font-mono text-number-card text-foreground")}>
                <AnimatedCounter
                  value={card.value}
                  prefix={card.prefix}
                  suffix={card.suffix}
                  decimals={card.decimals ?? 0}
                />
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
