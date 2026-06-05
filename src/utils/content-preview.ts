const MARKDOWN_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'a',
  'img'
]

const MARKDOWN_ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'class']

type MarkedRenderer = typeof import('marked')['marked']
type DOMPurifyModule = typeof import('dompurify')['default']

let markdownRendererLoader: Promise<{
  marked: MarkedRenderer
  DOMPurify: DOMPurifyModule
}> | null = null

const loadMarkdownRenderer = async () => {
  markdownRendererLoader ??= Promise.all([import('marked'), import('dompurify')]).then(
    ([markedModule, domPurifyModule]) => ({
      marked: markedModule.marked,
      DOMPurify: domPurifyModule.default
    })
  )
  return markdownRendererLoader
}

export async function renderMarkdownPreview(content: string): Promise<string> {
  try {
    const { marked, DOMPurify } = await loadMarkdownRenderer()
    const rawHtml = await marked(content)
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: MARKDOWN_ALLOWED_TAGS,
      ALLOWED_ATTR: MARKDOWN_ALLOWED_ATTR,
      ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i
    })
  } catch (error) {
    console.error('Markdown 渲染失败:', error)
    return content
  }
}
