import Link from "next/link";
import { Twitter, Linkedin, Mail } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { LegalFooter } from "@/components/shared/legal-footer";

export function CtaSection() {
  return (
    <footer className="border-t border-border bg-background-card">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 pt-12 text-center">
        <Logo size={32} />
        <p className="text-sm text-foreground-secondary">
          Feito por importadores, para importadores.
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground-tertiary transition-colors hover:text-primary"
            aria-label="Twitter"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground-tertiary transition-colors hover:text-primary"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href="mailto:contato@importscope.com"
            className="text-foreground-tertiary transition-colors hover:text-primary"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>

        <Link href="/login" className="text-xs text-foreground-tertiary hover:text-foreground">
          Entrar
        </Link>
      </div>

      <LegalFooter />
    </footer>
  );
}
