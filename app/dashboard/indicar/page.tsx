import { ReferralCard } from "@/components/referral/referral-card";

export default function IndicarPage() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-section text-foreground">Indique e Ganhe</h1>
        <p className="text-sm text-foreground-tertiary">
          Convide outros importadores para o ImportScope e ganhe meses grátis do plano Pro.
        </p>
      </div>

      <ReferralCard />
    </div>
  );
}
