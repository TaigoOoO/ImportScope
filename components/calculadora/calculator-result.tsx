"use client";

import { FileText, AlertTriangle, Loader2, Calculator, Copy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaxBreakdown } from "@/components/calculadora/tax-breakdown";
import { formatBRL } from "@/lib/utils";
import type { CalculoTributarioOutput } from "@/types";

interface CalculatorResultProps {
  resultado: CalculoTributarioOutput | null;
  carregando: boolean;
  contaComHistorico: boolean;
}

const AVISO_ESTIMATIVA = "Lembre-se: este é um cálculo estimado. Confirme antes de importar.";

export function CalculatorResult({ resultado, carregando, contaComHistorico }: CalculatorResultProps) {
  function avisarSobreEstimativa() {
    toast.info(AVISO_ESTIMATIVA);
  }

  function copiarResultado() {
    if (!resultado) return;
    const texto = `Custo Total: ${formatBRL(resultado.custoTotalBRL)}
Preço Mínimo de Venda: ${formatBRL(resultado.precoMinimoVenda)}

Este cálculo é uma estimativa. Alíquotas podem variar. Consulte um profissional habilitado.`;
    navigator.clipboard.writeText(texto);
    avisarSobreEstimativa();
  }

  return (
    <Card className="bg-background">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Resultado da Importação
        </CardTitle>
        {carregando && <Loader2 className="h-4 w-4 animate-spin text-foreground-tertiary" />}
      </CardHeader>
      {/* onCopyCapture cobre também o Ctrl+C nativo após selecionar texto dentro do resultado */}
      <CardContent className="flex flex-col gap-5" onCopyCapture={resultado ? avisarSobreEstimativa : undefined}>
        {!contaComHistorico && (
          <div className="rounded-input border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
            Upgrade para o plano Pro para salvar o histórico dos seus cálculos.
          </div>
        )}

        {!resultado ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Calculator className="h-12 w-12 text-foreground-tertiary" />
            <p className="font-medium text-foreground">Preencha os dados acima</p>
            <p className="text-sm text-foreground-tertiary">
              Vamos calcular seu custo real de importação
            </p>
          </div>
        ) : (
          <>
            <p className="-mt-2 flex items-center gap-1.5 text-xs text-foreground-tertiary">
              Cotação usada: R$ {resultado.usdBrlUsado.toFixed(4)} / US$
              {resultado.cotacaoFonte === "fallback" && " (referência — BCB indisponível no momento)"}
              {resultado.cotacaoFonte === "bcb" && " (Banco Central, ao vivo)"}
            </p>
            <TaxBreakdown resultado={resultado} />

            <div className="h-0.5 w-full bg-border" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase text-foreground-tertiary">Custo Total</p>
                <p className="font-mono text-number-lg text-foreground">{formatBRL(resultado.custoTotalBRL)}</p>
              </div>
              <Button variant="outline" size="sm" onClick={copiarResultado} className="mt-1 shrink-0">
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase text-foreground-tertiary">Preço Mínimo de Venda (+30%)</p>
              <p className="font-mono text-2xl font-semibold text-foreground-accent">
                {formatBRL(resultado.precoMinimoVenda)}
              </p>
              <p className="text-xs text-foreground-tertiary">
                Para 30% de lucro, venda a: {formatBRL(resultado.precoMinimoVenda)}
              </p>
            </div>

            {resultado.alertas.length > 0 && (
              <div className="flex flex-col gap-2">
                {resultado.alertas.map((alerta) => (
                  <div
                    key={alerta}
                    className="flex items-start gap-2 rounded-md border-l-4 border-warning bg-warning/[0.08] px-3 py-2 text-sm text-foreground-secondary"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    {alerta}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-start gap-2 rounded-input border border-warning/30 bg-warning/[0.05] px-3 py-2.5">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p className="text-xs leading-relaxed text-foreground-secondary">
                Este cálculo é uma estimativa. Alíquotas podem variar. Consulte um profissional
                habilitado.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
