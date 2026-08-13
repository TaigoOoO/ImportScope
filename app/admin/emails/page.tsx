import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";
import { calcularTaxasPorTipo, listarEmailLogsRecentes } from "@/lib/admin-emails";
import { EmailTools } from "@/components/admin/email-tools";

export default async function AdminEmailsPage() {
  const [taxas, logs] = await Promise.all([calcularTaxasPorTipo(), listarEmailLogsRecentes(50)]);

  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-section text-foreground">Emails</h1>
        <p className="text-sm text-foreground-tertiary">
          Envios, taxas de abertura/clique, envio manual e edição de templates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Taxas por tipo</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto pt-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-foreground-tertiary">
                <th className="py-2 font-medium">Tipo</th>
                <th className="py-2 font-medium">Enviados</th>
                <th className="py-2 font-medium">Abertura</th>
                <th className="py-2 font-medium">Clique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {taxas.map((t) => (
                <tr key={t.type} className="text-foreground-secondary">
                  <td className="py-2 font-mono text-xs">{t.type}</td>
                  <td className="py-2">{t.enviados}</td>
                  <td className="py-2">{t.taxaAberturaPct !== null ? formatPercent(t.taxaAberturaPct, 0) : "—"}</td>
                  <td className="py-2">{t.taxaCliquePct !== null ? formatPercent(t.taxaCliquePct, 0) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-foreground-tertiary">
            Abertura/clique ficam em 0% até um provedor de email real (com pixel/redirect
            rastreado) ser configurado — ver `lib/email-templates.ts`.
          </p>
        </CardContent>
      </Card>

      <EmailTools />

      <Card>
        <CardHeader>
          <CardTitle>Envios recentes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto pt-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-foreground-tertiary">
                <th className="py-2 font-medium">Tipo</th>
                <th className="py-2 font-medium">Destinatário</th>
                <th className="py-2 font-medium">Enviado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="text-foreground-secondary">
                  <td className="py-2 font-mono text-xs">{log.type}</td>
                  <td className="py-2">{log.user.email}</td>
                  <td className="py-2">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(log.sentAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
