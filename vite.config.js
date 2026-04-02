import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./", // 🔥 VERY IMPORTANT (fixes blank page)

  plugins: [react()],

  server: {
    proxy: {
      "/sat2farm_admin_web": {
        target: "https://api.sat2farm.com",
        changeOrigin: true,
        secure: false,
      },
      "/sat2farm_admin": {
        target: "https://api.sat2farm.com",
        changeOrigin: true,
        secure: false,
      },
      "/data": {
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
      "/report": {
        target: "https://api.sat2farm.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
