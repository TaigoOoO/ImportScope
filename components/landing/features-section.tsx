import { TrendingUp, Calculator, ShieldAlert } from "lucide-react";

const FEATURES = [
  {
    icon: TrendingUp,
    color: "#F97316",
    title: "Oportunidades Semanais",
    description:
      "Receba produtos analisados por IA com margem, risco e viabilidade calculados antes de você investir um centavo.",
  },
  {
    icon: Calculator,
    color: "#3B82F6",
    title: "Calculadora Tributária",
    description:
      "II, IPI, PIS, COFINS, ICMS, AFRMM e Siscomex — tudo calculado com a legislação real, por estado e NCM.",
  },
  {
    icon: ShieldAlert,
    color: "#EF4444",
    title: "Alertas de Retenção",
    description:
      "Descubra antes de importar se o produto exige certificação INMETRO, ANATEL ou Anvisa que pode travar sua carga.",
  },
];

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="bg-background py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-section text-foreground">
          Tudo que você precisa antes de importar
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center rounded-card border border-border bg-background-card p-6 text-center transition-colors hover:border-primary/30"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-md"
                style={{ backgroundColor: `${feature.color}1A`, color: feature.color }}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-card-title text-foreground">{feature.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-foreground-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
