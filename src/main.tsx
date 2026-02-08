import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Block access from the default Vercel domain — show a blank page
if (window.location.hostname === 'clawquests.vercel.app') {
  document.title = '';
  document.head.querySelectorAll('meta[property], meta[name="description"]').forEach(el => el.remove());
  document.body.innerHTML = '';
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
