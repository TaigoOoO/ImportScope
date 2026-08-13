import { getCurrentUser, isPro } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccountSettingsLegal } from "@/components/dashboard/account-settings-legal";
import { SoundPreferenceToggle } from "@/components/dashboard/sound-preference-toggle";

export default async function ConfiguracoesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const pro = isPro(user);

  return (
    <div className="flex max-w-xl flex-col gap-6 py-4">
      <div>
        <h1 className="text-section text-foreground">Configurações</h1>
        <p className="text-sm text-foreground-tertiary">Informações da sua conta.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-tertiary">Email</span>
            <span className="text-sm font-medium text-foreground">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-tertiary">Plano</span>
            <Badge
              className={
                pro
                  ? "border-transparent bg-gradient-to-r from-primary to-primary-hover text-white uppercase"
                  : "border-transparent bg-background-elevated text-foreground-secondary uppercase"
              }
            >
              {pro ? "Pro" : "Free"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-tertiary">Membro desde</span>
            <span className="text-sm font-medium text-foreground">
              {new Intl.DateTimeFormat("pt-BR").format(new Date(user.createdAt))}
            </span>
          </div>
          {user.acceptedTermsAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground-tertiary">Termos aceitos em</span>
              <span className="text-sm font-medium text-foreground">
                {new Intl.DateTimeFormat("pt-BR").format(new Date(user.acceptedTermsAt))}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <SoundPreferenceToggle />

      <AccountSettingsLegal isPro={pro} temAssinatura={!!user.stripeCustomerId} />
    </div>
  );
}
