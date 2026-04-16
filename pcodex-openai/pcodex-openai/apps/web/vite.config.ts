import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/auth": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/users": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/roles": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/departments": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/projects": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/skill-categories": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/skills": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/notifications": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/login-logs": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/operation-logs": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
      "/permissions": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
});
