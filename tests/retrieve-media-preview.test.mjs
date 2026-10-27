import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { URL } from 'node:url'
import { compileScript, parse } from 'vue/compiler-sfc'

test('issue #472: retrieval view connects media preview events, state and close action', () => {
  const source = readFileSync(
    new URL('../src/views/RetrievewFileView.vue', import.meta.url),
    'utf8'
  )
  const { descriptor, errors } = parse(source)
  assert.deepEqual(errors, [])
  const { bindings } = compileScript(descriptor, { id: 'retrieve-view' })
  for (const name of [
    'MediaPreviewModal',
    'previewMediaRecord',
    'showMediaPreview',
    'showFilePreview',
    'closeFilePreview'
  ]) {
    assert.ok(bindings[name], `${name} must be available to the template`)
  }
  const template = descriptor.template.content
  assert.match(template, /<FileDetailModal\b[^>]*@preview-file="showFilePreview"/)
  const modal = template.match(/<MediaPreviewModal\b[^>]*\/>/)?.[0]
  assert.ok(modal, 'the public retrieval page must render the media preview modal')
  assert.match(modal, /:visible="showMediaPreview"/)
  assert.match(modal, /:record="previewMediaRecord"/)
  assert.match(modal, /@close="closeFilePreview"/)
})
