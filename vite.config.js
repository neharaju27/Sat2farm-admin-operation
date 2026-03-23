import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./", // 🔥 VERY IMPORTANT (fixes blank page)

  plugins: [react()],

  server: {
    proxy: {
      "/data": {
        target: "https://api.sat2farm.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
