import Link from "next/link";

export function LegalFooter() {
  return (
    <div className="border-t border-border py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 text-center text-xs text-foreground-tertiary">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/termos" className="hover:text-foreground">
            Termos de Uso
          </Link>
          <span>·</span>
          <Link href="/privacidade" className="hover:text-foreground">
            Privacidade
          </Link>
          <span>·</span>
          <a href="mailto:contato@importscope.com" className="hover:text-foreground">
            Contato
          </a>
        </div>
        <p>© {new Date().getFullYear()} ImportScope. Todos os direitos reservados.</p>
        <p>CNPJ: 00.000.000/0001-00</p>
      </div>
    </div>
  );
}
