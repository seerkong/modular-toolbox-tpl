import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  root: ".",
  resolve: {
    alias: {
      "@frontend/vue": path.resolve(__dirname, "src"),
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
