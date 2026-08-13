"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogBody,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BadgeRisk } from "@/components/shared/badge-risk";
import { PriceDisplay } from "@/components/shared/price-display";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendsBadge } from "@/components/integrations/trends-badge";
import { formatBRL, formatPercent } from "@/lib/utils";
import type { CalculoTributarioOutput, Oportunidade } from "@/types";
import { AlertTriangle, ShieldCheck, Copy, ExternalLink, FileText } from "lucide-react";

interface OpportunityModalProps {
  oportunidade: Oportunidade | null;
  onOpenChange: (open: boolean) => void;
}

export function OpportunityModal({ oportunidade, onOpenChange }: OpportunityModalProps) {
  const [breakdown, setBreakdown] = useState<CalculoTributarioOutput | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!oportunidade) {
      setBreakdown(null);
      return;
    }

    setCarregando(true);
    fetch("/api/calcular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fob: oportunidade.precoFOB,
        frete: Number((oportunidade.precoFOB * 0.3).toFixed(2)),
        seguro: Number((oportunidade.precoFOB * 0.02).toFixed(2)),
        ncm: oportunidade.ncm,
        estado: "SP",
        transporte: "maritimo",
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(setBreakdown)
      .finally(() => setCarregando(false));
  }, [oportunidade]);

  if (!oportunidade) return null;

  const investimentoMOQ = oportunidade.custoTotalBRL * oportunidade.moq;
  const roi =
    oportunidade.custoTotalBRL > 0
      ? ((oportunidade.precoVendaSugerido - oportunidade.custoTotalBRL) / oportunidade.custoTotalBRL) * 100
      : 0;

  function copiarDados() {
    if (!oportunidade) return;
    const texto = `${oportunidade.nome}
Fornecedor: ${oportunidade.fornecedor}
NCM: ${oportunidade.ncm}
FOB: US$ ${oportunidade.precoFOB}
Preço ML BR: ${formatBRL(oportunidade.precoMLBR)}
Custo total estimado: ${formatBRL(oportunidade.custoTotalBRL)}
Margem estimada: ${formatPercent(oportunidade.margemEstimada)}`;

    navigator.clipboard.writeText(texto).then(() => {
      toast.success("Dados copiados para a área de transferência");
    });
  }

  return (
    <Dialog open={!!oportunidade} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="relative h-[200px] w-full">
          <Image
            src={oportunidade.imagem}
            alt={oportunidade.nome}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute bottom-3 left-3">
            <BadgeRisk risco={oportunidade.risco} />
          </div>

          <div className="absolute bottom-3 right-3">
            <TrendsBadge keyword={oportunidade.nome} />
          </div>
        </div>

        <DialogBody>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{oportunidade.nome}</h2>
            <p className="text-sm text-foreground-tertiary">
              {oportunidade.fornecedor} · China · NCM {oportunidade.ncm}
            </p>
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-caption uppercase text-foreground-tertiary">Análise de Custo</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {carregando || !breakdown ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-tertiary">CIF</span>
                    <span className="font-mono text-foreground">{formatBRL(breakdown.breakdown.cif)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-tertiary">
                      II ({formatPercent(breakdown.breakdown.ii.aliquota * 100, 0)})
                    </span>
                    <span className="font-mono text-foreground">{formatBRL(breakdown.breakdown.ii.valor)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-tertiary">IPI</span>
                    <span className="font-mono text-foreground">{formatBRL(breakdown.breakdown.ipi.valor)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-tertiary">PIS/COFINS</span>
                    <span className="font-mono text-foreground">
                      {formatBRL(breakdown.breakdown.pis.valor + breakdown.breakdown.cofins.valor)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-tertiary">
                      ICMS ({formatPercent(breakdown.breakdown.icms.aliquota * 100, 0)})
                    </span>
                    <span className="font-mono text-foreground">{formatBRL(breakdown.breakdown.icms.valor)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-tertiary">AFRMM</span>
                    <span className="font-mono text-foreground">{formatBRL(breakdown.breakdown.afrmm.valor)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-tertiary">Siscomex</span>
                    <span className="font-mono text-foreground">{formatBRL(breakdown.breakdown.siscomex)}</span>
                  </div>
                </div>

                <div className="rounded-input bg-gradient-to-br from-primary/15 to-transparent p-4">
                  <p className="text-xs uppercase text-foreground-tertiary">Custo Total (unitário, estimado)</p>
                  <p className="font-mono text-2xl font-bold text-foreground">
                    {formatBRL(breakdown.custoTotalBRL)}
                  </p>
                </div>
                <p className="text-xs text-foreground-tertiary">
                  Estimativa com frete internacional de 30% do FOB e seguro de 2% do FOB, via marítimo, ICMS-SP.
                  Ajuste os parâmetros na Calculadora para o seu caso real.
                </p>
              </>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-caption uppercase text-foreground-tertiary">Oportunidade</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-foreground-tertiary">Preço ML</p>
                <PriceDisplay value={oportunidade.precoMLBR} size="sm" className="text-base" />
              </div>
              <div>
                <p className="text-xs text-foreground-tertiary">Margem Estimada</p>
                <p className="font-mono text-base font-semibold text-success">
                  {formatPercent(oportunidade.margemEstimada)}
                </p>
              </div>
              <div>
                <p className="text-xs text-foreground-tertiary">Investimento inicial (MOQ: {oportunidade.moq})</p>
                <PriceDisplay value={investimentoMOQ} size="sm" className="text-base" />
              </div>
              <div>
                <p className="text-xs text-foreground-tertiary">ROI estimado</p>
                <p className="font-mono text-base font-semibold text-foreground-accent">
                  {formatPercent(roi, 0)}
                </p>
              </div>
            </div>
          </section>

          {oportunidade.certificacoes.length > 0 && (
            <section>
              <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                Certificações necessárias
              </p>
              <ul className="list-inside list-disc text-sm text-foreground-secondary">
                {oportunidade.certificacoes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
          )}

          {oportunidade.alertas.length > 0 && (
            <section className="flex flex-col gap-2">
              {oportunidade.alertas.map((alerta) => (
                <div
                  key={alerta}
                  className="flex items-start gap-2 rounded-md border-l-4 border-warning bg-warning/[0.08] px-3 py-2 text-sm text-foreground-secondary"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  {alerta}
                </div>
              ))}
            </section>
          )}

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-caption uppercase text-foreground-tertiary">Próximo Passo</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <ol className="flex flex-col gap-1.5 text-sm text-foreground-secondary">
              <li>1. Confirme a margem na Calculadora com seus custos reais de frete e seguro.</li>
              <li>2. Verifique se o NCM exige certificação antes de fechar o pedido.</li>
              <li>3. Negocie o MOQ com o fornecedor e solicite amostras.</li>
            </ol>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" className="flex-1" onClick={copiarDados}>
                <Copy className="h-4 w-4" />
                Copiar Dados
              </Button>
              {oportunidade.fornecedorUrl && (
                <Button asChild className="flex-1">
                  <a href={oportunidade.fornecedorUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Ver no 1688
                  </a>
                </Button>
              )}
            </div>
            <p className="flex items-center gap-1.5 text-xs text-foreground-tertiary">
              <FileText className="h-3.5 w-3.5" />
              {oportunidade.copyVenda}
            </p>
          </section>

          <div className="rounded-input border border-warning/30 bg-warning/[0.05] p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-warning">Aviso Legal</p>
            <p className="text-xs leading-relaxed text-foreground-secondary">
              Os valores apresentados são estimativas baseadas em alíquotas vigentes e em análise
              por inteligência artificial. Confirme com um despachante aduaneiro habilitado antes
              de importar.
            </p>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
