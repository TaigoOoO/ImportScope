"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const PASSOS = [
  "Conectando ao mercado chinês...",
  "Analisando alíquotas tributárias...",
  "Consultando histórico de retenção...",
  "Calculando margem real...",
  "Verificando certificações...",
  "Oportunidade identificada",
];

export function ScanningLoader() {
  const [passoAtual, setPassoAtual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setPassoAtual((p) => (p < PASSOS.length - 1 ? p + 1 : p));
    }, 800);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className="absolute inset-2 rounded-full border border-border/50" />
        <div className="absolute inset-4 rounded-full border border-border/30" />
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute left-1/2 top-0 h-1/2 w-px origin-bottom -translate-x-1/2 bg-gradient-to-b from-primary/80 to-transparent" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="h-2 w-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </div>

      <div className="h-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={passoAtual}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-sm text-foreground-tertiary"
          >
            {PASSOS[passoAtual]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
