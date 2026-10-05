import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import KetcherWidget from "./ketcher-widget.component";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <KetcherWidget />
  </StrictMode>,
);
