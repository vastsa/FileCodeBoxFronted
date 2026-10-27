import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test, mock } from 'node:test'
import { URL } from 'node:url'
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm'
import { marked } from 'marked'
import ts from 'typescript'

const source = readFileSync(new URL('../src/utils/content-preview.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
})

// Isolate the cached loader and inject failures without changing the production API.
async function createRenderer({ parse = marked, sanitize = mock.fn(), failedImport } = {}) {
  const logError = mock.fn()
  const context = createContext({ console: { error: logError } })
  const module = new SourceTextModule(outputText, {
    context,
    importModuleDynamically: async (specifier) => {
      if (specifier === failedImport) throw new Error('Failed to load renderer chunk')
      assert.ok(['marked', 'dompurify'].includes(specifier))
      const exports = specifier === 'marked' ? { marked: parse } : { default: { sanitize } }
      const dependency = new SyntheticModule(
        Object.keys(exports),
        function () {
          for (const [name, value] of Object.entries(exports)) this.setExport(name, value)
        },
        { context }
      )
      await dependency.link(() => assert.fail('Unexpected static import'))
      await dependency.evaluate()
      return dependency
    }
  })
  await module.link(() => assert.fail('Unexpected static import'))
  await module.evaluate()
  return { render: module.namespace.renderMarkdownPreview, logError }
}

const unsafeContent = '<img src=x onerror="alert(1)"> & \'text\'\n<script>alert(2)</script>'
const escapedContent =
  '&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;text&#39;\n&lt;script&gt;alert(2)&lt;/script&gt;'

function assertSafeFallback(actual, expected = escapedContent) {
  assert.equal(actual, expected)
  assert.doesNotMatch(actual, /[<>]/)
}

test('issue #557: deeply nested blockquotes fall back to escaped text', async () => {
  const content = '>'.repeat(5000) + '\n\n' + unsafeContent
  const sanitize = mock.fn()
  const { render, logError } = await createRenderer({ sanitize })

  assertSafeFallback(await render(content), '&gt;'.repeat(5000) + '\n\n' + escapedContent)
  assert.equal(sanitize.mock.callCount(), 0)
  assert.equal(logError.mock.callCount(), 1)
  assert.equal(logError.mock.calls[0].arguments[1].name, 'RangeError')
})

for (const asyncFailure of [false, true]) {
  test(`escapes text when marked ${asyncFailure ? 'rejects' : 'throws'}`, async () => {
    const error = new Error('Parse failed')
    const parse = asyncFailure
      ? () => Promise.reject(error)
      : () => {
          throw error
        }
    const sanitize = mock.fn()
    const { render } = await createRenderer({ parse, sanitize })

    assertSafeFallback(await render(unsafeContent))
    assert.equal(sanitize.mock.callCount(), 0)
  })
}

for (const failedImport of ['marked', 'dompurify']) {
  test(`escapes text when the ${failedImport} chunk fails to load`, async () => {
    const { render } = await createRenderer({ failedImport })

    assertSafeFallback(await render(unsafeContent))
    // A cached rejected loader must also remain safe on subsequent previews.
    assertSafeFallback(await render(unsafeContent))
  })
}

test('escapes text when sanitization throws', async () => {
  const { render } = await createRenderer({
    sanitize: () => {
      throw new Error('Sanitization failed')
    }
  })

  assertSafeFallback(await render(unsafeContent))
})

test('fallback preserves empty text, Unicode, whitespace and literal entities', async () => {
  const { render } = await createRenderer({ failedImport: 'dompurify' })

  assert.equal(await render(''), '')
  assert.equal(await render('中文\n\t  text'), '中文\n\t  text')
  assertSafeFallback(
    await render('&lt;img&gt; &amp; &#60; <>&"\''),
    '&amp;lt;img&amp;gt; &amp;amp; &amp;#60; &lt;&gt;&amp;&quot;&#39;'
  )
})

test('successful Markdown rendering returns only the sanitizer result', async () => {
  const safeHtml = '<h1>Title</h1>\n<p><strong>bold</strong></p>\n'
  const sanitize = mock.fn(() => safeHtml)
  const { render, logError } = await createRenderer({ sanitize })
  const content = '# Title\n\n**bold**\n\n<img src=x onerror="alert(1)">'

  assert.equal(await render(content), safeHtml)
  assert.equal(logError.mock.callCount(), 0)
  assert.equal(sanitize.mock.callCount(), 1)
  const [rawHtml, options] = sanitize.mock.calls[0].arguments
  assert.equal(rawHtml, await marked(content))
  assert.ok(options.ALLOWED_TAGS.includes('h1'))
  assert.ok(!options.ALLOWED_TAGS.includes('script'))
  assert.ok(!options.ALLOWED_ATTR.includes('onerror'))
  assert.ok(!options.ALLOWED_URI_REGEXP.test('javascript:alert(1)'))
})
