// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // Ferramenta local, sem deploy por enquanto. Mantemos a config mínima
  // e adicionamos integrações/adapters apenas quando houver necessidade real.
  devToolbar: { enabled: true },
});
