// ─── Paleta principal (PRESERVADA) ───────────────────────────────────────────
export const Cores = {
  fundo: "#0B132B",      // Azul escuro
  primaria: "#5BC0BE",   // Teal
  secundaria: "#F9DE7E", // Amarelo suave
  accent: "#F28627",     // Laranja
} as const;

// ─── Tokens semânticos (derivados da paleta) ────────────────────────────────
export const Surface = {
  card: "#111827",          // Card backgrounds
  sheet: "#0f172a",         // Bottom sheets, modals
  input: "#1C2B4B",         // Input backgrounds
  elevated: "#1e293b",      // Elementos elevados
} as const;

export const TextColor = {
  primary: "#f1f5f9",       // Texto principal (claro)
  secondary: "#94a3b8",     // Texto secundário
  muted: "#cbd5e1",         // Texto suave (sinopse, etc.)
  onPrimary: "#FFFFFF",     // Texto sobre cores sólidas
  onSurface: "#FFFFFF",     // Texto sobre superfícies
} as const;

export const Border = {
  subtle: Cores.primaria + "20",  // Bordas muito sutis
  light: Cores.primaria + "30",   // Bordas leves
  medium: Cores.primaria + "55",  // Bordas médias (inputs)
} as const;

export const State = {
  error: "#FF6B6B",
  errorBg: "#FF6B6B15",
  success: "#4ade80",
  warning: Cores.secundaria,
  danger: "#f87171",
  disabled: 0.5,
} as const;

// ─── Spacing consistente ────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// ─── Border radius consistente ──────────────────────────────────────────────
export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 30,
  card: 16,
} as const;

// ─── Touch targets (WCAG / Material Design) ────────────────────────────────
export const Touch = {
  minHeight: 48,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
} as const;

export type CoreKeys = keyof typeof Cores;
