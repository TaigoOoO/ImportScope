"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DollarSign, Ship, Shield, Plane, Calculator, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NcmSelector } from "@/components/calculadora/ncm-selector";
import { ESTADOS_ICMS } from "@/lib/tax-data";
import { trackEvent } from "@/lib/analytics-client";
import { cn } from "@/lib/utils";
import type { CalculoTributarioInput, CalculoTributarioOutput } from "@/types";

const formSchema = z.object({
  fob: z.coerce.number().positive("Informe um valor FOB válido."),
  frete: z.coerce.number().nonnegative(),
  seguro: z.coerce.number().nonnegative(),
  ncm: z.string().min(1, "Selecione um NCM."),
  estado: z.string().min(1),
  transporte: z.enum(["aereo", "maritimo"]),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculatorFormProps {
  onResult: (resultado: CalculoTributarioOutput | null) => void;
  onCarregandoChange: (carregando: boolean) => void;
}

export function CalculatorForm({ onResult, onCarregandoChange }: CalculatorFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fob: 100,
      frete: 20,
      seguro: 5,
      ncm: "8518.30.00",
      estado: "SP",
      transporte: "maritimo",
    },
  });

  async function onSubmit(values: FormValues) {
    onCarregandoChange(true);
    try {
      const res = await fetch("/api/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values satisfies CalculoTributarioInput),
      });
      if (res.ok) {
        onResult(await res.json());
        trackEvent("calculator_used", { ncm: values.ncm, transporte: values.transporte });
      } else {
        onResult(null);
      }
    } finally {
      onCarregandoChange(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora de Importação</CardTitle>
        <CardDescription>Descubra o custo real antes de comprar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fob">Valor FOB (USD)</Label>
              <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-tertiary" />
                <Input id="fob" type="number" step="0.01" className="pl-9" {...register("fob")} />
              </div>
              {errors.fob && <p className="text-xs text-danger">{errors.fob.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="frete">Frete Internacional (USD)</Label>
              <div className="relative">
                <Ship className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-tertiary" />
                <Input id="frete" type="number" step="0.01" className="pl-9" {...register("frete")} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="seguro">Seguro (USD)</Label>
              <div className="relative">
                <Shield className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-tertiary" />
                <Input id="seguro" type="number" step="0.01" className="pl-9" {...register("seguro")} />
              </div>
            </div>
          </div>

          <Controller
            control={control}
            name="ncm"
            render={({ field }) => <NcmSelector value={field.value} onChange={field.onChange} />}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Estado Destino</Label>
              <Controller
                control={control}
                name="estado"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_ICMS.map((e) => (
                        <SelectItem key={e.uf} value={e.uf}>
                          {e.nome} ({e.aliquota}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Tipo de Transporte</Label>
              <Controller
                control={control}
                name="transporte"
                render={({ field }) => (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => field.onChange("aereo")}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-input border px-3 py-2 text-sm transition-colors",
                        field.value === "aereo"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground-secondary hover:bg-background-elevated"
                      )}
                    >
                      <Plane className="h-4 w-4" /> Aéreo
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange("maritimo")}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-input border px-3 py-2 text-sm transition-colors",
                        field.value === "maritimo"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground-secondary hover:bg-background-elevated"
                      )}
                    >
                      <Ship className="h-4 w-4" /> Marítimo
                    </button>
                  </div>
                )}
              />
            </div>
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4" />
                Processar Custo
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
