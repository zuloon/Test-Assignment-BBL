import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: "127.0.0.1"
  },
  test: {
    environment: "happy-dom",
    setupFiles: "./src/test/setup.ts"
  }
});
