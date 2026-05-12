export const Cores = {
  fundo: "#0B132B",      // Azul escuro
  primaria: "#5BC0BE",   // Teal
  secundaria: "#F9DE7E", // Amarelo suave
  accent: "#F28627",     // Laranja
} as const;

export type CoreKeys = keyof typeof Cores;
