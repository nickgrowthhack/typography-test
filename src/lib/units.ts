import type { LetterSpacingUnit } from "~/config/typography";

/** Restringe um número ao intervalo [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) throw new RangeError("min não pode ser maior que max");
  return Math.min(Math.max(value, min), max);
}

/**
 * Arredonda para um número fixo de casas decimais.
 *
 * Usa escala via notação exponencial em string para evitar o erro clássico de
 * ponto flutuante (ex.: `1.005 * 100 = 100.4999…`, que arredondaria errado).
 */
export function roundTo(value: number, decimals: number): number {
  if (decimals < 0) throw new RangeError("decimals deve ser >= 0");
  const shifted = Math.round(Number(`${value}e${decimals}`));
  return Number(`${shifted}e-${decimals}`);
}

/** Converte px para em, relativo a um tamanho de fonte base (px). */
export function pxToEm(px: number, basePx: number): number {
  if (basePx <= 0) throw new RangeError("basePx deve ser maior que zero");
  return px / basePx;
}

/** Converte em para px, relativo a um tamanho de fonte base (px). */
export function emToPx(em: number, basePx: number): number {
  if (basePx <= 0) throw new RangeError("basePx deve ser maior que zero");
  return em * basePx;
}

/**
 * Converte um valor de letter-spacing entre unidades preservando o espaçamento
 * visual (relativo ao tamanho da fonte). Ex.: 0.02em a 16px ⇄ 0.32px.
 */
export function convertLetterSpacing(
  value: number,
  from: LetterSpacingUnit,
  to: LetterSpacingUnit,
  fontSizePx: number,
): number {
  if (from === to) return value;
  return to === "px" ? emToPx(value, fontSizePx) : pxToEm(value, fontSizePx);
}

/** Casas decimais usadas ao exibir/serializar cada unidade. */
const DECIMALS: Record<LetterSpacingUnit, number> = { em: 4, px: 2 };

/** Formata um valor de letter-spacing como CSS válido, ex.: "-0.02em". */
export function formatLetterSpacing(value: number, unit: LetterSpacingUnit): string {
  const rounded = roundTo(value, DECIMALS[unit]);
  // -0 vira 0; valor 0 é renderizado como "0" (sem unidade), que é CSS válido.
  const normalized = rounded === 0 ? 0 : rounded;
  return normalized === 0 ? "0" : `${normalized}${unit}`;
}
