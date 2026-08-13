import type { EstadoIcms, NcmInfo } from "@/types";

export const NCM_TABLE: NcmInfo[] = [
  { codigo: "8518.30.00", descricao: "Fones/headphones", ii: 20, ipi: 0, categoria: "Eletrônicos", exigeCertificacao: "ANATEL" },
  { codigo: "8517.62.00", descricao: "Smartwatches", ii: 20, ipi: 10, categoria: "Eletrônicos", exigeCertificacao: "ANATEL" },
  { codigo: "8507.60.00", descricao: "Power banks", ii: 20, ipi: 0, categoria: "Eletrônicos", exigeCertificacao: "INMETRO" },
  { codigo: "9405.40.00", descricao: "Luminárias LED", ii: 20, ipi: 5, categoria: "Casa", exigeCertificacao: "INMETRO" },
  { codigo: "3926.90.00", descricao: "Artigos plásticos", ii: 20, ipi: 0, categoria: "Casa" },
  { codigo: "4202.92.00", descricao: "Bolsas/mochilas", ii: 20, ipi: 0, categoria: "Moda" },
  { codigo: "8205.40.00", descricao: "Ferramentas manuais", ii: 20, ipi: 0, categoria: "Ferramentas" },
  { codigo: "8529.90.00", descricao: "Suportes eletrônicos", ii: 20, ipi: 0, categoria: "Eletrônicos" },
  { codigo: "9617.00.00", descricao: "Copos térmicos", ii: 20, ipi: 0, categoria: "Casa" },
  { codigo: "8473.30.00", descricao: "Acessórios computador", ii: 0, ipi: 0, categoria: "Eletrônicos" },
  { codigo: "3921.90.00", descricao: "Esteiras/exercício", ii: 20, ipi: 0, categoria: "Esporte" },
  { codigo: "8504.40.00", descricao: "Transformadores/carregadores", ii: 20, ipi: 0, categoria: "Eletrônicos", exigeCertificacao: "INMETRO" },
  { codigo: "6116.10.00", descricao: "Luvas", ii: 20, ipi: 0, categoria: "Moda" },
  { codigo: "8414.80.00", descricao: "Compressores", ii: 18, ipi: 5, categoria: "Ferramentas", exigeCertificacao: "INMETRO" },
  { codigo: "6109.10.00", descricao: "Camisetas de algodão", ii: 20, ipi: 0, categoria: "Moda" },
  { codigo: "9503.00.00", descricao: "Brinquedos", ii: 20, ipi: 0, categoria: "Casa", exigeCertificacao: "INMETRO" },
  { codigo: "4016.99.90", descricao: "Artigos de borracha", ii: 18, ipi: 0, categoria: "Casa" },
  { codigo: "8543.70.99", descricao: "Aparelhos elétricos diversos", ii: 20, ipi: 5, categoria: "Eletrônicos", exigeCertificacao: "INMETRO" },
  { codigo: "3924.10.00", descricao: "Utensílios de cozinha plástico", ii: 18, ipi: 0, categoria: "Casa" },
  { codigo: "9506.99.90", descricao: "Artigos para esporte", ii: 20, ipi: 0, categoria: "Esporte" },
];

export const ESTADOS_ICMS: EstadoIcms[] = [
  { uf: "SP", nome: "São Paulo", aliquota: 18 },
  { uf: "RJ", nome: "Rio de Janeiro", aliquota: 20 },
  { uf: "MG", nome: "Minas Gerais", aliquota: 18 },
  { uf: "RS", nome: "Rio Grande do Sul", aliquota: 17 },
  { uf: "PR", nome: "Paraná", aliquota: 18 },
  { uf: "SC", nome: "Santa Catarina", aliquota: 17 },
  { uf: "BA", nome: "Bahia", aliquota: 18 },
  { uf: "OUTROS", nome: "Outros estados", aliquota: 18 },
];

export const PIS_ALIQUOTA = 1.65;
export const COFINS_ALIQUOTA = 7.6;
export const AFRMM_ALIQUOTA = 25;
export const SISCOMEX_TAXA_FIXA = 185.0;
