import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default ({}) => {
  return defineConfig({
    plugins: [react(), tailwindcss()],
    base: "/ledture/",
    server: {
      // Forward API calls to the Spring Boot backend during development so the
      // frontend can use relative `/api/...` URLs without CORS issues.
      proxy: {
        "/api": {
          target: "https://ledture-be-903740308007.asia-southeast3.run.app",
          changeOrigin: true,
        },
      },
    },
  });
};
