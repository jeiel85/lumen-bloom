import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

// The landing page (index.html) is the site homepage; the playable game lives
// at play.html. `base` is only applied for production builds so GitHub Pages can
// serve the project under /lumen-bloom/, while local dev keeps clean root URLs.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/lumen-bloom/" : "/",
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        play: fileURLToPath(new URL("./play.html", import.meta.url)),
      },
    },
  },
}));
