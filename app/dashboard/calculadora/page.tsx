import { getCurrentUser, isPro } from "@/lib/auth";
import { CalculadoraClient } from "@/components/calculadora/calculadora-client";

export default async function CalculadoraPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-section text-foreground">Calculadora Tributária</h1>
        <p className="text-sm text-foreground-tertiary">
          Estime II, IPI, PIS, COFINS, ICMS, AFRMM e o custo total de importação.
        </p>
      </div>

      <CalculadoraClient contaComHistorico={user ? isPro(user) : false} />
    </div>
  );
}
