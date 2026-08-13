"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export function TermsCheckbox({ checked, onChange, error }: TermsCheckboxProps) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
            checked ? "border-primary bg-primary" : "border-border-active bg-background-input",
            error && !checked && "border-danger"
          )}
        >
          {checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
        </button>
        <span className="text-sm text-foreground-secondary">
          Li e aceito os{" "}
          <Link
            href="/termos"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link
            href="/privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Política de Privacidade
          </Link>
        </span>
      </label>
      {error && <p className="mt-1 pl-8 text-sm text-danger">{error}</p>}
    </div>
  );
}
