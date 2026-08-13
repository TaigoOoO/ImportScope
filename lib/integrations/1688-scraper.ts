import { cacheGet, cacheSet, CACHE_TTL_INTEGRACOES } from "@/lib/cache";
import { registrarIntegrationLog } from "@/lib/integration-log";

export interface Produto1688 {
  name: string;
  price: number; // yuan
  priceUSD: number;
  moq: number;
  supplier: string;
  rating: number;
  orders: number;
  url: string;
}

export interface Busca1688Resultado {
  products: Produto1688[];
  fonte: "mock";
  aviso: string;
}

const YUAN_PARA_USD = 0.14; // aproximação; troque por uma cotação ao vivo se for usar isso pra valer

/**
 * IMPORTANTE: isto retorna dados MOCK, sempre. Não existe uma API do
 * próprio 1688 pública, e o SerpAPI (sugerido no prompt original) não tem
 * um engine para 1688/Taobao/Alibaba — conferi a documentação deles antes
 * de escrever isto. Existem provedores terceiros no RapidAPI (ex: busca
 * por "1688 API" ou "Taobao API") que vendem esse tipo de dado, mas cada
 * um tem seu próprio contrato de request/response, e eu não tenho como
 * verificar o formato exato de nenhum deles sem inventar — então, em vez
 * de escrever uma chamada fetch() que quase certamente não bateria com a
 * API real escolhida, deixei um ponto de extensão claro abaixo. Troque o
 * corpo desta função por uma chamada real ao provedor que você escolher e
 * cujos docs você tenha lido.
 */
export async function buscarProdutos1688(query: string): Promise<Busca1688Resultado> {
  const cacheKey = `integracao:1688:${query.toLowerCase()}`;
  const emCache = await cacheGet<Busca1688Resultado>(cacheKey);
  if (emCache) return emCache;

  const inicio = Date.now();

  // ── Ponto de extensão ──────────────────────────────────────────────
  // if (process.env.RAPIDAPI_1688_KEY) {
  //   const res = await fetch(`https://<host-do-provedor-escolhido>/search?q=${encodeURIComponent(query)}`, {
  //     headers: { "X-RapidAPI-Key": process.env.RAPIDAPI_1688_KEY, "X-RapidAPI-Host": "<host>" },
  //   });
  //   const dados = await res.json();
  //   // mapear `dados` para o formato Produto1688[] baseado na resposta real da API escolhida
  // }
  // ────────────────────────────────────────────────────────────────────

  const produtosMock: Produto1688[] = Array.from({ length: 5 }).map((_, i) => {
    const precoYuan = Number((5 + Math.random() * 40).toFixed(2));
    return {
      name: `${query} — variação ${i + 1}`,
      price: precoYuan,
      priceUSD: Number((precoYuan * YUAN_PARA_USD).toFixed(2)),
      moq: [50, 100, 200, 300, 500][i % 5],
      supplier: `Fornecedor ${String.fromCharCode(65 + i)} — Guangdong`,
      rating: Number((4 + Math.random()).toFixed(1)),
      orders: Math.floor(1000 + Math.random() * 20000),
      url: `https://www.1688.com/search?keywords=${encodeURIComponent(query)}`,
    };
  });

  const resultado: Busca1688Resultado = {
    products: produtosMock,
    fonte: "mock",
    aviso:
      "Dados de exemplo — nenhum provedor real de dados do 1688 está configurado. Ver comentário em lib/integrations/1688-scraper.ts.",
  };

  await cacheSet(cacheKey, resultado, CACHE_TTL_INTEGRACOES);
  await registrarIntegrationLog("1688", "fallback", Date.now() - inicio, "nenhum provedor real configurado");
  return resultado;
}
