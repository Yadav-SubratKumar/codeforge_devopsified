import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Dev server — replaces CRA's "proxy" field in package.json
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  // Preview server (after build)
  preview: {
    port: 3000,
  },

  // Resolve aliases — replaces jsconfig paths
  resolve: {
    alias: {
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@hooks": "/src/hooks",
      "@context": "/src/context",
    },
  },

  // Test config (Vitest) — replaces jest block in package.json
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: ["src/index.jsx", "src/setupTests.js", "vite.config.js"],
    },
  },

  build: {
    outDir: "build",       // keep same output dir as CRA for Dockerfile compatibility
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          monaco: ["@monaco-editor/react"],
        },
      },
    },
  },
});
