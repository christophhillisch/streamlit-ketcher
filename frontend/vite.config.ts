import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Must match _COMPONENT_JS / _COMPONENT_CSS in streamlit_ketcher_editor/__init__.py.
const ENTRY_FILE_NAME = "index.js";
const CSS_FILE_NAME = "index";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Ketcher and its dependencies reference Node's `global` and `process.env`,
  // which do not exist in the browser. Library mode does not replace NODE_ENV
  // on its own, so it is set explicitly to get React's production build.
  define: {
    global: "globalThis",
    "process.env.NODE_ENV": JSON.stringify(mode),
    "process.env": "{}",
  },
  build: {
    // Served by Streamlit as the component's asset_dir.
    outDir: "../streamlit_ketcher_editor/frontend",
    emptyOutDir: true,
    lib: {
      entry: "src/index.tsx",
      formats: ["es"],
      fileName: () => ENTRY_FILE_NAME,
      cssFileName: CSS_FILE_NAME,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setup-tests.ts"],
    clearMocks: true,
  },
}));
