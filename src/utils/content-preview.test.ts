import { describe, expect, it } from 'vitest'

import { renderMarkdownPreview } from './content-preview'

describe('renderMarkdownPreview', () => {
  it('renders markdown and removes unsafe html', async () => {
    const html = await renderMarkdownPreview(
      '# Title\n\n[ok](https://example.com)\n\n<script>alert(1)</script><img src="x" onerror="alert(1)">'
    )

    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('<img src="x">')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('onerror')
  })
})
