export interface ProdutoMock {
  nome: string;
  categoria: string;
  precoFOB: number;
  ncm: string;
  precoMLBR: number;
  fornecedor: string;
  moq: number;
}

export const PRODUTOS_MOCK: ProdutoMock[] = [
  { nome: "Fone TWS Bluetooth 5.3", categoria: "Eletrônicos", precoFOB: 2.4, ncm: "8518.30.00", precoMLBR: 89.9, fornecedor: "Shenzhen Audio Tech", moq: 200 },
  { nome: "Smartwatch Fitness Pro", categoria: "Eletrônicos", precoFOB: 12.0, ncm: "8517.62.00", precoMLBR: 299.0, fornecedor: "Guangzhou Wearables", moq: 50 },
  { nome: "Power Bank 20000mAh", categoria: "Eletrônicos", precoFOB: 4.5, ncm: "8507.60.00", precoMLBR: 79.9, fornecedor: "Dongguan Power Co", moq: 100 },
  { nome: "Luminária LED Inteligente", categoria: "Casa", precoFOB: 3.2, ncm: "9405.40.00", precoMLBR: 129.0, fornecedor: "Zhongshan Lighting", moq: 100 },
  { nome: "Organizador de Mesa Acrílico", categoria: "Casa", precoFOB: 1.8, ncm: "3926.90.00", precoMLBR: 45.0, fornecedor: "Ningbo Home Goods", moq: 300 },
  { nome: "Mochila Anti-Furto USB", categoria: "Moda", precoFOB: 8.5, ncm: "4202.92.00", precoMLBR: 189.0, fornecedor: "Guangzhou Bags", moq: 50 },
  { nome: "Kit Chaves de Fenda Precisão", categoria: "Ferramentas", precoFOB: 1.2, ncm: "8205.40.00", precoMLBR: 39.9, fornecedor: "Hangzhou Tools", moq: 500 },
  { nome: "Suporte Celular Carro", categoria: "Eletrônicos", precoFOB: 0.8, ncm: "8529.90.00", precoMLBR: 29.9, fornecedor: "Shenzhen Auto Acc", moq: 500 },
  { nome: "Copo Térmico Inox 500ml", categoria: "Casa", precoFOB: 2.0, ncm: "9617.00.00", precoMLBR: 59.9, fornecedor: "Yongkang Steel", moq: 200 },
  { nome: "Mouse Pad RGB Gamer", categoria: "Eletrônicos", precoFOB: 1.5, ncm: "8473.30.00", precoMLBR: 49.9, fornecedor: "Dongguan Gaming", moq: 200 },
  { nome: "Anel Inteligente Monitor Sono", categoria: "Eletrônicos", precoFOB: 15.0, ncm: "8517.62.00", precoMLBR: 399.0, fornecedor: "Beijing Health Tech", moq: 50 },
  { nome: "Esteira Yoga TPE Ecológica", categoria: "Esporte", precoFOB: 4.0, ncm: "3921.90.00", precoMLBR: 99.0, fornecedor: "Shanghai Fitness", moq: 100 },
  { nome: "Carregador Indução 15W", categoria: "Eletrônicos", precoFOB: 3.0, ncm: "8504.40.00", precoMLBR: 69.9, fornecedor: "Shenzhen Charge", moq: 100 },
  { nome: "Luvas Táticas Militares", categoria: "Moda", precoFOB: 2.5, ncm: "6116.10.00", precoMLBR: 55.0, fornecedor: "Guangzhou Tactical", moq: 100 },
  { nome: "Mini Compressor Ar Portátil", categoria: "Ferramentas", precoFOB: 18.0, ncm: "8414.80.00", precoMLBR: 249.0, fornecedor: "Zhejiang Pneumatic", moq: 30 },
];

export function imagemMock(nome: string): string {
  const texto = encodeURIComponent(nome.replace(/\s+/g, "+"));
  return `https://placehold.co/400x300/111827/F97316?text=${texto}`;
}

export function fornecedorUrlMock(fornecedor: string): string {
  const slug = encodeURIComponent(fornecedor);
  return `https://www.1688.com/empresa/${slug}.html`;
}

/**
 * Seleciona um produto mock aleatório, opcionalmente filtrado por categoria
 * e evitando repetir os `evitarNomes` mais recentes do usuário (produto
 * "não repetido recente", conforme especificação do gerador de IA).
 */
export function produtoAleatorio(categoria?: string, evitarNomes: string[] = []): ProdutoMock {
  let pool = categoria
    ? PRODUTOS_MOCK.filter((p) => p.categoria.toLowerCase() === categoria.toLowerCase())
    : PRODUTOS_MOCK;

  if (pool.length === 0) pool = PRODUTOS_MOCK;

  const semRepetir = pool.filter((p) => !evitarNomes.includes(p.nome));
  const listaFinal = semRepetir.length > 0 ? semRepetir : pool;

  return listaFinal[Math.floor(Math.random() * listaFinal.length)];
}
