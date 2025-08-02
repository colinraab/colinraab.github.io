/**
 * astro.config.mjs
 * 
 * Astro framework configuration file for my portfolio website.
 * Configures build settings, base URL for GitHub Pages deployment, and integrations.
 * Handles both development and production environments with proper path routing.
 */

import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://astro.build/config
export default defineConfig({
  site: 'https://colinraab.github.io',
  base: '/',

  scopedStyleStrategy: 'class',

  server: {
    host: true,
  },

  vite: {
    resolve: {
      alias: {
        '@/': `${path.resolve(__dirname, 'src')}/`
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use 'sass:math'; @use 'sass:map'; @use "@/styles/import" as *;`
        }
      }
    },
    build: {
      assetsInlineLimit: 0
    }
  },

  devToolbar: {
    enabled: false
  }
});
