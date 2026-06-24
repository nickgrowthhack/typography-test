import {
  CONTROLS,
  DEFAULT_SETTINGS,
  FONT,
  type LetterSpacingUnit,
  type Settings,
  type ThemeName,
} from "~/config/typography";
import { decodeSettings, encodeSettings } from "~/lib/state";
import { clamp, convertLetterSpacing, formatLetterSpacing } from "~/lib/units";

const STORAGE_KEY = "typography-test:settings";

/** Busca um elemento por id ou falha de forma explícita (evita `null` silencioso). */
function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Elemento #${id} não encontrado`);
  return node as T;
}

function lsBounds(unit: LetterSpacingUnit) {
  return unit === "px" ? CONTROLS.letterSpacingPx : CONTROLS.letterSpacingEm;
}

/** Decide o estado inicial: URL > localStorage > padrões. */
function loadInitial(): Settings {
  if (new URLSearchParams(location.search).size > 0) {
    return decodeSettings(location.search);
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return decodeSettings(stored);
  } catch {
    // localStorage indisponível (modo privado etc.) — segue com os padrões.
  }
  return { ...DEFAULT_SETTINGS };
}

export function initPlayground(): void {
  const settings = loadInitial();

  const stage = el<HTMLElement>("stage");
  const lsInput = el<HTMLInputElement>("letterSpacing");
  const lsValue = el<HTMLElement>("letterSpacing-value");
  const fzInput = el<HTMLInputElement>("fontSize");
  const fzValue = el<HTMLElement>("fontSize-value");
  const fwInput = el<HTMLInputElement>("fontWeight");
  const fwValue = el<HTMLElement>("fontWeight-value");
  const lhInput = el<HTMLInputElement>("lineHeight");
  const lhValue = el<HTMLElement>("lineHeight-value");
  const unitEm = el<HTMLButtonElement>("unit-em");
  const unitPx = el<HTMLButtonElement>("unit-px");
  const output = el<HTMLElement>("output");
  const themeToggle = el<HTMLButtonElement>("theme-toggle");
  const resetBtn = el<HTMLButtonElement>("reset");
  const copyBtn = el<HTMLButtonElement>("copy");

  /** Aplica os limites do range de letter-spacing para a unidade atual. */
  function applyLsBounds(): void {
    const b = lsBounds(settings.unit);
    lsInput.min = String(b.min);
    lsInput.max = String(b.max);
    lsInput.step = String(b.step);
  }

  /** Renderiza todo o estado na UI (variáveis CSS, inputs, rótulos, saída). */
  function render(): void {
    const lsCss = formatLetterSpacing(settings.letterSpacing, settings.unit);

    // Variáveis que dirigem todos os blocos de preview.
    stage.style.setProperty("--ls", lsCss);
    stage.style.setProperty("--fz", `${settings.fontSize}px`);
    stage.style.setProperty("--fw", String(settings.fontWeight));
    stage.style.setProperty("--lh", String(settings.lineHeight));

    // Tema no <html>.
    document.documentElement.dataset.theme = settings.theme;

    // Sincroniza inputs (importante ao carregar de URL/storage e no reset).
    lsInput.value = String(settings.letterSpacing);
    fzInput.value = String(settings.fontSize);
    fwInput.value = String(settings.fontWeight);
    lhInput.value = String(settings.lineHeight);

    // Rótulos de valor.
    lsValue.textContent = lsCss;
    fzValue.textContent = `${settings.fontSize}px`;
    fwValue.textContent = String(settings.fontWeight);
    lhValue.textContent = settings.lineHeight.toFixed(2);

    // Estado dos botões de unidade.
    unitEm.setAttribute("aria-pressed", String(settings.unit === "em"));
    unitPx.setAttribute("aria-pressed", String(settings.unit === "px"));
    themeToggle.setAttribute("aria-pressed", String(settings.theme === "light"));

    // CSS pronto para copiar.
    output.textContent = buildCss(settings, lsCss);
  }

  /** Persiste na URL (replaceState) e no localStorage. */
  function persist(): void {
    const qs = encodeSettings(settings);
    history.replaceState(null, "", `?${qs}`);
    try {
      localStorage.setItem(STORAGE_KEY, qs);
    } catch {
      // ignora indisponibilidade de storage
    }
  }

  function update(): void {
    render();
    persist();
  }

  // --- bindings ---
  lsInput.addEventListener("input", () => {
    const b = lsBounds(settings.unit);
    settings.letterSpacing = clamp(Number(lsInput.value), b.min, b.max);
    update();
  });
  fzInput.addEventListener("input", () => {
    settings.fontSize = clamp(Number(fzInput.value), CONTROLS.fontSize.min, CONTROLS.fontSize.max);
    update();
  });
  fwInput.addEventListener("input", () => {
    settings.fontWeight = clamp(Number(fwInput.value), FONT.weight.min, FONT.weight.max);
    update();
  });
  lhInput.addEventListener("input", () => {
    settings.lineHeight = clamp(
      Number(lhInput.value),
      CONTROLS.lineHeight.min,
      CONTROLS.lineHeight.max,
    );
    update();
  });

  function switchUnit(next: LetterSpacingUnit): void {
    if (next === settings.unit) return;
    const b = lsBounds(next);
    // Converte preservando o espaçamento visual, depois limita à nova faixa.
    const converted = convertLetterSpacing(
      settings.letterSpacing,
      settings.unit,
      next,
      settings.fontSize,
    );
    settings.unit = next;
    settings.letterSpacing = clamp(converted, b.min, b.max);
    applyLsBounds();
    update();
  }
  unitEm.addEventListener("click", () => switchUnit("em"));
  unitPx.addEventListener("click", () => switchUnit("px"));

  themeToggle.addEventListener("click", () => {
    settings.theme = settings.theme === "dark" ? "light" : ("dark" satisfies ThemeName);
    update();
  });

  resetBtn.addEventListener("click", () => {
    Object.assign(settings, DEFAULT_SETTINGS);
    applyLsBounds();
    update();
  });

  copyBtn.addEventListener("click", async () => {
    const css = buildCss(settings, formatLetterSpacing(settings.letterSpacing, settings.unit));
    try {
      await navigator.clipboard.writeText(css);
      flash(copyBtn, "Copiado!");
    } catch {
      flash(copyBtn, "Falhou");
    }
  });

  // Estado inicial.
  applyLsBounds();
  update();
}

/** Monta o bloco CSS final, com a fonte e os valores atuais. */
function buildCss(settings: Settings, lsCss: string): string {
  return [
    ".text {",
    `  font-family: ${FONT.cssFamily}, ${FONT.fallback};`,
    `  font-size: ${settings.fontSize}px;`,
    `  font-weight: ${settings.fontWeight};`,
    `  line-height: ${settings.lineHeight};`,
    `  letter-spacing: ${lsCss};`,
    "}",
  ].join("\n");
}

/** Feedback temporário no rótulo de um botão. */
function flash(button: HTMLButtonElement, message: string): void {
  const original = button.textContent;
  button.textContent = message;
  setTimeout(() => {
    button.textContent = original;
  }, 1200);
}
