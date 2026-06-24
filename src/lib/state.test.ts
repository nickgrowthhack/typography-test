import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, type Settings } from "~/config/typography";
import { decodeSettings, encodeSettings } from "~/lib/state";

describe("decodeSettings", () => {
  it("retorna os padrões para querystring vazia", () => {
    expect(decodeSettings("")).toEqual(DEFAULT_SETTINGS);
  });
  it("lê valores válidos", () => {
    const s = decodeSettings("ls=-0.03&u=em&fz=24&fw=600&lh=1.4&t=light");
    expect(s).toEqual<Settings>({
      letterSpacing: -0.03,
      unit: "em",
      fontSize: 24,
      fontWeight: 600,
      lineHeight: 1.4,
      theme: "light",
    });
  });
  it("limita valores fora da faixa", () => {
    const s = decodeSettings("fz=9999&fw=-5&lh=99");
    expect(s.fontSize).toBe(96);
    expect(s.fontWeight).toBe(100);
    expect(s.lineHeight).toBe(2.4);
  });
  it("ignora valores não numéricos e cai no padrão", () => {
    const s = decodeSettings("ls=abc&fz=");
    expect(s.letterSpacing).toBe(DEFAULT_SETTINGS.letterSpacing);
    expect(s.fontSize).toBe(DEFAULT_SETTINGS.fontSize);
  });
  it("usa a faixa de px quando a unidade é px", () => {
    const s = decodeSettings("u=px&ls=99");
    expect(s.unit).toBe("px");
    expect(s.letterSpacing).toBe(12); // máximo da faixa px
  });
});

describe("encode/decode round-trip", () => {
  it("preserva o estado", () => {
    const original: Settings = {
      letterSpacing: 0.045,
      unit: "px",
      fontSize: 32,
      fontWeight: 350,
      lineHeight: 1.65,
      theme: "light",
    };
    expect(decodeSettings(encodeSettings(original))).toEqual(original);
  });
});
