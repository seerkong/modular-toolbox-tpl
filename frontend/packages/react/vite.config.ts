import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: ".",
  resolve: {
    alias: {
      "@frontend/react": path.resolve(__dirname, "src"),
      "@frontend/core": path.resolve(__dirname, "../core/src"),
      "@frontend/mediator": path.resolve(__dirname, "../mediator/src"),
      "@app/shared": path.resolve(__dirname, "../../../shared/src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:4000",
      "/sse": "http://localhost:4000",
    },
  },
});
