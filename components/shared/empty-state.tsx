"use client";

import { motion } from "framer-motion";
import { Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * O radar com a antena balançando é sempre o mesmo personagem — não recebe
 * mais um ícone por chamador (todos os usos atuais já eram sobre "nenhuma
 * oportunidade encontrada", então fixar o radar simplifica a API em vez de
 * quebrar alguma coisa).
 */
export function EmptyState({ title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-card border border-dashed border-border py-20 text-center",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="relative mb-6"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-border bg-background-card">
          <Radar className="h-8 w-8 text-foreground-tertiary" />
        </div>
        <motion.div
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs">📡</span>
        </motion.div>
      </motion.div>

      <p className="text-lg font-semibold text-foreground-secondary">{title}</p>
      <p className="mb-4 max-w-sm text-sm text-foreground-tertiary">{description}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
