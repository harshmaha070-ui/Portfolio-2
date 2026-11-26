import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-three": ["three", "three-stdlib"],
          "vendor-r3f": ["@react-three/fiber", "@react-three/drei"],
          "vendor-gsap": ["gsap", "@gsap/react"],
        },
      },
    },
  },
});
