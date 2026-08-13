# ImportScope

Dashboard SaaS para importadores brasileiros: uma landing page pública, um dashboard com oportunidades de produtos da China analisadas por IA, e uma calculadora tributária completa (II, IPI, PIS, COFINS, ICMS, AFRMM, Siscomex).

Este projeto passou por duas rodadas de geração: um MVP funcional inicial, e depois uma reformulação completa de design (tema escuro laranja/grafite, biblioteca de componentes própria, landing page, gráficos) sobre a mesma base funcional. Este README reflete o estado atual (v2).

## Stack

- Next.js 14 (App Router) + TypeScript estrito
- Tailwind CSS + biblioteca de componentes própria no padrão shadcn/ui (Radix primitives)
- Prisma + PostgreSQL (Supabase)
- Supabase Auth (magic link + Google OAuth opcional)
- Stripe Checkout (assinatura Pro)
- Anthropic Claude API (análise de oportunidades)
- Recharts (gráficos), react-hook-form + Zod (formulários), Sonner (toasts), Framer Motion (animações)

## Setup

```bash
# 1. Instale as dependências
npm install

# 2. Configure o ambiente
cp .env.local.example .env.local
# preencha as chaves do Supabase, Stripe e Anthropic

# 3. Banco de dados
npx prisma migrate dev --name init
npx prisma db seed

# 4. Rode localmente
npm run dev
```

Acesse http://localhost:3000 para a landing page pública. O dashboard fica em `/dashboard` (protegido por auth) — use o magic link enviado por email, ou o botão "Continuar com Google" (requer configurar o provider Google no Supabase; veja abaixo).

### Stripe

1. Crie um produto recorrente (ex: "ImportScope Pro", R$ 29/mês) no Dashboard da Stripe e copie o `price_id` para `NEXT_PUBLIC_STRIPE_PRICE_ID`.
2. Rode `stripe listen --forward-to localhost:3000/api/webhook/stripe` em desenvolvimento e copie o `whsec_...` para `STRIPE_WEBHOOK_SECRET`.

### Supabase

1. Crie um projeto em supabase.com, ative "Email OTP / magic link" em Authentication → Providers.
2. Para o botão "Continuar com Google" funcionar, ative o provider Google em Authentication → Providers e configure o Client ID/Secret do Google Cloud Console. Sem isso, o botão aparece mas retorna erro ao clicar — o resto do app funciona normalmente via magic link.
3. Em Authentication → URL Configuration, adicione `http://localhost:3000/auth/callback` (e a URL de produção) como Redirect URL.
4. Copie a connection string (modo "Transaction pooler") para `DATABASE_URL`.

### Cron jobs (lembrete de renovação + anonimização)

Os dois jobs em `vercel.json` rodam automaticamente se você fizer deploy na Vercel (Vercel Cron). Fora da Vercel, chame `GET /api/cron/lembrete-renovacao` e `GET /api/cron/anonimizar-contas` por qualquer scheduler (cron do servidor, GitHub Actions, etc). Defina `CRON_SECRET` no `.env.local` e inclua o mesmo valor como header `Authorization: Bearer <CRON_SECRET>` na chamada, para que estranhos não consigam disparar essas rotas.

## Decisões e desvios em relação ao prompt de design

Documentando aqui para transparência:

- **Conflito de rota resolvido: `(dashboard)` virou `dashboard`.** O prompt pedia `app/page.tsx` como landing pública **e** `app/(dashboard)/page.tsx` como home do dashboard. Como `(dashboard)` é um *route group* do Next.js, ele não aparece na URL — as duas páginas colidiriam na mesma rota `/`, o que o Next.js não permite (build error). Resolvi transformando o grupo em um segmento real: o dashboard agora vive em `/dashboard`, `/dashboard/oportunidades`, `/dashboard/calculadora`, `/dashboard/configuracoes`. Middleware, sidebar, header, redirects de login/callback e o botão "Explorar Oportunidades" da landing já refletem isso.
- **`cta-section.tsx` implementado como footer.** A lista de arquivos do prompt inclui `components/landing/cta-section.tsx`, mas a especificação visual das 6 seções descreve a sexta como "FOOTER" (logo, links sociais, copyright), não uma seção de CTA separada. Implementei o arquivo com esse conteúdo — é o footer da landing page.
- **Captura de email da landing page é só front-end.** O formulário "Quero ver o primeiro relatório" no Hero mostra um toast de confirmação, mas não persiste o email em lugar nenhum — não há tabela de waitlist no schema nem endpoint de captura, porque o prompt de design não especificou esse endpoint. Se quiser capturar de verdade, adicionar um model `WaitlistEntry` no Prisma e um `POST /api/waitlist` resolve.
- **Breakdown de custo no modal de oportunidade é uma estimativa ao vivo, não um dado salvo.** O modelo `Oportunidade` guarda `custoTotalBRL` (agregado) mas não um breakdown linha-a-linha por imposto. Em vez de inventar números desconectados da calculadora real, o modal chama `POST /api/calcular` (o mesmo endpoint da Calculadora) usando o FOB da oportunidade com frete estimado em 30% do FOB, seguro em 2%, via marítima e ICMS-SP — e deixa isso explícito na UI ("Ajuste os parâmetros na Calculadora para o seu caso real"). É uma estimativa consistente com a lógica real de impostos do app, não um mock disjunto.
- **`date-fns` removido do `package.json`.** Estava na lista de dependências do prompt, mas todo o app usa `Intl.DateTimeFormat`/`toLocaleDateString` nativos para formatar datas — não havia nenhum uso real da lib, então tirei para não carregar peso à toa.
- **Componentes `Progress`, `Tabs` e `Separator` existem mas não estão em uso.** O prompt lista esses arquivos em `components/ui/`, e eles foram implementados (funcionais, no mesmo padrão dos demais), mas nenhuma página atual precisa deles — ficam disponíveis para uso futuro (ex: `Tabs` para organizar a Calculadora por tipo de produto, `Progress` para um indicador de limite diário do plano Free).
- **Google OAuth é best-effort.** Implementei `signInWithOAuth({ provider: "google" })` de verdade (não é só um botão decorativo), mas como a Anthropic/Supabase não fornece credenciais OAuth, ele só funciona depois que você configurar o provider Google no seu projeto Supabase (passo 2 acima).
- **Modelo Claude usado em `lib/anthropic.ts`**: `claude-sonnet-4-6`, com `temperature: 0.2` e `max_tokens: 2000` conforme pedido. Se você estiver lendo isso bem depois de julho de 2026, vale conferir a página de modelos da Anthropic — um ID mais novo pode estar disponível.
- **`UsoDiario` usa chave composta `@@unique([userId, data])`** em vez de `@unique` simples em `userId` — um `@unique` simples permitiria só uma linha *por usuário para sempre*, o que quebraria o controle de "2 gerações por dia". Isso já vinha da primeira rodada e o prompt de design manteve a mesma estrutura, então preservei a correção.
- **Fallback determinístico no gerador de oportunidades.** Se a chamada à Claude API falhar (chave ausente, rate limit, JSON inválido), `app/api/gerar-oportunidade/route.ts` cai para um cálculo local simples em vez de quebrar a rota — útil em desenvolvimento sem `ANTHROPIC_API_KEY` configurada. Para produção, considere trocar por um erro explícito na UI.
- **Componentes de UI escritos à mão** no padrão shadcn/ui em vez de gerados via `npx shadcn add`, já que este ambiente não tem acesso à rede para rodar o CLI. Funcionalmente equivalentes.

## Limitações conhecidas do MVP

- Exportação de PDF (feature Pro) não foi implementada — ficaria em `app/api/exportar/route.ts` + um botão na página de Oportunidades.
- Sem paginação nas listagens; para uma base maior que os 15 produtos mock, seria necessário adicionar.
- O gráfico "Atividade de Importação" no dashboard usa dados reais (contagem de oportunidades geradas por dia, últimos 14 dias) quando existem, mas preenche com valores aleatórios pequenos se a lista vier vazia — só para a landing/dashboard nunca renderizar um gráfico vazio.
- "Economia Estimada" no card de estatísticas é uma métrica derivada (soma de `precoVendaSugerido - custoTotalBRL` das oportunidades), não um valor rastreado de verdade no banco — é uma aproximação razoável dado o que o schema guarda hoje.

## v3 — Compliance & Legal

Terceira rodada de geração: Termos de Uso, Política de Privacidade, consentimento LGPD, disclaimers em todo o app, e gestão de dados do titular. **Aviso importante: eu não sou advogado, e o texto legal gerado aqui é um ponto de partida, não uma peça jurídica revisada.** Antes de lançar de verdade, um advogado especializado em LGPD e direito do consumidor precisa revisar `/termos` e `/privacidade` — em especial porque a LGPD normalmente exige a nomeação de um Encarregado (DPO) com contato próprio, o que este texto não trata em profundidade.

### O desafio principal: consentimento numa auth sem senha

O prompt v3 assume um fluxo de registro tradicional (usuário marca checkboxes → `POST /api/auth/register` → conta criada). Mas o ImportScope usa magic link + Google OAuth — a conta é criada pelo *Supabase*, não pelo nosso backend, e isso acontece de forma diferente para cada provedor (o `user_metadata` do OTP aceita dados arbitrários que passamos; o do OAuth do Google não).

Resolvi assim:
1. `app/login/page.tsx` mostra os dois checkboxes (idade + termos), ambos desmarcados por padrão, e desabilita os dois botões de entrar até os dois estarem marcados.
2. Ao submeter, o client chama `POST /api/auth/register` primeiro — essa rota valida os checkboxes com o schema Zod exato do prompt (`z.literal(true, { errorMap })`) e, se aprovado, grava um **cookie httpOnly de 10 minutos** (`lib/consent-cookie.ts`) com o consentimento e um timestamp. Só depois disso o client dispara `signInWithOtp` ou `signInWithOAuth`.
3. `app/auth/callback/route.ts` — que é onde de fato criamos/atualizamos a linha `User` no nosso banco — lê esse cookie. Se o cookie existir e for válido, grava `acceptedTermsAt`/`acceptedPrivacyAt`/`isAdultConfirmed` com timestamp real. **Se o cookie não existir e o usuário não tinha consentido antes, a rota desfaz a sessão do Supabase (`signOut()`) e redireciona para `/login?error=consent_required`** — ou seja, o backend realmente barra logins sem consentimento, cumprindo a regra "sempre valide no backend" apesar da arquitetura sem senha.

**Limitação conhecida deste desenho:** magic link é por natureza multi-dispositivo — a pessoa pode pedir o link no notebook e abrir no celular, onde o cookie de consentimento não existe. Nesse caso, a válvula de segurança acima entra em ação e pede para a pessoa aceitar de novo no mesmo navegador onde vai clicar o link. É um pequeno atrito extra em troca de nunca deixar passar uma conta sem consentimento registrado.

### Outras decisões

- **`app/api/auth/register` não cria a conta.** Ele só valida e grava o cookie — ver acima. Mantive o nome/rota exatamente como o prompt pediu para não fugir da especificação, mas o comportamento real é "pré-validação", não "registro".
- **Emails são templates prontos, não envio de verdade.** `lib/email-templates.ts` tem as 4 templates pedidas (boas-vindas à lista, confirmação de assinatura, lembrete de renovação, cancelamento) retornando `{ subject, html, text }`, e `enviarEmail()` é um stub que só loga no console — nenhum provedor de email (Resend, Postmark, SES) foi configurado em nenhum prompt até agora, então não há como enviar de verdade. O comentário na função mostra como plugar o Resend em produção.
- **Dois cron jobs novos, além do que o prompt pediu:** `app/api/cron/lembrete-renovacao` (dispara o email 3 dias antes da renovação, comparando com `current_period_end` da Stripe) e `app/api/cron/anonimizar-contas` (roda a política de retenção de 180 dias: quando alguém pede exclusão em Configurações, marcamos `deletionRequestedAt`; esse cron, rodando diariamente, anonimiza de fato — troca o email por um placeholder, zera nome/avatar, cancela a assinatura Stripe se houver — quem passou de 180 dias). Sem eles, "soft delete — anonimiza em 180 dias" e "lembrete de renovação" ficariam só no texto do email, sem nada realmente disparando. `vercel.json` já tem os dois agendados; ambos aceitam um `CRON_SECRET` opcional via header `Authorization: Bearer`.
- **`description`/`statement_descriptor` no Stripe Checkout: o prompt pediu um campo que não existe.** Fui conferir na documentação da Stripe antes de escrever isso — Checkout Sessions em `mode: "subscription"` não aceitam `description` nem `statement_descriptor` diretamente (isso é confirmado por uma issue aberta no próprio repositório `stripe-node` no GitHub; o TypeScript da Stripe rejeita `subscription_data.description`). Para assinaturas, o texto que aparece na fatura do cartão vem do **descritor de cobrança configurado na sua conta Stripe** (Dashboard → Configurações → Negócio → Dados públicos, até 22 caracteres — ex: "IMPORTSCOPE"), não de um parâmetro por sessão. `app/api/checkout/route.ts` usa `metadata` (que é o campo real suportado) para guardar a descrição, e tem um comentário explicando isso — prefiro isso a escrever uma chamada de API que ou não compila ou é silenciosamente ignorada pela Stripe.
- **`app/api/portal` e `app/api/user/export`/`app/api/user/delete` são rotas novas**, não listadas no prompt mas necessárias para os botões "Cancelar assinatura", "Baixar meus dados" e "Excluir minha conta" da tela de Configurações funcionarem de verdade em vez de serem só visuais.
- **`LegalBanner` não é `position: sticky`.** O prompt pede "fixo no topo do dashboard"; como o `Header` já é sticky, empilhar dois elementos sticky um sobre o outro exigiria calcular offsets manualmente (um problema clássico de CSS). Optei por deixar o banner no fluxo normal, acima do header — ele é a primeira coisa que aparece e continua sendo a primeira coisa ao rolar de volta ao topo, sem a fragilidade de dois `sticky top-0` competindo.
- **`LegalFooter` não foi colocado em `app/layout.tsx` global.** O prompt pede isso, mas o layout raiz envolve literalmente todas as páginas, inclusive o dashboard — colocar o footer lá apareceria também dentro do app autenticado, o que não é a intenção ("footer em todas as páginas **públicas**"). Em vez disso, cada página pública (landing, termos, privacidade, login) renderiza `<LegalFooter />` diretamente. O footer da landing (`cta-section.tsx`) foi refatorado para reusar esse mesmo componente em vez de duplicar links/copyright.

## v4 — Growth, Admin e Integrações Reais

Quarta rodada: sistema de referral, emails automatizados por gatilho, analytics de conversão, um painel `/admin` completo, e 4 integrações externas (BCB, BrasilAPI, Google Trends, 1688).

### Growth Engine

- **Recompensa de referral é aplicada de verdade, não só guardada como metadata.** O prompt disse "aplicado via Stripe metadata" — mas metadata sozinha não muda cobrança nenhuma, é só armazenamento. `lib/referral.ts` empurra `trial_end` da assinatura 30 dias pra frente (um padrão real e documentado da Stripe para pular um ciclo de cobrança).
- **Waitlist agora persiste de verdade.** Isso fechava uma lacuna que eu já tinha sinalizado nos READMEs do v2/v3 ("captura só front-end"). Adicionei `WaitlistEntry` + `POST /api/waitlist`, e o formulário do Hero da landing chama essa rota de verdade agora.
- **Gatilhos de email com delay (tour, 1ª oportunidade, reengajamento, winback) usam varredura por cron, não delay real.** Ambiente serverless não tem `setTimeout` persistente — `GET /api/cron/emails` roda 1x/dia, verifica janelas de tempo, e cada função de trigger decide via `EmailLog` se já foi enviado. O winback reusa o próprio registro de `EmailLog` tipo `cancellation` como âncora dos 7 dias, em vez de um campo novo no schema.
- **Analytics não é rastreado em `middleware.ts`.** Middleware do Next 14 roda em Edge runtime, e o Prisma Client precisa de Node.js — uma chamada `prisma.analyticsEvent.create()` ali quebraria o build ou falharia silenciosamente. O rastreamento é client-side (`components/analytics/event-tracker.tsx` + `lib/analytics-client.ts`, usando `fetch(..., { keepalive: true })`) batendo numa rota de API de verdade (`/api/analytics/track`), que roda em Node.js normalmente.
- Um bug que eu mesmo cometi e corrigi: o email de "limite atingido" começou como fire-and-forget (`triggerUpgradePush(...)` sem `await`) pra não atrasar a resposta 429. Isso é arriscado em serverless — uma promise não aguardada pode ser encerrada assim que a resposta é enviada, e o email simplesmente não sairia. Troquei para `await` de propósito.

### Admin Dashboard

- **Checagem de admin não está no middleware.** Mesma limitação de Edge runtime do analytics — não dá pra rodar Prisma lá. `middleware.ts` só confirma que existe uma sessão Supabase (checagem barata, sem banco). A checagem de `role === 'admin'` de verdade acontece em `app/admin/layout.tsx` (Server Component, roda em Node.js) e em cada rota `/api/admin/*` individualmente via `lib/admin-auth.ts`.
- **"Banir" bane de verdade.** `app/dashboard/layout.tsx` verifica `user.bannedAt` e desloga o usuário (`supabase.auth.signOut()`) antes de deixar renderizar qualquer coisa — não é só uma badge "Banido" na tabela do admin sem efeito nenhum.
- **O painel de config tem efeito real, com uma exceção documentada.** Limite diário do Free e texto do banner legal mudam o comportamento do app imediatamente (rastreei isso por `lib/auth.ts`, as duas rotas de API envolvidas, e o botão de gerar oportunidade). Modo manutenção bloqueia o dashboard pra quem não é admin. **Preço do Pro é só exibição** — mudar esse número no painel não muda o que a Stripe cobra de verdade, porque isso exigiria trocar o Price object na Stripe, escopo bem maior que editar um número no banco. Isso está avisado na própria tela do admin, não só aqui.
- **Editor de templates de email realmente afeta o que é enviado.** `lib/email-templates.ts` tem uma função `resolverTemplate()` que checa se existe um `EmailTemplateOverride` salvo antes de cair no texto hardcoded — todos os 6 gatilhos de growth passam por ela. (Os emails transacionais da Stripe — confirmação, cancelamento, lembrete — continuam com texto fixo, de propósito: são textos com valores/datas de cobrança, não fazem sentido num textarea sem validação extra.)
- **Taxas de abertura/clique de email aparecem como "—", não como 0% fake.** Nada neste projeto popula `openedAt`/`clickedAt` — isso exigiria um provedor de email de verdade com pixel de abertura e link de clique rastreado (ex: webhooks do Resend). Mostrar 0% pareceria um dado real; "—" deixa claro que não é.
- **CAC aparece como "—" em vez de inventado.** Não existe nenhum rastreamento de custo de mídia/ads configurado em lugar nenhum do projeto. LTV é uma estimativa via fórmula padrão de SaaS (ARPU ÷ churn), não um valor observado — está rotulado como tal na tela.
- **`/api/admin/system/backup` é um export JSON das tabelas, não um backup binário do Postgres.** Um backup de verdade roda a nível de infraestrutura — o Supabase já faz backups automáticos diários que incluem schema, índices e WAL. Isso aqui serve para inspeção rápida, não para disaster recovery.

### Integrações Reais

- **1688 não usa SerpAPI, porque o SerpAPI não tem engine para 1688/Taobao/Alibaba.** Conferi a documentação deles antes de escrever qualquer coisa — os engines suportados são Google, Bing, Yahoo, Baidu, eBay, Walmart e afins. Existem provedores terceiros (listagens no RapidAPI) que vendem dado de 1688, mas cada um tem seu próprio contrato de API que eu não tenho como verificar sem inventar. `lib/integrations/1688-scraper.ts` retorna dados mock claramente identificados (`fonte: "mock"`) com um ponto de extensão comentado no código para quando você escolher e ler a documentação de um provedor real.
- **NCM combina dado ao vivo com tabela local, porque nenhuma API pública sozinha cobre tudo.** A BrasilAPI (`brasilapi.com.br/api/ncm/v1`) é real e retorna classificação/descrição oficial e vigência — mas não retorna alíquotas de II/IPI, que vêm da TEC e não têm API pública simples. `lib/integrations/receita-ncm.ts` busca a descrição ao vivo na BrasilAPI e junta com as alíquotas de `lib/tax-data.ts`; se o NCM não estiver na nossa tabela local, `ii`/`ipi` vêm `null` em vez de um número inventado.
- **Cotação USD/BRL é 100% real** — série 10813 do SGS/Banco Central, sem necessidade de chave de API. É a única das 4 integrações que bate exatamente com o que o prompt pediu.
- **A cotação ao vivo foi de fato ligada na calculadora**, não só numa badge decorativa — `app/api/calcular/route.ts` busca a cotação do BCB (com cache de 1h e fallback pra constante fixa) antes de calcular, e o resultado mostra qual cotação foi usada e de onde veio.
- **Google Trends não é uma badge em cada card da grade.** Um grid com 6-9 oportunidades disparando 6-9 chamadas simultâneas pra uma API não-oficial (que pode mudar de formato sem aviso — não existe API oficial de Trends) deixaria a listagem lenta e instável. A badge de tendência (com sparkline) vive no modal de detalhes, uma chamada por clique do usuário, não por card renderizado.
- **`google-trends-api` não tem tipos TypeScript** — adicionei uma declaração mínima em `types/google-trends-api.d.ts` pra isso compilar limpo.
- **Cache e rate limit funcionam sem Upstash configurado.** `lib/cache.ts` e `lib/rate-limit.ts` caem para um fallback em memória do processo se `UPSTASH_REDIS_REST_URL`/`TOKEN` não estiverem definidos — funciona local/dev, mas não é compartilhado entre instâncias serverless (cada cold start começa vazio). Para produção de verdade, configure uma conta Upstash.
- **`serpapi` não entrou no `package.json`.** Estava na lista de dependências do prompt, mas nada no código chama — não faz sentido instalar uma lib que não é usada (mesma lógica de ter tirado o `date-fns` não usado no v2).

## Refinamento de UI — identidade "radar de arbitragem"

Quinta rodada, só de polimento visual/microcopy sobre a base já construída — sem features novas. Vale registrar como isso foi aplicado, porque nenhum dos componentes citados no brief batia com a API dos componentes que já existiam no projeto.

- **Nenhuma API de componente existente foi trocada, só o conteúdo interno.** `Logo`, `PriceDisplay`, `BadgeRisk` e `EmptyState` já eram usados em 3 a 8 lugares cada, com props diferentes das do brief (`size` numérico vs. enum string, `currency`/`accent` vs. `prefix`/`highlight`, ícone escolhido pelo chamador vs. fixo). Copiar os snippets do brief ao pé da letra teria quebrado esses call sites. Em vez disso, adaptei: mantive as props que o resto do app já depende, e troquei só a implementação visual interna (o hexágono do Logo agora se desenha com uma animação de radar; `BadgeRisk` continua recebendo `risco`, só que agora sempre mostra ícone; etc).
- **`BadgeRisk` trocou os rótulos com emoji (🟢/🟡/🔴) por ícone+texto** (ShieldCheck/AlertTriangle/ShieldAlert + "Risco Baixo"/"Atenção"/"Risco Alto") — pedido explícito do refinamento, não uma escolha minha por conta própria.
- **`EmptyState` perdeu o prop `icon`** — como todo uso atual já era sobre "nenhuma oportunidade encontrada", fixar o personagem do radar (em vez de exigir que cada chamador escolha um ícone) simplificou a API.
- **O widget "Radar Ativo" na sidebar usa números reais do banco**, não mock — `produtosMonitorados` é a contagem total de `Oportunidade` no sistema (todos os usuários, reforça a sensação de "radar coletivo"), `oportunidadesHoje` é a contagem de hoje. A barra de "% de cobertura" é `categorias com pelo menos 1 oportunidade ÷ total de categorias` — uma métrica real, ainda que simples, em vez de um número decorativo.
- **Transição de página não vive no layout do dashboard**, porque esse layout precisa continuar sendo Server Component (faz chamadas Prisma para autenticação/config que não rodam em Client Component). `components/layout/page-transition.tsx` é um wrapper client separado, usado só dentro do `<main>`.
- **Google Trends não ganhou uma badge em cada card** — decisão já tomada e documentada na seção do v4 acima, continua valendo aqui.
- **O "Radar Ativo" e o `ScanningLoader` não foram aplicados no painel `/admin`.** O brief de refinamento é claramente sobre a identidade do app voltado ao usuário final (sidebar principal, cards de oportunidade, dashboard) — o admin é ferramenta interna, prioriza função sobre marca, e manter os dois visualmente distintos ajuda a diferenciar "isto é o produto" de "isto é o backstage".
- **`ScanningLoader` substitui o spinner simples durante a geração de oportunidade**, não durante toda operação assíncrona do app — é o momento que mais se beneficia de parecer "um trabalho de verdade acontecendo", já que a IA genuinamente leva alguns segundos.

## Polimento final — command palette, atalhos, feedback sensorial

Sexta rodada. Diferente das anteriores, esta trouxe alguns bugs reais no próprio prompt que valem registro, não só decisões de adaptação:

- **A command palette anunciava navegação por seta no rodapé ("↑↓ navegar") mas o código do prompt não implementava isso** — só clique. Sem isso, o rodapé seria uma mentira na interface. `components/command-palette/command-palette.tsx` tem navegação por teclado de verdade (↑/↓ move a seleção com wrap-around, Enter executa, Esc fecha — os dois últimos de graça por usar o `Dialog` do Radix em vez de recriar isso do zero).
- **O comando "Ativar Radar Pro" fazia `router.push("/api/checkout")`** — mas essa rota só aceita POST e devolve JSON, não HTML. Navegar o navegador pra lá daria erro. Troquei para o fluxo real que já existe em `UpgradeBanner`: `fetch(..., { method: "POST" })` e depois redirecionar pra URL do Stripe que a resposta devolve.
- **O logout era um comentário `/* logout */`.** Troquei por `supabase.auth.signOut()` de verdade, igual ao que já existia em `Header`.
- **O módulo de som criava o `AudioContext` no carregamento do módulo, fora de qualquer clique.** Navegadores mantêm o AudioContext suspenso até ele ser criado ou retomado dentro de um gesto do usuário — então, como estava, nenhum som teria tocado nunca. `lib/sounds.ts` cria/retoma o contexto só dentro de `playSound()`, que só é chamada a partir de um clique de verdade.
- **"Opt-in" só é opt-in se o código checar a preferência antes de tocar.** O comentário dizia "(opt-in)" mas o `playSound()` do prompt tocava sempre que chamado, sem checar preferência nenhuma. Adicionei uma preferência de verdade (`localStorage`, desligada por padrão) com um toggle em Configurações — `playSound()` não faz nada se a preferência estiver desligada.
- **Modo Demo, se ligado a sério, dispararia geração de oportunidade de verdade num timer** — isso chama a API da Anthropic e consome o limite diário, automaticamente, sem clique nenhum. Implementei a navegação automática entre telas (útil pra gravar vídeo), mas **não** automatizei o clique em "Escanear Mercado" — isso ficou de fora de propósito, pelo risco de gastar cota/dinheiro sem ninguém decidindo isso ativamente. Também restringi o toggle a `/admin` em vez de deixá-lo visível pra qualquer cliente, já que "o app se pilota sozinho" não é algo que um usuário comum tem motivo pra querer.
- **Bug que eu mesmo criei e corrigi ao montar o Modo Demo**: minha primeira versão colocava o timer de navegação dentro do próprio componente do botão em `/admin/config` — mas como o botão navega para `/dashboard` ao ligar, esse componente seria desmontado na primeira troca de página, matando o timer e deixando o "modo demo" preso ligado sem jeito de desligar (a não ser voltando pra `/admin` manualmente, que o próprio modo demo te tira de lá). Corrigido: a flag fica em `localStorage`, e quem roda o timer de verdade é `DemoModeRunner`, montado no layout do dashboard (sobrevive à troca de páginas *entre* as páginas do dashboard), com seu próprio botão de parar sempre visível na tela.
- **Command palette, atalhos e microcopy usam as rotas e nomes reais do app** (`/dashboard/oportunidades`, não `/dashboard/opportunities`; "Escanear Mercado", não "Gerar Oportunidade" — nome trocado na rodada de refinamento anterior) em vez dos exemplos do prompt.
- **Cursor personalizado não virou um `cursor: ...` global.** Fica numa classe `.cursor-radar` aplicada só no botão "Escanear Mercado" — cursor customizado em todo elemento clicável do app cansa rápido e atrapalha a leitura de affordance; usado com moderação continua sendo um detalhe agradável.
- **`lib/toast-config.ts` existe e funciona, mas não substituiu todos os ~15 `toast.success()`/`toast.error()` já espalhados pelo app.** Apliquei o preset `toastConfig.opportunity(...)` no momento que mais se beneficia dele (gerar oportunidade), e deixei o utilitário disponível pra quem quiser adotar nos outros pontos aos poucos.
- **Haptics ficaram só em dois momentos** (oportunidade gerada, limite diário atingido) em vez de em todo clique de botão primário — vibrar a cada clique no app inteiro perde a graça rápido.

## Correção de bugs — landing, magic link, Google OAuth

Sétima rodada — três bugs reportados, verificados contra o código real antes de qualquer alteração (não assumi nem que o relato estava certo nem que estava errado).

- **Bug 1 (input de email minúsculo)**: o componente `Input` já tem `w-full` embutido no próprio estilo base, e o formulário já ficava empilhado (`flex-col`) no mobile por padrão. Não encontrei uma causa estrutural para "só 1 letra visível". Ainda assim, simplifiquei para o formulário ficar **sempre** empilhado (removi a variante `sm:flex-row` que só entrava em telas maiores), eliminando de vez qualquer ambiguidade — e é o mesmo layout do exemplo concreto que veio no relato do bug. Minha suspeita real: como a mensagem anterior desta conversa foi sobre um ZIP extraído pela metade no Windows (pasta `app/` sumida), é bem possível que o que estava rodando na Vercel não fosse a versão mais recente deste código.
- **Bug 2 (magic link caindo em localhost)**: o código já tinha a lógica de fallback correta (`NEXT_PUBLIC_SITE_URL ?? window.location.origin`) antes desta rodada. A causa mais provável, que encontrei ao investigar: `.env.local.example` — escrito por mim — mostra `NEXT_PUBLIC_SITE_URL=http://localhost:3000` como valor de exemplo. Se esse valor foi copiado literalmente para as variáveis de ambiente reais da Vercel em vez de substituído pela URL real do deploy, uma env var *explicitamente* errada sempre vence um fallback `??` — não importa quão bom seja o código. Isso não dá pra verificar nem consertar daqui (não tenho acesso ao painel da Vercel de ninguém); adicionei um aviso bem visível direto no arquivo de exemplo, no lugar exato de onde esse valor seria copiado.
  - Consolidei as ~5 versões ligeiramente diferentes dessa mesma lógica de fallback (login, checkout, portal, referral, e principalmente `email-templates.ts`, que tinha o domínio `importscope.com` — errado — cravado em 27 lugares) numa função só, `lib/site-url.ts`. No client, ela prioriza `window.location.origin` antes de qualquer env var — de propósito: é o único valor que não tem como estar configurado errado, porque é literalmente o domínio que o navegador está usando *agora*. Isso elimina o cenário do bug por completo para os fluxos que rodam no navegador (login, Google OAuth, link de indicação). Do lado do servidor (checkout, portal, emails) não existe um equivalente a "origem do navegador", então ainda depende da env var estar certa — documentado isso explicitamente no comentário da função e no aviso do `.env.local.example`, para não dar a entender que o problema já está 100% resolvido quando só está parcialmente.
- **Bug 3 (Google OAuth)**: o código já fazia exatamente o que o relato pedia. Isso não é um bug de código — precisa das credenciais OAuth reais no Google Cloud Console + ativar o provider no Supabase, que só quem tem acesso às contas consegue fazer. Já estava documentado como uma limitação conhecida desde a rodada v3.

## Diagnóstico em produção — magic link e centralização da landing

Oitava rodada, depois de duas idas e voltas reais de debug em produção (não hipotéticas — com URLs de erro reais do deploy do usuário).

- **`app/auth/callback/route.ts` agora loga o erro de verdade do Supabase** em vez de engolir silenciosamente. Antes, tanto "sem `code` na URL" quanto "`exchangeCodeForSession` falhou" caíam no mesmo redirect genérico (`?error=auth_callback_failed`), sem nada nos logs da Vercel pra diferenciar as duas causas. Agora cada caminho loga o motivo real (`console.error`) e anexa um `?reason=no_code` ou `?reason=exchange_failed` na URL de redirect, e `app/login/page.tsx` mostra uma mensagem diferente pra cada um — "sem `code`" geralmente é o próprio Supabase rejeitando o token antes de emitir um code (expirado/já usado); "`exchange_failed`" é o `code` chegando certinho mas o cookie do `code_verifier` do PKCE não sendo encontrado (sintoma clássico de abrir o magic link num navegador/dispositivo diferente de onde ele foi pedido).
- **A URL de erro em si foi a peça-chave do diagnóstico**, não suposição: a presença ou ausência do hash fragment (`#error=access_denied&error_code=otp_expired...`) na URL final indica exatamente qual dos dois pontos de falha ocorreu, porque esse fragment só aparece quando o `/auth/v1/verify` do próprio Supabase rejeita o token *antes* de emitir um `code` — e fragments sobrevivem a um redirect do servidor por conta do navegador, não do código. Vale a pena guardar esse detalhe se o bug voltar: comparar se a nova URL de erro tem ou não esse fragment já aponta pra metade do problema antes de abrir qualquer log.
- **Centralização de Funcionalidades/Preços**: aplicada — ícone, título e descrição de cada card agora centralizados (`items-center text-center`), e a lista de features do plano Pro/Free virou linhas `icon + texto` centralizadas como bloco (em vez de centralizar palavra por palavra, o que ficaria ruim com texto quebrando linha).
- **FAQ ficou de propósito sem o texto de pergunta/resposta centralizado** — o container já estava centralizado, e centralizar o texto ao lado do ícone de seta do accordion (ancorado à direita) ficaria visualmente quebrado, além de parágrafos centralizados serem mais difíceis de ler que alinhados à esquerda. Sinalizei isso diretamente na resposta em vez de aplicar uma mudança que piora a legibilidade só para bater literalmente com o pedido.

## Estrutura

```
importscope/
├── app/
│   ├── page.tsx                    # landing pública
│   ├── termos/                     # Termos de Uso (público)
│   ├── privacidade/                # Política de Privacidade (público)
│   ├── login/
│   ├── auth/callback/              # cria a sessão, persiste consentimento E atribuição de referral
│   ├── dashboard/                  # rotas protegidas: oportunidades, calculadora, indicar, configuracoes
│   ├── admin/                      # painel admin (role === 'admin'), protegido no layout, não no middleware
│   └── api/
│       ├── auth/register/          # pré-validação de consentimento (não cria conta)
│       ├── user/export/, user/delete/   # LGPD
│       ├── portal/                 # Stripe Customer Portal
│       ├── referral/stats/, referral/claim/
│       ├── waitlist/
│       ├── analytics/track/        # Node.js runtime — não confundir com middleware
│       ├── admin/                  # users, stats, export, oportunidades/[id], emails/*, config, system/*
│       ├── integrations/           # cotacao, ncm, trends, 1688
│       ├── cron/                   # lembrete-renovacao, anonimizar-contas, emails, integrations
│       └── ...                     # oportunidades, calcular, checkout, webhook
├── components/
│   ├── ui/                         # primitivas estilo shadcn/ui
│   ├── shared/                     # logo, badges, legal-banner, legal-footer, checkboxes...
│   ├── layout/                     # sidebar, header, mobile-nav
│   ├── dashboard/                  # stats-grid, activity-chart, account-settings-legal...
│   ├── oportunidades/, calculadora/, landing/
│   ├── referral/                   # referral-card, referral-progress
│   ├── analytics/                  # event-tracker (client-side, não middleware)
│   ├── admin/                      # sidebar, header, kpi-card, users-table, charts/, email-tools, config-form
│   └── integrations/               # trends-badge, cotacao-badge
├── lib/
│   ├── consent-cookie.ts           # ponte entre o login e o callback para o consentimento
│   ├── email-templates.ts          # templates + resolverTemplate() (overrides) + stub de envio
│   ├── email-triggers.ts           # gatilhos de growth, dedup via EmailLog
│   ├── referral.ts, analytics-client.ts
│   ├── admin-auth.ts, admin-stats.ts, admin-analytics.ts, admin-emails.ts, app-config.ts
│   ├── cache.ts, rate-limit.ts     # Upstash com fallback em memória
│   ├── integrations/               # cotacao (BCB, real), receita-ncm (BrasilAPI+local), google-trends, 1688-scraper (mock+adapter)
│   └── ...
├── prisma/
├── vercel.json                     # agenda os 4 cron jobs
└── types/
```
