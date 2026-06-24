/**
 * Fonte única de verdade da ferramenta.
 *
 * Hoje testamos apenas a Geist Mono. A estrutura abaixo (metadados da fonte +
 * definição declarativa dos controles + textos de exemplo) deixa trivial, no
 * futuro, generalizar para outras fontes — mas sem construir esse sistema agora
 * (YAGNI). Para trocar/expandir a fonte, basta editar `FONT` e o import em
 * `src/styles/global.css`.
 */

export type LetterSpacingUnit = "em" | "px";
export type ThemeName = "light" | "dark";

export interface FontMeta {
  /** Nome legível, exibido na UI. */
  readonly label: string;
  /** Valor exato de `font-family` (vem do @fontsource-variable/geist-mono). */
  readonly cssFamily: string;
  /** Stack de fallback metric-aware enquanto a fonte carrega. */
  readonly fallback: string;
  /** Faixa de peso suportada pela fonte variável. */
  readonly weight: { readonly min: number; readonly max: number };
}

export const FONT: FontMeta = {
  label: "Geist Mono",
  cssFamily: '"Geist Mono"',
  fallback: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  weight: { min: 100, max: 900 },
};

/** Definição declarativa de um controle numérico do playground. */
export interface NumericControl {
  readonly id: string;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly default: number;
  /** Sufixo exibido ao lado do valor (ex.: "px", "em", ""). */
  readonly suffix?: string;
}

export const CONTROLS = {
  /** Faixa de letter-spacing em `em` (unidade recomendada: escala com o tamanho). */
  letterSpacingEm: {
    id: "letterSpacing",
    label: "Letter-spacing",
    min: -0.1,
    max: 0.3,
    step: 0.005,
    default: 0,
    suffix: "em",
  },
  /** Faixa equivalente em `px` quando o usuário alterna a unidade. */
  letterSpacingPx: {
    id: "letterSpacingPx",
    label: "Letter-spacing",
    min: -4,
    max: 12,
    step: 0.1,
    default: 0,
    suffix: "px",
  },
  fontSize: {
    id: "fontSize",
    label: "Tamanho",
    min: 11,
    max: 96,
    step: 1,
    default: 18,
    suffix: "px",
  },
  fontWeight: {
    id: "fontWeight",
    label: "Peso",
    min: FONT.weight.min,
    max: FONT.weight.max,
    step: 50,
    default: 400,
  },
  lineHeight: {
    id: "lineHeight",
    label: "Entrelinha",
    min: 1,
    max: 2.4,
    step: 0.05,
    default: 1.5,
  },
} as const satisfies Record<string, NumericControl>;

/** Estado completo e serializável do playground. */
export interface Settings {
  /** Valor numérico do letter-spacing, na unidade indicada por `unit`. */
  letterSpacing: number;
  unit: LetterSpacingUnit;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  theme: ThemeName;
}

export const DEFAULT_SETTINGS: Settings = {
  letterSpacing: CONTROLS.letterSpacingEm.default,
  unit: "em",
  fontSize: CONTROLS.fontSize.default,
  fontWeight: CONTROLS.fontWeight.default,
  lineHeight: CONTROLS.lineHeight.default,
  theme: "dark",
};

/** Tipos de bloco de preview — o spacing ideal costuma variar por contexto. */
export type SampleKind = "display" | "heading" | "paragraph" | "code" | "caps" | "numeric";

export interface Sample {
  readonly id: string;
  readonly kind: SampleKind;
  readonly label: string;
  readonly text: string;
}

export const SAMPLES: readonly Sample[] = [
  {
    id: "display",
    kind: "display",
    label: "Display",
    text: "Typeset",
  },
  {
    id: "heading",
    kind: "heading",
    label: "Título",
    text: "Definindo o letter-spacing ideal",
  },
  {
    id: "paragraph",
    kind: "paragraph",
    label: "Parágrafo",
    text: "O espaçamento entre letras muda conforme o tamanho e o peso da fonte. Em corpos pequenos, um leve aumento melhora a legibilidade; em títulos grandes, um valor negativo costuma deixar o conjunto mais coeso e elegante.",
  },
  {
    id: "code",
    kind: "code",
    label: "Código",
    text: "const ls = clamp(value, -0.1, 0.3); // em",
  },
  {
    id: "caps",
    kind: "caps",
    label: "Caixa alta",
    text: "VERSALETE & MAIÚSCULAS",
  },
  {
    id: "numeric",
    kind: "numeric",
    label: "Numérico / tabular",
    text: "0123456789  1,234.56  ($ 9.870,00)",
  },
];
