import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiTarget = process.env.VITE_API_URL ?? "https://529dadb6-platform4x-api.thanveer-apps.workers.dev";

// Only proxy fetch/XHR requests to the API; let browser navigation
// (Accept: text/html) fall through to Vite so the SPA index.html is served.
function apiProxy(target: string) {
  return {
    target,
    changeOrigin: true,
    bypass(req: { headers: Record<string, string | undefined> }) {
      if (req.headers.accept?.includes("text/html")) {
        return "/index.html";
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/auth": apiProxy(apiTarget),
      "/users": apiProxy(apiTarget),
      "/roles": apiProxy(apiTarget),
      "/meta": apiProxy(apiTarget),
      "/health": apiProxy(apiTarget),
    },
  },
});
