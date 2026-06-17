import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 3000,
  },

  resolve: {
    alias: {
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@hooks": "/src/hooks",
      "@context": "/src/context",
    },
  },

  // Monaco editor web workers must be bundled as separate chunks so the browser
  // can load them via blob: URLs (allowed by nginx's worker-src blob: CSP rule).
  worker: {
    format: "es",
  },

  optimizeDeps: {
    // Pre-bundle monaco-editor so Vite doesn't try to scan thousands of files at dev startup
    include: ["monaco-editor/esm/vs/editor/editor.worker"],
  },

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
    outDir: "build",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Bundle React dependencies into a 'vendor' chunk
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/")
          ) {
            return "vendor";
          }
          // Bundle Monaco Editor into its own chunk
          if (id.includes("node_modules/monaco-editor/")) {
            return "monaco-editor";
          }
        },
      },
    },
  },
});