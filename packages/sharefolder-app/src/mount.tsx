import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App"

function mountReact() {
  const container = document.body;
  if (!container) {
    console.error("No #react element found in index.html");
    return;
  }
  const root = createRoot(container);
  root.render(<App />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountReact);
} else {
  mountReact();
}