"use client";

import { useState } from "react";
import { CalculatorForm } from "@/components/calculadora/calculator-form";
import { CalculatorResult } from "@/components/calculadora/calculator-result";
import type { CalculoTributarioOutput } from "@/types";

interface CalculadoraClientProps {
  contaComHistorico: boolean;
}

export function CalculadoraClient({ contaComHistorico }: CalculadoraClientProps) {
  const [resultado, setResultado] = useState<CalculoTributarioOutput | null>(null);
  const [carregando, setCarregando] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <CalculatorForm onResult={setResultado} onCarregandoChange={setCarregando} />
      <CalculatorResult resultado={resultado} carregando={carregando} contaComHistorico={contaComHistorico} />
    </div>
  );
}
