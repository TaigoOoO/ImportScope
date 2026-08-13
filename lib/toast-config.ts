import { toast } from "sonner";
import { CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { createElement } from "react";

/**
 * Wrapper opcional sobre o sonner — usado nos momentos que mais se
 * beneficiam de um ícone/estilo dedicado (ex: oportunidade gerada). O
 * resto do app continua usando toast.success()/toast.error() direto do
 * sonner, que já está configurado globalmente em app/layout.tsx; não
 * troquei todos os ~15 call sites existentes por essa wrapper, já que a
 * maioria são confirmações simples sem necessidade de tratamento especial.
 */
export const toastConfig = {
  success: (msg: string) =>
    toast.success(msg, {
      icon: createElement(CheckCircle, { size: 16, className: "text-success" }),
    }),
  error: (msg: string) =>
    toast.error(msg, {
      icon: createElement(AlertTriangle, { size: 16, className: "text-danger" }),
    }),
  opportunity: (nome: string, margem: number) =>
    toast.success(
      createElement(
        "div",
        { className: "flex flex-col gap-1" },
        createElement("span", { className: "font-medium" }, "Oportunidade detectada"),
        createElement(
          "span",
          { className: "text-sm text-foreground-tertiary" },
          `${nome} — Margem ${margem.toFixed(0)}%`
        )
      ),
      {
        icon: createElement(Zap, { size: 16, className: "text-primary" }),
        duration: 5000,
      }
    ),
};
