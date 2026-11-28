import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Secret removed to comply with security guidelines
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'es2022',
      minify: 'esbuild',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalized = id.replace(/\\/g, '/');
            if (!normalized.includes('/node_modules/')) return undefined;
            if (/\/node_modules\/(?:react|react-dom|scheduler)\//.test(normalized)) {
              return 'vendor-react';
            }
            if (/\/node_modules\/(?:react-router|react-router-dom|@remix-run\/router)\//.test(normalized)) {
              return 'vendor-router';
            }
            if (/\/node_modules\/@supabase\//.test(normalized)) {
              return 'vendor-supabase';
            }
            if (/\/node_modules\/lucide-react\//.test(normalized)) {
              return 'vendor-icons';
            }
            return undefined;
          },
        },
      },
    },
  };
});
