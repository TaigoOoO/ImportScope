import { obterConfig } from "@/lib/app-config";
import { ConfigForm } from "@/components/admin/config-form";
import { DemoMode } from "@/components/demo/demo-mode";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AdminConfigPage() {
  const config = await obterConfig();

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-section text-foreground">Configurações</h1>
        <p className="text-sm text-foreground-tertiary">Ajustes globais e ações de sistema.</p>
      </div>

      <ConfigForm
        configInicial={{
          precoProCentavos: config.precoProCentavos,
          limiteDiarioFree: config.limiteDiarioFree,
          textoBannerLegal: config.textoBannerLegal,
          modoManutencao: config.modoManutencao,
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Modo Demo</CardTitle>
          <CardDescription>Para gravar vídeos de apresentação — navega o dashboard sozinho.</CardDescription>
        </CardHeader>
        <CardContent>
          <DemoMode />
        </CardContent>
      </Card>
    </div>
  );
}
