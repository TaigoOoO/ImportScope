"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Rocket, TrendingUp, Search } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TEXTOS } from "@/lib/constants";

const NAV_LINKS = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#precos", label: "Preços" },
  { href: "#faq", label: "FAQ" },
];

export function HeroSection() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || enviando) return;
    setEnviando(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setEnviado(true);
        toast.success("Você entrou na lista de espera!");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Não foi possível entrar na lista agora.");
      }
    } catch {
      toast.error("Não foi possível entrar na lista agora.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-gradient-bg-radial" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <Logo size={36} />
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-foreground-secondary transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
        <Button asChild variant="outline">
          <Link href="/login">Entrar</Link>
        </Button>
      </nav>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 text-center md:px-12">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 inline-flex items-center gap-1.5 rounded-pill border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
        >
          <Rocket className="h-3.5 w-3.5" />
          {TEXTOS.landingCtaBadge}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl"
        >
          {TEXTOS.landingHeadlinePrefix}{" "}
          <span className="text-gradient-primary">{TEXTOS.landingHeadlineDestaque}</span>{" "}
          <span className="underline-wave">por erro de NCM</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 max-w-xl text-lg text-foreground-secondary"
        >
          {TEXTOS.landingSubheadline}
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="mt-8 flex w-full max-w-md flex-col items-center gap-3"
        >
          <Input
            type="email"
            required
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={enviado || enviando}
            className="h-12 w-full text-base"
          />
          <Button type="submit" size="lg" disabled={enviado || enviando} className="w-full whitespace-nowrap">
            {enviado ? "Você está na lista! 🎉" : enviando ? "Enviando..." : TEXTOS.landingCtaButton}
          </Button>
          <p className="text-xs text-foreground-tertiary">Sem spam. Só o relatório, quando sair.</p>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{ perspective: 1000 }}
          className="relative mt-16 w-full max-w-4xl"
        >
          <div
            className="rounded-card border border-border bg-background-card p-4 shadow-elevated"
            style={{ transform: "rotateX(6deg)" }}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Search, label: "Oportunidades", value: "128" },
                { icon: TrendingUp, label: "Margem Média", value: "58%" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-input border border-border bg-background-elevated p-3 text-left">
                  <stat.icon className="mb-2 h-4 w-4 text-primary" />
                  <p className="text-[10px] uppercase text-foreground-tertiary">{stat.label}</p>
                  <p className="font-mono text-lg font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
              <div className="rounded-input border border-primary/30 bg-primary/10 p-3 text-left">
                <p className="text-[10px] uppercase text-primary">🔥 Oportunidade</p>
                <p className="mt-2 font-mono text-lg font-bold text-foreground">64%</p>
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="col-span-1 h-20 rounded-input border border-border bg-background-elevated" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
