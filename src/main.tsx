import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

/* ===== FIX MOBILE ROTATION REFLOW ===== */
function forceLandscapeRefresh() {
  document.body.style.display = "none";
  document.body.offsetHeight; // force reflow
  document.body.style.display = "";
}

const handleOrientationChange = () => {
  setTimeout(forceLandscapeRefresh, 200);
};

window.addEventListener("orientationchange", handleOrientationChange);
/* ===================================== */

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
