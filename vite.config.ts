import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to 'VITE_' to load only VITE_ prefixed env vars.
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  console.log('Environment variables loaded:', {
    mode,
    VITE_API_BASE_URL: env.VITE_API_BASE_URL,
    cwd: process.cwd()
  });
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'https://order.govmetric.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'process.env': process.env,
    },
  };
});
