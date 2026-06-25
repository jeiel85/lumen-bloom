import "../index.css";
import { loadConfig } from "../config/loadConfig";
import { GameApp } from "./GameApp";

function bootstrap(): void {
  console.log("[Bootstrap] Loading application...");
  
  // 1. Load configuration and validate
  const config = loadConfig();
  console.log("[Bootstrap] Config loaded successfully", config);

  // 2. Initialize GameApp
  try {
    const app = new GameApp(config);
    console.log("[Bootstrap] GameApp initialized.", app);
  } catch (error) {
    console.error("[Bootstrap] Failed to initialize GameApp", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
