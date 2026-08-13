const FORNECEDORES = ["Shenzhen Audio Tech", "Guangzhou Wearables", "Dongguan Power Co", "Hangzhou Tools", "Zhongshan Lighting"];

export function SocialProofSection() {
  return (
    <section className="bg-background-card py-16">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-lg text-foreground-secondary sm:text-xl">
          Já analisamos 200+ produtos.{" "}
          <span className="font-semibold text-primary">43%</span> tinham{" "}
          <span className="font-semibold text-primary">NCM incorreto</span> que geraria retenção na
          Receita.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
          {FORNECEDORES.map((f) => (
            <span key={f} className="text-sm font-medium text-foreground-tertiary">
              {f}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
