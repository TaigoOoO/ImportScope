export const LIMITE_GERACOES_FREE = 2;
export const MARGEM_PADRAO = 30;
export const MARGEM_MINIMA_PADRAO = 40;
export const USD_BRL = 5.2;

export const PRO_PRECO_MENSAL = 29;
export const PRO_PRECO_LABEL = "R$ 29/mês";

export const CORES_RISCO: Record<string, string> = {
  BAIXO: "#10B981",
  MEDIO: "#F59E0B",
  ALTO: "#EF4444",
};

export const LABELS_RISCO: Record<string, string> = {
  BAIXO: "🟢 Baixo",
  MEDIO: "🟡 Médio",
  ALTO: "🔴 Alto",
};

export const CATEGORIAS = ["Eletrônicos", "Casa", "Moda", "Ferramentas", "Esporte"] as const;

export const TEXTOS = {
  landingHeadlinePrefix: "Importadores estão pagando",
  landingHeadlineDestaque: "R$ 10 mil em multa",
  landingHeadlineSuffix: "por erro de NCM.",
  landingSubheadline: "Esse dashboard calcula seu custo real antes do prejuízo.",
  landingCtaBadge: "🚀 Lista de Espera Aberta",
  landingCtaButton: "Quero ver o primeiro relatório — só 10 vagas",
  upgradeTitulo: "Desbloqueie o potencial completo",
  upgradeTexto: "Gere oportunidades ilimitadas e acesse a calculadora completa",
  emptyOportunidadesTitulo: "Nenhuma oportunidade ainda",
  emptyOportunidadesTexto: "Clique em \"Gerar Oportunidade\" para começar",
} as const;

export const FAQ_ITEMS = [
  {
    pergunta: "Como o ImportScope calcula os impostos de importação?",
    resposta:
      "Usamos as alíquotas oficiais de II, IPI, PIS, COFINS, ICMS e AFRMM por NCM e estado, seguindo o método de cálculo \"por dentro\" do ICMS definido pela Receita Federal.",
  },
  {
    pergunta: "As oportunidades de produto são reais?",
    resposta:
      "No plano atual, as oportunidades combinam uma base de produtos de referência com análise de IA para estimar margem, risco e viabilidade — pense nelas como um ponto de partida para sua própria pesquisa, não uma garantia de venda.",
  },
  {
    pergunta: "Qual a diferença entre o plano Free e o Pro?",
    resposta:
      "O Free permite até 2 gerações de oportunidade por dia e acesso à calculadora sem histórico salvo. O Pro libera gerações ilimitadas, histórico completo e exportação de relatórios.",
  },
  {
    pergunta: "Preciso de CNPJ para usar a calculadora?",
    resposta:
      "Não. A calculadora estima custos para qualquer operação de importação, seja pessoa física ou jurídica — mas o enquadramento tributário exato deve sempre ser validado com seu despachante ou contador.",
  },
  {
    pergunta: "Como cancelo minha assinatura Pro?",
    resposta:
      "A qualquer momento, direto em Configurações → Assinatura, ou pelo portal de cobrança da Stripe. Não há fidelidade.",
  },
] as const;
