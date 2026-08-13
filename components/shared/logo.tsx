"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

/**
 * Conceito: "radar de arbitragem". O hexágono se desenha como um contorno
 * de radar (pathLength 0→1), e o ponto no centro pulsa como um sinal
 * detectado. Mantém a API numérica de `size` (em vez do enum small/default/large
 * do brief original) porque o Logo já é chamado em ~8 lugares do app com
 * valores como size={32}/{36}/{40}/{48} — trocar a API quebraria todos eles.
 */
export function Logo({ size = 40, showText = true, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" width={size} height={size} className="absolute inset-0">
          <motion.polygon
            points="20,2 36,11 36,29 20,38 4,29 4,11"
            fill="none"
            stroke="#F97316"
            strokeWidth="2.5"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
        </svg>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 15 }}
        >
          <div className="relative">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" style={{ width: size * 0.08, height: size * 0.08 }} />
            <motion.div
              className="absolute inset-0 rounded-full bg-primary"
              style={{ width: size * 0.08, height: size * 0.08 }}
              animate={{ scale: [1, 2.8, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight text-foreground">
            Import<span className="text-primary">Scope</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-foreground-tertiary">
            Inteligência de Importação
          </span>
        </div>
      )}
    </div>
  );
}
