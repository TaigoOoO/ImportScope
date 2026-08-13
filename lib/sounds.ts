const STORAGE_KEY = "importscope:sons-ativados";

let audioCtx: AudioContext | null = null;

/**
 * Cria (ou retoma) o AudioContext só quando de fato vai tocar algo, e só
 * dentro de uma chamada que já parte de um gesto do usuário (clique). Isso
 * evita o bug clássico: navegadores mantêm o AudioContext suspenso até ele
 * ser criado/retomado dentro de um gesto — criar no carregamento do
 * módulo (fora de qualquer clique) faz o som nunca tocar de verdade.
 */
function obterAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function somAtivado(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function definirSomAtivado(ativo: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(ativo));
}

/**
 * Só toca se o usuário tiver ativado em Configurações — default é
 * desligado. O rótulo "(opt-in)" só significa algo se o código
 * efetivamente checar a preferência antes de tocar, então essa checagem
 * fica aqui dentro em vez de depender de cada chamador lembrar de checar.
 */
export function playSound(type: "click" | "success" | "error" | "scan") {
  if (!somAtivado()) return;

  const ctx = obterAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === "click") {
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  if (type === "success") {
    osc.frequency.value = 523;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1046, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }

  if (type === "error") {
    osc.frequency.value = 220;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  }

  if (type === "scan") {
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }
}
