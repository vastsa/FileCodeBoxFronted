import { fileURLToPath, URL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

interface PackageMetadata {
  version: string
}

const packageMetadata = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf8')
) as PackageMetadata

const resolveGitCommit = () => {
  if (process.env.VITE_GIT_COMMIT) return process.env.VITE_GIT_COMMIT

  try {
    return execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()
  } catch {
    return 'unknown'
  }
}

const buildVersion = process.env.VITE_APP_VERSION || packageMetadata.version
const buildCommit = resolveGitCommit()

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion),
    __GIT_COMMIT__: JSON.stringify(buildCommit)
  },
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer]
    }
  }
})
