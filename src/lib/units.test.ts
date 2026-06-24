import { describe, expect, it } from "vitest";
import {
  clamp,
  convertLetterSpacing,
  emToPx,
  formatLetterSpacing,
  pxToEm,
  roundTo,
} from "~/lib/units";

describe("clamp", () => {
  it("mantém valores dentro do intervalo", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it("limita abaixo do mínimo e acima do máximo", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });
  it("rejeita intervalo invertido", () => {
    expect(() => clamp(1, 10, 0)).toThrow(RangeError);
  });
});

describe("roundTo", () => {
  it("arredonda para N casas decimais", () => {
    expect(roundTo(0.123456, 4)).toBe(0.1235);
    expect(roundTo(1.005, 2)).toBe(1.01);
  });
  it("rejeita casas negativas", () => {
    expect(() => roundTo(1, -1)).toThrow(RangeError);
  });
});

describe("pxToEm / emToPx", () => {
  it("converte ida e volta de forma consistente", () => {
    expect(pxToEm(16, 16)).toBe(1);
    expect(emToPx(0.02, 16)).toBeCloseTo(0.32, 5);
    expect(pxToEm(emToPx(0.05, 18), 18)).toBeCloseTo(0.05, 10);
  });
  it("rejeita base não positiva", () => {
    expect(() => pxToEm(1, 0)).toThrow(RangeError);
    expect(() => emToPx(1, -2)).toThrow(RangeError);
  });
});

describe("convertLetterSpacing", () => {
  it("é no-op quando as unidades coincidem", () => {
    expect(convertLetterSpacing(0.02, "em", "em", 16)).toBe(0.02);
  });
  it("preserva o espaçamento visual entre em e px", () => {
    expect(convertLetterSpacing(0.02, "em", "px", 16)).toBeCloseTo(0.32, 5);
    expect(convertLetterSpacing(0.32, "px", "em", 16)).toBeCloseTo(0.02, 5);
  });
});

describe("formatLetterSpacing", () => {
  it("anexa a unidade e arredonda", () => {
    expect(formatLetterSpacing(-0.02, "em")).toBe("-0.02em");
    expect(formatLetterSpacing(0.31999, "px")).toBe("0.32px");
  });
  it("renderiza zero sem unidade e normaliza -0", () => {
    expect(formatLetterSpacing(0, "em")).toBe("0");
    expect(formatLetterSpacing(-0, "px")).toBe("0");
  });
});
