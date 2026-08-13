"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";

const STORAGE_KEY = "importscope:legal-banner-minimized";
const TEXTO_PADRAO =
  "O ImportScope é uma ferramenta de apoio à decisão. Sempre confira cálculos e classificações fiscais com um despachante aduaneiro habilitado antes de importar.";

interface LegalBannerProps {
  texto?: string | null;
}

export function LegalBanner({ texto }: LegalBannerProps) {
  const [minimizado, setMinimizado] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setMinimizado(localStorage.getItem(STORAGE_KEY) === "true");
    setPronto(true);
  }, []);

  function minimizar() {
    setMinimizado(true);
    localStorage.setItem(STORAGE_KEY, "true");
  }

  function expandir() {
    setMinimizado(false);
    localStorage.setItem(STORAGE_KEY, "false");
  }

  // Evita flash de conteúdo incorreto antes de ler o localStorage no client.
  if (!pronto) return <div className="h-[45px] w-full bg-warning/10" />;

  if (minimizado) {
    return (
      <button
        onClick={expandir}
        title="Clique para ver aviso legal"
        className="group flex h-1.5 w-full items-center justify-center bg-warning/20 transition-all hover:h-2"
        aria-label="Expandir aviso legal"
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1 border-b border-warning/20 bg-warning/10 px-6 py-3 text-center sm:flex-row sm:gap-2">
      <p className="flex items-center gap-1.5 text-sm text-warning/90">
        <Info className="h-4 w-4 shrink-0" />
        {texto || TEXTO_PADRAO}
      </p>
      <button
        onClick={minimizar}
        className="shrink-0 text-sm font-medium text-warning underline decoration-warning/40 underline-offset-2 hover:text-warning/80"
      >
        Entendi
      </button>
    </div>
  );
}
