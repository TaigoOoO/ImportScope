const STORAGE_KEY = "importscope:demo-mode-ativo";
const EVENT_NAME = "demo-mode-changed";

export function demoModeAtivo(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function definirDemoModeAtivo(ativo: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(ativo));
  // localStorage's own "storage" event só dispara em OUTRAS abas — para a
  // aba atual reagir imediatamente (ex: o runner no dashboard perceber que
  // foi ligado a partir do botão no /admin), precisamos de um evento
  // próprio também.
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { ativo } }));
}

export function onDemoModeChange(callback: (ativo: boolean) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent<{ ativo: boolean }>).detail.ativo);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
