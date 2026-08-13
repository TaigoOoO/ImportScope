import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRO_PRECO_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  "2 gerações de oportunidade por dia",
  "Calculadora tributária completa",
  "Visualização de oportunidades existentes",
];

const PRO_FEATURES = [
  "Gerações de oportunidade ilimitadas",
  "Histórico completo salvo",
  "Exportação de relatórios em PDF",
  "Acesso prioritário a novas oportunidades",
];

export function PricingSection() {
  return (
    <section id="precos" className="bg-background-card py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-section text-foreground">Preços simples, sem pegadinha</h2>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center rounded-card border border-border bg-background p-6 text-center">
            <p className="text-sm font-medium text-foreground-secondary">Free</p>
            <p className="mt-2 font-mono text-4xl font-bold text-foreground">R$ 0</p>
            <ul className="mt-6 flex flex-col items-center gap-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground-secondary">
                  <Check className="h-4 w-4 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-8 w-full">
              <Link href="/login">Começar grátis</Link>
            </Button>
          </div>

          <div
            className={cn(
              "relative flex flex-col items-center rounded-card border-2 border-primary bg-background p-6 text-center shadow-glow"
            )}
          >
            <Badge variant="fire" className="absolute -top-3 left-1/2 -translate-x-1/2">
              MAIS POPULAR
            </Badge>
            <p className="text-sm font-medium text-primary">Pro</p>
            <p className="mt-2 font-mono text-4xl font-bold text-foreground">{PRO_PRECO_LABEL}</p>
            <ul className="mt-6 flex flex-col items-center gap-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground-secondary">
                  <Check className="h-4 w-4 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 w-full">
              <Link href="/login">Assinar Pro</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
