import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { LegalFooter } from "@/components/shared/legal-footer";

export const metadata = {
  title: "Termos de Uso",
};

function DisclaimerBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-8 rounded-xl border border-warning/30 bg-warning/10 p-6">
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle className="h-6 w-6 shrink-0 text-warning" />
        <span className="text-sm font-bold uppercase tracking-wide text-warning">
          Leia atentamente
        </span>
      </div>
      <p className="text-foreground-secondary">
        Este documento contém disclaimers importantes sobre a limitação de responsabilidade da
        plataforma.
      </p>
      <div className="mt-3 text-foreground-secondary">{children}</div>
    </div>
  );
}

export default function TermosPage() {
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
        <h1 className="text-3xl font-bold text-foreground">Termos de Uso</h1>
        <p className="mt-2 text-sm text-foreground-tertiary">
          Última atualização: {ano}
        </p>

        <DisclaimerBox>
          O ImportScope é uma ferramenta de <strong>apoio à decisão</strong>, não uma consultoria
          aduaneira, contábil, tributária ou jurídica. Os cálculos, classificações de NCM e
          análises de oportunidade apresentados são <strong>estimativas</strong> geradas com base
          em alíquotas de referência e em análise por inteligência artificial, e podem não
          refletir a situação tributária exata da sua operação. A classificação de NCM sugerida
          pela plataforma <strong>não substitui</strong> a avaliação de um despachante aduaneiro
          habilitado. A plataforma não se responsabiliza por perdas financeiras, multas,
          retenções alfandegárias ou qualquer outro prejuízo decorrente do uso das informações
          aqui fornecidas.
        </DisclaimerBox>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">1. Natureza do serviço</h2>
          <p className="leading-relaxed text-foreground-secondary">
            O ImportScope ("nós", "a Plataforma") é um software como serviço (SaaS) que oferece
            ferramentas informativas para apoiar importadores brasileiros na avaliação preliminar
            de oportunidades de produtos e no cálculo estimado de custos de importação. O serviço
            não constitui consultoria aduaneira, contábil, tributária, jurídica ou de investimento
            de qualquer natureza, e não deve ser utilizado como único fundamento para decisões de
            importação, precificação ou investimento.
          </p>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">
            2. Isenção de responsabilidade
          </h2>
          <p className="leading-relaxed text-foreground-secondary">
            Na máxima extensão permitida pela legislação brasileira, o ImportScope não se
            responsabiliza por danos diretos, indiretos, incidentais, consequenciais, lucros
            cessantes, ou qualquer outro prejuízo decorrente do uso ou da impossibilidade de uso
            da plataforma, incluindo, mas não se limitando a: erros de classificação fiscal,
            divergências entre alíquotas estimadas e alíquotas efetivamente aplicadas, retenção
            ou apreensão de mercadorias, autuações fiscais, ou decisões comerciais tomadas com
            base nas oportunidades e análises apresentadas.
          </p>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">
            3. Limite de responsabilidade
          </h2>
          <p className="leading-relaxed text-foreground-secondary">
            Caso, apesar do disposto acima, seja reconhecida responsabilidade civil do
            ImportScope perante o usuário por qualquer motivo relacionado ao uso da plataforma,
            tal responsabilidade fica limitada, em qualquer hipótese, ao valor total efetivamente
            pago pelo usuário à plataforma nos 12 (doze) meses anteriores ao evento que originou
            a reclamação.
          </p>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">
            4. Uso exclusivo para maiores de 18 anos
          </h2>
          <p className="leading-relaxed text-foreground-secondary">
            O uso do ImportScope é destinado exclusivamente a pessoas com 18 (dezoito) anos ou
            mais e com plena capacidade civil para contratar. Ao criar uma conta, o usuário
            declara e garante possuir tal capacidade.
          </p>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">
            5. Planos, pagamento e cancelamento
          </h2>
          <p className="leading-relaxed text-foreground-secondary">
            O plano Pro é cobrado mensalmente via Stripe, com renovação automática até que o
            usuário solicite o cancelamento. O cancelamento pode ser feito a qualquer momento em
            Configurações → Assinatura, e produz efeito ao final do ciclo de cobrança vigente,
            sem reembolso proporcional do período já pago, salvo disposição legal em contrário.
          </p>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">6. Alterações destes termos</h2>
          <p className="leading-relaxed text-foreground-secondary">
            Podemos alterar estes Termos de Uso unilateralmente a qualquer momento, para refletir
            mudanças no serviço ou na legislação aplicável. Alterações relevantes serão
            comunicadas por email ou por aviso na plataforma. O uso continuado do ImportScope
            após a alteração constitui aceitação dos novos termos.
          </p>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">7. Propriedade intelectual</h2>
          <p className="leading-relaxed text-foreground-secondary">
            Todo o conteúdo, marca, layout, código-fonte e demais elementos da plataforma são de
            propriedade do ImportScope ou de seus licenciantes, sendo vedada a reprodução,
            distribuição ou engenharia reversa sem autorização prévia por escrito.
          </p>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">8. Lei aplicável e foro</h2>
          <p className="leading-relaxed text-foreground-secondary">
            Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Fica
            eleito o foro do domicílio do usuário para dirimir eventuais controvérsias, conforme
            o Código de Defesa do Consumidor, quando aplicável.
          </p>
        </section>

        <section>
          <h2 className="mb-4 mt-12 text-2xl font-bold text-foreground">9. Contato</h2>
          <p className="leading-relaxed text-foreground-secondary">
            Dúvidas sobre estes termos podem ser enviadas para{" "}
            <a href="mailto:contato@importscope.com" className="text-primary hover:underline">
              contato@importscope.com
            </a>
            .
          </p>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}
