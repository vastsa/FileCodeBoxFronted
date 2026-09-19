// 回归验证上传完成不能等待浏览器剪贴板授权；使用真实组合函数和 Vue 响应式对象。
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const source = readFileSync(new URL('../src/composables/useSendFlow.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText

test('剪贴板一直等待时，成功上传仍立即释放提交状态并展示结果', async () => {
  const config = { open_upload: 1, expire_style: ['day'], upload_size: 1024, allowed_file_types: ['*'] }
  const records = []
  let copyRequested = false
  const record = { id: 'test', retrieveCode: 'TEST1', filename: 'Text' }
  // 只替换外部 I/O：上传返回成功，但剪贴板模拟后台页面未决的授权请求。
  const mocks = {
    'vue-i18n': { useI18n: () => ({ t: (key) => key }) },
    '@/stores/alertStore': { useAlertStore: () => ({ showAlert() {} }) },
    '@/stores/adminStore': { useAdminStore: () => ({ hasToken: false }) },
    '@/stores/configStore': { useConfigStore: () => ({ config }) },
    '@/stores/fileData': { useFileDataStore: () => ({ shareData: records, addShareDataRecord: (value) => records.push(value) }) },
    '@/utils/clipboard-paste': {},
    '@/utils/common': { getErrorMessage: () => 'error' },
    '@/utils/convert': { getStorageUnit: (value) => value },
    '@/utils/file-processing': {},
    '@/utils/send-record': { buildSentRecord: () => record, isExpirationWithinLimit: () => true },
    '@/utils/sent-record-actions': { createSentRecordActions: () => ({
      copyLink: () => { copyRequested = true; return new Promise(() => {}) }
    }) },
    './useSendSubmit': { useSendSubmit: () => ({
      resetPresignUpload() {}, submitText: async () => ({ code: 200, detail: { code: 'TEST1' } })
    }) }
  }
  const exports = {}
  vm.runInNewContext(compiled, {
    exports,
    require: (name) => name === 'vue' ? require('vue') : mocks[name],
    console
  })
  const flow = exports.useSendFlow()
  flow.sendType.value = 'text'
  flow.textContent.value = '回归测试'
  const submission = flow.handleSubmit()
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(copyRequested, true)
  assert.equal(flow.isSubmitting.value, false)
  assert.equal(flow.selectedRecord.value.retrieveCode, 'TEST1')
  assert.equal(records.length, 1)
  await submission
})
