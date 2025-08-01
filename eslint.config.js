import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import typescript from '@vue/eslint-config-typescript'
import prettier from '@vue/eslint-config-prettier/skip-formatting'

export default [
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  ...typescript(),
  prettier,
  {
    files: ['**/*.{js,mjs,cjs,vue,ts}'],
    rules: {
      // 你可以在这里添加自定义规则
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**']
  }
]