"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgeCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export function AgeCheckbox({ checked, onChange, error }: AgeCheckboxProps) {
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
          Declaro ser maior de 18 anos e ter capacidade legal para contratar
        </span>
      </label>
      {error && <p className="mt-1 pl-8 text-sm text-danger">{error}</p>}
    </div>
  );
}
