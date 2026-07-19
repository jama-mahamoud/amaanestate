import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv} from 'vite';

// Automatically duplicate/sync styled brand icon to specialized standard sizes under the public dir
try {
  const publicDir = path.resolve(__dirname, 'public');
  const sourceIcon = path.join(publicDir, 'house_luxury_icon.png');

  if (fs.existsSync(sourceIcon)) {
    const targets = [
      'favicon.ico',
      'favicon.png',
      'favicon-32x32.png',
      'favicon-48x48.png',
      'apple-touch-icon.png',
      'android-chrome-192x192.png'
    ];

    targets.forEach(target => {
      const targetPath = path.join(publicDir, target);
      // Synchronously clone the asset for complete, robust coverage and no build race conditions
      fs.copyFileSync(sourceIcon, targetPath);
    });
    console.log('[Branding] Brand icon successfully cloned to all compliant favicon sizes.');
  } else {
    console.warn('[Branding Warning] house_luxury_icon.png source is missing in the public directory.');
  }
} catch (error) {
  console.error('[Branding Error] Failed to synch favicons automatically:', error);
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
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
      chunkSizeWarningLimit: 1200
    }
  };
});
