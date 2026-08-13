export type Risco = "BAIXO" | "MEDIO" | "ALTO";

export type PlanoUsuario = "free" | "pro";

export interface Oportunidade {
  id: string;
  userId: string;
  nome: string;
  categoria: string;
  precoFOB: number;
  ncm: string;
  precoMLBR: number;
  margemEstimada: number;
  risco: Risco;
  riscoMotivo: string;
  copyVenda: string;
  imagem: string;
  certificacoes: string[];
  alertas: string[];
  custoTotalBRL: number;
  precoVendaSugerido: number;
  fornecedor: string;
  fornecedorUrl?: string | null;
  moq: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface FiltrosOportunidades {
  categoria?: string;
  risco?: Risco;
  margemMinima?: number;
}

export interface CalculoTributarioInput {
  fob: number;
  frete: number;
  seguro: number;
  ncm: string;
  estado: string;
  transporte: "aereo" | "maritimo";
}

export interface ImpostoDetalhe {
  aliquota: number;
  valor: number;
}

export interface CalculoTributarioBreakdown {
  cif: number;
  ii: ImpostoDetalhe;
  ipi: ImpostoDetalhe;
  pis: ImpostoDetalhe;
  cofins: ImpostoDetalhe;
  afrmm: ImpostoDetalhe;
  icms: ImpostoDetalhe & { baseCalculo: number };
  siscomex: number;
}

export interface CalculoTributarioOutput {
  success: true;
  usdBrlUsado: number;
  cotacaoFonte?: "bcb" | "fallback";
  breakdown: CalculoTributarioBreakdown;
  custoTotalBRL: number;
  precoMinimoVenda: number;
  alertas: string[];
}

export interface NcmInfo {
  codigo: string;
  descricao: string;
  ii: number;
  ipi: number;
  categoria: string;
  exigeCertificacao?: string;
}

export interface EstadoIcms {
  uf: string;
  nome: string;
  aliquota: number;
}
