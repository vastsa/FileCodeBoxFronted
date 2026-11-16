import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { test } from 'node:test'
import { URL } from 'node:url'
import ts from 'typescript'

const source = readFileSync(new URL('../src/utils/site-background.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
})
const { normalizeBackgroundUrl } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)

test('accepts http(s) and same-origin absolute paths', () => {
  assert.equal(normalizeBackgroundUrl(' https://example.com/bg.jpg '), 'https://example.com/bg.jpg')
  assert.equal(normalizeBackgroundUrl('http://example.com/a.png?x=1'), 'http://example.com/a.png?x=1')
  assert.equal(normalizeBackgroundUrl('/assets/bg.webp'), '/assets/bg.webp')
})

test('rejects empty, non-http and CSS breakout values', () => {
  for (const value of [
    '',
    null,
    undefined,
    'javascript:alert(1)',
    'data:image/png;base64,AAAA',
    '//evil.example/bg.jpg',
    'https://example.com/a.jpg")',
    "https://example.com/a'.jpg",
    'https://example.com/a b.jpg',
    'relative/bg.jpg'
  ]) {
    assert.equal(normalizeBackgroundUrl(value), '', String(value))
  }
})
