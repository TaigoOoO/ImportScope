import { NCM_TABLE, ESTADOS_ICMS, PIS_ALIQUOTA, COFINS_ALIQUOTA, AFRMM_ALIQUOTA, SISCOMEX_TAXA_FIXA } from "@/lib/tax-data";
import { USD_BRL, MARGEM_PADRAO } from "@/lib/constants";
import type { CalculoTributarioInput, CalculoTributarioOutput } from "@/types";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export class NcmNaoEncontradoError extends Error {
  constructor(ncm: string) {
    super(`NCM "${ncm}" não encontrado na tabela.`);
    this.name = "NcmNaoEncontradoError";
  }
}

/**
 * Calcula o custo total de importação seguindo a sequência:
 * 1. CIF = FOB + Frete + Seguro
 * 2. II = CIF * aliquotaII
 * 3. IPI = (CIF + II) * aliquotaIPI
 * 4. PIS = (CIF + II + IPI) * 1,65%
 * 5. COFINS = (CIF + II + IPI) * 7,6%
 * 6. AFRMM = Frete * 25% (só marítimo)
 * 7. Siscomex = R$ 185,00 fixo
 * 8. Base ICMS = (CIF + II + IPI + PIS + COFINS) / (1 - aliquotaICMS)
 * 9. ICMS = Base ICMS * aliquotaICMS
 * 10. Custo total = CIF + II + IPI + PIS + COFINS + AFRMM + ICMS + Siscomex
 * 11. Preço mínimo = Custo total * (1 + margem)
 *
 * Os valores de entrada (fob, frete, seguro) são informados em USD e
 * convertidos para BRL usando `usdBrl` — por padrão a cotação fixa de
 * `lib/constants.ts`, mas o chamador (ver app/api/calcular/route.ts) passa
 * a cotação ao vivo do Banco Central quando disponível.
 */
export function calcularImportacao(
  input: CalculoTributarioInput,
  usdBrl: number = USD_BRL
): CalculoTributarioOutput {
  const ncmInfo = NCM_TABLE.find((n) => n.codigo === input.ncm);
  if (!ncmInfo) {
    throw new NcmNaoEncontradoError(input.ncm);
  }

  const estadoInfo =
    ESTADOS_ICMS.find((e) => e.uf === input.estado) ?? ESTADOS_ICMS.find((e) => e.uf === "OUTROS")!;

  const fobBRL = input.fob * usdBrl;
  const freteBRL = input.frete * usdBrl;
  const seguroBRL = input.seguro * usdBrl;

  const cif = fobBRL + freteBRL + seguroBRL;

  const aliquotaII = ncmInfo.ii / 100;
  const ii = cif * aliquotaII;

  const aliquotaIPI = ncmInfo.ipi / 100;
  const ipi = (cif + ii) * aliquotaIPI;

  const pis = (cif + ii + ipi) * (PIS_ALIQUOTA / 100);
  const cofins = (cif + ii + ipi) * (COFINS_ALIQUOTA / 100);

  const afrmm = input.transporte === "maritimo" ? freteBRL * (AFRMM_ALIQUOTA / 100) : 0;
  const siscomex = SISCOMEX_TAXA_FIXA;

  const aliquotaIcms = estadoInfo.aliquota / 100;
  const baseAntesIcms = cif + ii + ipi + pis + cofins;
  const baseIcms = baseAntesIcms / (1 - aliquotaIcms);
  const icms = baseIcms * aliquotaIcms;

  const custoTotalBRL = cif + ii + ipi + pis + cofins + afrmm + icms + siscomex;
  const precoMinimoVenda = custoTotalBRL * (1 + MARGEM_PADRAO / 100);

  const alertas: string[] = [];
  if (ncmInfo.exigeCertificacao) {
    alertas.push(`⚠️ Este produto pode exigir certificação ${ncmInfo.exigeCertificacao}.`);
  }
  if (input.fob > 1000) {
    alertas.push("💡 Importações acima de US$ 1.000 exigem Licença de Importação (LI).");
  }

  return {
    success: true,
    usdBrlUsado: usdBrl,
    breakdown: {
      cif: round2(cif),
      ii: { aliquota: aliquotaII, valor: round2(ii) },
      ipi: { aliquota: aliquotaIPI, valor: round2(ipi) },
      pis: { aliquota: PIS_ALIQUOTA / 100, valor: round2(pis) },
      cofins: { aliquota: COFINS_ALIQUOTA / 100, valor: round2(cofins) },
      afrmm: { aliquota: input.transporte === "maritimo" ? AFRMM_ALIQUOTA / 100 : 0, valor: round2(afrmm) },
      icms: { aliquota: aliquotaIcms, baseCalculo: round2(baseIcms), valor: round2(icms) },
      siscomex: round2(siscomex),
    },
    custoTotalBRL: round2(custoTotalBRL),
    precoMinimoVenda: round2(precoMinimoVenda),
    alertas,
  };
}
