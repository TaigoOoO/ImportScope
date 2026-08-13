"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, Save, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface TipoTemplate {
  type: string;
  override: { subject: string; bodyText: string; updatedBy: string | null } | null;
}

export function EmailTools() {
  // Envio manual
  const [assunto, setAssunto] = useState("");
  const [corpo, setCorpo] = useState("");
  const [segmento, setSegmento] = useState("todos");
  const [enviando, setEnviando] = useState(false);

  // Editor de templates
  const [tipos, setTipos] = useState<TipoTemplate[]>([]);
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null);
  const [subjectEdit, setSubjectEdit] = useState("");
  const [bodyEdit, setBodyEdit] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/admin/emails/templates")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setTipos(data.tipos));
  }, []);

  function selecionarTipo(type: string) {
    const tipo = tipos.find((t) => t.type === type);
    setTipoSelecionado(type);
    setSubjectEdit(tipo?.override?.subject ?? "");
    setBodyEdit(tipo?.override?.bodyText ?? "");
  }

  async function enviarManual() {
    if (!assunto || !corpo) {
      toast.error("Preencha assunto e corpo.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assunto, corpo, segmento }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Enviado para ${data.enviados} usuário(s).`);
      setAssunto("");
      setCorpo("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar.");
    } finally {
      setEnviando(false);
    }
  }

  async function salvarTemplate() {
    if (!tipoSelecionado) return;
    setSalvando(true);
    try {
      const res = await fetch("/api/admin/emails/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tipoSelecionado, subject: subjectEdit, bodyText: bodyEdit }),
      });
      if (!res.ok) throw new Error();
      toast.success("Template salvo. Passa a ser usado no lugar do texto padrão.");
      const atualizado = await fetch("/api/admin/emails/templates").then((r) => r.json());
      setTipos(atualizado.tipos);
    } catch {
      toast.error("Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Tabs defaultValue="manual">
      <TabsList>
        <TabsTrigger value="manual">Enviar email manual</TabsTrigger>
        <TabsTrigger value="templates">Editar templates</TabsTrigger>
      </TabsList>

      <TabsContent value="manual">
        <Card>
          <CardHeader>
            <CardTitle>Enviar email manual</CardTitle>
            <CardDescription>Envia para todos os usuários ou um segmento por plano.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Segmento</Label>
              <Select value={segmento} onValueChange={setSegmento}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os usuários</SelectItem>
                  <SelectItem value="free">Só Free</SelectItem>
                  <SelectItem value="pro">Só Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Assunto</Label>
              <Input value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Assunto do email" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Corpo</Label>
              <textarea
                value={corpo}
                onChange={(e) => setCorpo(e.target.value)}
                rows={8}
                className="rounded-input border border-border bg-background-input px-3 py-2 text-sm text-foreground placeholder:text-foreground-tertiary focus-visible:outline-none focus-visible:border-primary"
                placeholder="Texto do email..."
              />
            </div>
            <Button onClick={enviarManual} disabled={enviando} className="w-fit">
              {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="templates">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          <Card>
            <CardContent className="flex flex-col gap-1 pt-4">
              {tipos.map((t) => (
                <button
                  key={t.type}
                  onClick={() => selecionarTipo(t.type)}
                  className={`rounded-md px-3 py-2 text-left text-sm ${
                    tipoSelecionado === t.type
                      ? "bg-primary/10 text-primary"
                      : "text-foreground-secondary hover:bg-background-elevated"
                  }`}
                >
                  {t.type}
                  {t.override && <span className="ml-2 text-[10px] text-success">editado</span>}
                </button>
              ))}
            </CardContent>
          </Card>

          {tipoSelecionado ? (
            <Card>
              <CardHeader>
                <CardTitle>{tipoSelecionado}</CardTitle>
                <CardDescription>Deixe em branco e salve para voltar ao texto padrão.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Assunto</Label>
                  <Input value={subjectEdit} onChange={(e) => setSubjectEdit(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Corpo</Label>
                  <textarea
                    value={bodyEdit}
                    onChange={(e) => setBodyEdit(e.target.value)}
                    rows={10}
                    className="rounded-input border border-border bg-background-input px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-primary"
                  />
                </div>
                {bodyEdit && (
                  <div className="rounded-input border border-border bg-background-card p-4">
                    <p className="mb-2 flex items-center gap-1.5 text-xs uppercase text-foreground-tertiary">
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-foreground-secondary">{bodyEdit}</p>
                  </div>
                )}
                <Button onClick={salvarTemplate} disabled={salvando} className="w-fit">
                  {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-16 text-sm text-foreground-tertiary">
                Selecione um tipo de email para editar.
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
