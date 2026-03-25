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
      "/sat2farm_admin": {
        target: "https://api.sat2farm.com",
        changeOrigin: true,
        secure: false,
      },
      "/user_registration": {
        target: "https://api.sat2farm.com",
        changeOrigin: true,
        secure: false,
      },
      "/register": {
        target: "https://api.sat2farm.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
