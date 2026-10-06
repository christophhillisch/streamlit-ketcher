import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { withStreamlitConnection } from "streamlit-component-lib";
import "./index.css";
import { KetcherWidget } from "./ketcher-widget.component";

// "withStreamlitConnection" bootstraps the connection between the component
// and the Streamlit app, and passes arguments from Python to the component.
const ConnectedKetcherWidget = withStreamlitConnection(KetcherWidget);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <ConnectedKetcherWidget />
  </StrictMode>,
);
