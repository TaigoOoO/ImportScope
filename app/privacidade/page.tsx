import Link from "next/link";
import { ShieldCheck, Pencil, Trash2, Download } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { LegalFooter } from "@/components/shared/legal-footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Política de Privacidade",
};

const DIREITOS = [
  {
    icon: ShieldCheck,
    titulo: "Acessar",
    descricao: "Saber quais dados pessoais seus tratamos e como.",
  },
  {
    icon: Pencil,
    titulo: "Corrigir",
    descricao: "Pedir a correção de dados incompletos ou desatualizados.",
  },
  {
    icon: Trash2,
    titulo: "Excluir",
    descricao: "Solicitar a exclusão (anonimização) da sua conta e dados.",
  },
  {
    icon: Download,
    titulo: "Portar",
    descricao: "Baixar seus dados em formato estruturado (JSON).",
  },
];

export default function PrivacidadePage() {
  const ano = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-6 md:px-12">
        <Link href="/">
          <Logo size={32} />
        </Link>
        <Link href="/login" className="text-sm text-foreground-secondary hover:text-foreground">
          Entrar
        </Link>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-foreground-tertiary">Última atualização: {ano}</p>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">1. Quem somos</h2>
          <p className="leading-relaxed text-foreground-secondary">
            O ImportScope é operado por [nome da empresa/responsável a preencher], inscrito no
            CNPJ 00.000.000/0001-00, doravante "Controlador" para os fins da Lei Geral de Proteção
            de Dados (Lei 13.709/2018 — LGPD).
          </p>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">2. Dados que coletamos</h2>
          <ul className="list-inside list-disc space-y-1 leading-relaxed text-foreground-secondary">
            <li>Email, usado para autenticação (magic link) e comunicação.</li>
            <li>Dados de uso da plataforma (oportunidades geradas, cálculos realizados).</li>
            <li>
              Dados de pagamento, processados diretamente pela Stripe — não armazenamos números
              de cartão de crédito em nossos servidores.
            </li>
            <li>Não coletamos CPF, endereço ou outros dados sensíveis desnecessários ao serviço.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">
            3. Base legal para o tratamento
          </h2>
          <p className="leading-relaxed text-foreground-secondary">
            Tratamos seus dados com base (i) no seu <strong>consentimento</strong>, expresso ao
            aceitar estes termos no cadastro, e (ii) na <strong>execução de contrato</strong>, para
            viabilizar o fornecimento do serviço contratado, conforme art. 7º, incisos I e V, da
            LGPD.
          </p>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">4. Finalidade do tratamento</h2>
          <p className="leading-relaxed text-foreground-secondary">
            Usamos seus dados para autenticar seu acesso, operar as funcionalidades do dashboard,
            processar pagamentos, cumprir obrigações legais/fiscais e, quando permitido, enviar
            comunicações sobre o produto.
          </p>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">
            5. Compartilhamento de dados
          </h2>
          <p className="leading-relaxed text-foreground-secondary">
            Compartilhamos dados estritamente necessários com os seguintes operadores, todos sob
            obrigação contratual de proteção de dados:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed text-foreground-secondary">
            <li>
              <strong>Stripe</strong> — processamento de pagamentos (recebe email e dados de
              cobrança).
            </li>
            <li>
              <strong>Supabase</strong> — autenticação e banco de dados (infraestrutura).
            </li>
            <li>
              <strong>Anthropic</strong> — análise de oportunidades por IA. Enviamos apenas dados
              de produto (nome, preço, categoria, NCM) para essa análise —{" "}
              <strong>nunca dados pessoais identificáveis</strong> do usuário.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">6. Seus direitos</h2>
          <p className="mb-6 leading-relaxed text-foreground-secondary">
            Nos termos do art. 18 da LGPD, você tem direito a:
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DIREITOS.map((d) => (
              <div key={d.titulo} className="rounded-input border border-border bg-background-card p-4">
                <d.icon className="mb-2 h-5 w-5 text-primary" />
                <p className="font-medium text-foreground">{d.titulo}</p>
                <p className="mt-1 text-sm text-foreground-tertiary">{d.descricao}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 leading-relaxed text-foreground-secondary">
            Direitos de acesso e portabilidade também podem ser exercidos diretamente em
            Configurações → Seus Dados, dentro do dashboard.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <a href="mailto:privacidade@importscope.com">Solicitar ação sobre meus dados</a>
          </Button>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">7. Retenção de dados</h2>
          <p className="leading-relaxed text-foreground-secondary">
            Mantemos seus dados enquanto sua conta estiver ativa. Após solicitação de exclusão de
            conta, seus dados pessoais são anonimizados em até 180 (cento e oitenta) dias, prazo
            necessário para cumprimento de obrigações legais e fiscais (ex: registros de
            cobrança), conforme permitido pelo art. 16 da LGPD.
          </p>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">8. Cookies</h2>
          <p className="leading-relaxed text-foreground-secondary">
            Usamos apenas cookies essenciais ao funcionamento da plataforma (sessão de
            autenticação e preferência do aviso legal minimizado). Não usamos cookies de
            rastreamento publicitário de terceiros.
          </p>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">9. Segurança</h2>
          <p className="leading-relaxed text-foreground-secondary">
            Todo tráfego entre você e o ImportScope é criptografado via TLS. Os dados em repouso
            são armazenados em infraestrutura da Supabase com criptografia e controles de acesso
            padrão de mercado.
          </p>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">10. Contato do Encarregado</h2>
          <p className="leading-relaxed text-foreground-secondary">
            Para exercer seus direitos ou esclarecer dúvidas sobre este documento, escreva para{" "}
            <a href="mailto:privacidade@importscope.com" className="text-primary hover:underline">
              privacidade@importscope.com
            </a>
            .
          </p>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}
