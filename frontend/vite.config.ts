import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Must match the URL declared in streamlit_ketcher/__init__.py for dev mode.
const DEV_SERVER_PORT = 3000;

export default defineConfig({
  // Streamlit serves the component from a sub-path, so assets must be relative.
  base: "./",
  plugins: [react()],
  // Ketcher and its dependencies reference Node's `global` and `process.env`,
  // which do not exist in the browser.
  define: {
    global: "globalThis",
    "process.env": "{}",
  },
  server: {
    port: DEV_SERVER_PORT,
    strictPort: true,
  },
  build: {
    outDir: "../streamlit_ketcher/frontend",
    emptyOutDir: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setup-tests.ts"],
    clearMocks: true,
  },
});
