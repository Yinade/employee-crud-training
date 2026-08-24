import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // No rewrite: keep the same path your backend expects
      "/Api/v1/identity-service": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/Api/v1/payment-service": {
        target: "http://localhost:8087",
        changeOrigin: true,
      },
      "/Api/v1/operation-service": {
        target: "http://localhost:8088",
        changeOrigin: true,
      },
    },
  },
});
