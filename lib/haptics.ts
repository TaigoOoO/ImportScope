/**
 * Aplicado deliberadamente só em momentos que já são "eventos", não em
 * cliques genéricos: gerar oportunidade (sucesso) e atingir o limite
 * diário (erro). Vibrar a cada clique de botão primário no app inteiro
 * enjoa rápido — isso é o tipo de coisa que perde a graça no segundo uso
 * se usada demais, então fica reservada pros momentos que já têm peso.
 */
export function haptic(type: "light" | "medium" | "heavy" | "success" | "error") {
  if (typeof navigator === "undefined") return;
  if (!navigator.vibrate) return;

  const patterns: Record<typeof type, number[]> = {
    light: [10],
    medium: [20],
    heavy: [30],
    success: [10, 50, 10],
    error: [50, 30, 50],
  };

  navigator.vibrate(patterns[type]);
}
