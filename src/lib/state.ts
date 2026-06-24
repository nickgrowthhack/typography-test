import {
  CONTROLS,
  DEFAULT_SETTINGS,
  FONT,
  type LetterSpacingUnit,
  type Settings,
  type ThemeName,
} from "~/config/typography";
import { clamp } from "~/lib/units";

/**
 * Serialização do estado <-> URL (querystring).
 *
 * Manter o estado na URL torna cada configuração reproduzível e compartilhável:
 * a decisão de letter-spacing vira um link, não uma captura de tela.
 */

const KEYS = {
  letterSpacing: "ls",
  unit: "u",
  fontSize: "fz",
  fontWeight: "fw",
  lineHeight: "lh",
  theme: "t",
} as const;

function parseNumber(raw: string | null): number | null {
  if (raw === null || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function parseUnit(raw: string | null): LetterSpacingUnit {
  return raw === "px" ? "px" : "em";
}

function parseTheme(raw: string | null): ThemeName {
  return raw === "light" ? "light" : "dark";
}

/** Lê e sanitiza um estado a partir de uma querystring (à prova de valores inválidos). */
export function decodeSettings(search: string): Settings {
  const params = new URLSearchParams(search);
  const unit = parseUnit(params.get(KEYS.unit));
  const lsBounds = unit === "px" ? CONTROLS.letterSpacingPx : CONTROLS.letterSpacingEm;

  return {
    unit,
    letterSpacing: clamp(
      parseNumber(params.get(KEYS.letterSpacing)) ?? lsBounds.default,
      lsBounds.min,
      lsBounds.max,
    ),
    fontSize: clamp(
      parseNumber(params.get(KEYS.fontSize)) ?? DEFAULT_SETTINGS.fontSize,
      CONTROLS.fontSize.min,
      CONTROLS.fontSize.max,
    ),
    fontWeight: clamp(
      parseNumber(params.get(KEYS.fontWeight)) ?? DEFAULT_SETTINGS.fontWeight,
      FONT.weight.min,
      FONT.weight.max,
    ),
    lineHeight: clamp(
      parseNumber(params.get(KEYS.lineHeight)) ?? DEFAULT_SETTINGS.lineHeight,
      CONTROLS.lineHeight.min,
      CONTROLS.lineHeight.max,
    ),
    theme: parseTheme(params.get(KEYS.theme)),
  };
}

/** Serializa o estado para uma querystring estável (ordem fixa das chaves). */
export function encodeSettings(settings: Settings): string {
  const params = new URLSearchParams();
  params.set(KEYS.letterSpacing, String(settings.letterSpacing));
  params.set(KEYS.unit, settings.unit);
  params.set(KEYS.fontSize, String(settings.fontSize));
  params.set(KEYS.fontWeight, String(settings.fontWeight));
  params.set(KEYS.lineHeight, String(settings.lineHeight));
  params.set(KEYS.theme, settings.theme);
  return params.toString();
}
