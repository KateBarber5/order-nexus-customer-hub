import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// Custom plugin to copy staticwebapp.config.json to dist
const copyStaticWebAppConfig = () => {
  return {
    name: 'copy-staticwebapp-config',
    writeBundle() {
      const sourcePath = path.resolve(__dirname, 'staticwebapp.config.json');
      const destPath = path.resolve(__dirname, 'dist/staticwebapp.config.json');
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log('✅ Copied staticwebapp.config.json to dist/');
      } else {
        console.warn('⚠️ staticwebapp.config.json not found in root directory');
      }
    }
  };
};

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
      copyStaticWebAppConfig(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'process.env': process.env,
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
      },
    },
    publicDir: 'public',
  };
});
