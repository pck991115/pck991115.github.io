import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://pck991115.github.io",
  integrations: [react()],
  output: "static",
  server: {
    host: "0.0.0.0",
  },
  vite: {
    resolve: {
      alias: {
        "react-dom/client.js": "react-dom/client",
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client", "@phosphor-icons/react"],
    },
  },
});
