import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { globSync } from 'glob'

const rootDir = new URL('..', import.meta.url).pathname
const srcDir = join(rootDir, 'src')

const rules = [
  {
    name: 'views/components 不直接导入 services',
    files: ['src/views/**/*.{ts,vue}', 'src/components/**/*.{ts,vue}'],
    patterns: [/from ['"]@\/services(?:\/[^'"]*)?['"]/],
  },
  {
    name: 'views/components 不直接调用服务类',
    files: ['src/views/**/*.{ts,vue}', 'src/components/**/*.{ts,vue}'],
    patterns: [
      /\bFileService\./,
      /\bConfigService\./,
      /\bAuthService\./,
      /\bStatsService\./,
      /\bPresignUploadService\./,
    ],
  },
  {
    name: 'views/components/composables 不直接导入具体 service 文件',
    files: ['src/views/**/*.{ts,vue}', 'src/components/**/*.{ts,vue}', 'src/composables/**/*.ts'],
    patterns: [/from ['"]@\/services\/[^'"]+['"]/],
  },
  {
    name: '预签名上传 composable 不直接依赖 store',
    files: ['src/composables/usePresignedUpload.ts'],
    patterns: [/from ['"]@\/stores\/[^'"]+['"]/],
  },
  {
    name: '取件流程 composable 不直接依赖路由',
    files: ['src/composables/useRetrieveFlow.ts'],
    patterns: [/from ['"]vue-router['"]/],
  },
  {
    name: '发送流程 composable 不直接依赖路由',
    files: ['src/composables/useSendFlow.ts'],
    patterns: [/from ['"]vue-router['"]/],
  },
  {
    name: '登录流程 composable 不直接依赖路由',
    files: ['src/composables/useAdminLogin.ts'],
    patterns: [/from ['"]vue-router['"]/],
  },
  {
    name: '应用壳不直接调用服务，启动任务需拆到专用 composable',
    files: ['src/composables/useAppShell.ts'],
    patterns: [/\b[A-Z][A-Za-z]+Service\./, /from ['"]@\/services\/[^'"]+['"]/],
  },
  {
    name: '公共配置启动任务独立维护',
    files: ['src/composables/useAppShell.ts'],
    patterns: [/\bgetUserConfig\(/, /\bapplyRemoteConfig\(/],
  },
  {
    name: '仪表盘数据 composable 不在初始化阶段自动加载',
    files: ['src/composables/useDashboardStats.ts'],
    patterns: [/\bonMounted\(/],
  },
  {
    name: '请求客户端统一放在 services/client',
    files: ['src/**/*.{ts,vue}'],
    patterns: [/from ['"]@\/utils\/api['"]/],
    ignoreFiles: [/^src\/utils\/api\.ts$/],
  },
  {
    name: '请求客户端不直接控制浏览器跳转',
    files: ['src/services/client.ts'],
    patterns: [/\bwindow\.location\.(href|replace|assign)\b/, /\blocation\.(href|replace|assign)\b/],
  },
  {
    name: '裸 axios 只能出现在请求客户端封装内',
    files: ['src/**/*.{ts,vue}'],
    patterns: [/import\s+axios\b/],
    ignoreFiles: [/^src\/services\/client\.ts$/, /^src\/services\/upload-client\.ts$/],
  },
  {
    name: '文件打包能力统一放在 file-processing 工具',
    files: ['src/**/*.{ts,vue}'],
    patterns: [/from ['"]jszip['"]/],
    ignoreFiles: [/^src\/utils\/file-processing\.ts$/],
  },
  {
    name: '内容预览渲染统一放在 content-preview 工具',
    files: ['src/**/*.{ts,vue}'],
    patterns: [/from ['"]marked['"]/, /from ['"]dompurify['"]/i],
    ignoreFiles: [/^src\/utils\/content-preview\.ts$/],
  },
  {
    name: '下载动作统一放在 download-action 工具',
    files: ['src/**/*.{ts,vue}'],
    patterns: [/from ['"]file-saver['"]/, /\bwindow\.open\(/],
    ignoreFiles: [/^src\/utils\/download-action\.ts$/],
  },
  {
    name: 'services 统一使用 services/client 作为内部请求入口',
    files: ['src/services/**/*.ts'],
    patterns: [/from ['"]@\/services\/client['"]/],
  },
  {
    name: '非 storage helper 不直接访问 localStorage',
    files: ['src/**/*.{ts,vue}'],
    patterns: [/\blocalStorage\./],
    ignoreFiles: [
      /^src\/utils\/auth-storage\.ts$/,
      /^src\/utils\/config-storage\.ts$/,
      /^src\/utils\/preference-storage\.ts$/,
      /^src\/utils\/record-storage\.ts$/,
    ],
  },
  {
    name: '非 URL helper 不直接读取 window.location.origin',
    files: ['src/**/*.{ts,vue}'],
    patterns: [/\bwindow\.location\.origin\b/],
    ignoreFiles: [/^src\/utils\/share-url\.ts$/],
  },
  {
    name: '非剪贴板 helper 不直接调用剪贴板 API',
    files: ['src/**/*.{ts,vue}'],
    patterns: [/\bnavigator\.clipboard\b/, /\bdocument\.execCommand\(['"]copy['"]\)/],
    ignoreFiles: [/^src\/utils\/clipboard\.ts$/],
  },
  {
    name: '页面和组件不直接导入剪贴板 helper',
    files: ['src/views/**/*.{ts,vue}', 'src/components/**/*.{ts,vue}'],
    patterns: [/from ['"]@\/utils\/clipboard['"]/],
  },
  {
    name: '工具层不直接依赖 store',
    files: ['src/utils/**/*.ts'],
    patterns: [/from ['"]@\/stores\/[^'"]+['"]/],
  },
  {
    name: '系统配置页通过 composable 动作切换二值配置',
    files: ['src/views/manage/SystemSettingsView.vue'],
    patterns: [/config\.(enableChunk|s3_proxy|openUpload)\s*=[^=]/],
  },
  {
    name: '系统配置页开关统一使用 SettingSwitch',
    files: ['src/views/manage/SystemSettingsView.vue'],
    patterns: [/\brole=['"]switch['"]/],
  },
  {
    name: '系统配置页简单数字项统一使用 SettingNumberInput',
    files: ['src/views/manage/SystemSettingsView.vue'],
    patterns: [/<input[^>]*v-model=['"]config\.(uploadMinute|uploadCount|errorMinute|errorCount)['"]/],
  },
  {
    name: '系统配置页不直接处理配置表单转换',
    files: ['src/views/manage/SystemSettingsView.vue'],
    patterns: [/from ['"]@\/utils\/config-form['"]/],
  },
  {
    name: '文件管理编辑弹窗字段统一使用 FileEditField',
    files: ['src/views/manage/FileManageView.vue'],
    patterns: [/<input[^>]*v-model=['"]editForm\.(code|prefix|suffix|expired_at|expired_count)['"]/],
  },
  {
    name: '发送页记录列表统一使用 SentRecordList',
    files: ['src/views/SendFileView.vue'],
    patterns: [/v-for=['"]record in sendRecords['"]/],
  },
  {
    name: '发送页记录详情统一使用 SentRecordDetailModal',
    files: ['src/views/SendFileView.vue'],
    patterns: [/<QRCode\b/, /\bselectedRecord\s*=\s*null\b/],
  },
  {
    name: '发送流程记录构造统一放在 send-record 工具',
    files: ['src/composables/useSendFlow.ts'],
    patterns: [/\bDate\.now\(\)/, /\bnew Date\(\)\.toISOString\(\)/],
  },
  {
    name: '发送流程过期时间格式化统一放在 send-record 工具',
    files: ['src/composables/useSendFlow.ts'],
    patterns: [/\bsetMinutes\(/, /\bsetHours\(/, /\bsetDate\(/],
  },
  {
    name: '发送记录复制和二维码动作统一放在 sent-record-actions 工具',
    files: ['src/composables/useSendFlow.ts'],
    patterns: [
      /\bcopyRetrieve(Code|Link)\(/,
      /\bcopyWgetCommand\(/,
      /\bbuildSentRecordQrValue\(/
    ],
  },
  {
    name: '发送提交策略统一放在 useSendSubmit',
    files: ['src/composables/useSendFlow.ts'],
    patterns: [
      /from ['"]@\/services['"]/,
      /from ['"]\.\/usePresignedUpload['"]/,
      /\buploadChunkedFile\(/,
      /\bFileService\.uploadText\(/,
      /\bpackFilesAsZip\(/
    ],
  },
  {
    name: '取件页不直接改流程内部状态',
    files: ['src/views/RetrievewFileView.vue'],
    patterns: [/\bselectedRecord\s*=\s*null\b/, /\bshowPreview\s*=\s*false\b/],
  },
  {
    name: '旧上传下载 composable 不回流',
    files: ['src/**/*.{ts,vue}'],
    patterns: [/\buseFileUpload\b/, /\buseFileDownload\b/],
  },
  {
    name: '页面层统一从 @/composables 导入',
    files: ['src/views/**/*.{ts,vue}', 'src/App.vue'],
    patterns: [/from ['"]@\/composables\/[^'"]+['"]/],
  },
  {
    name: 'composables 内部同层依赖使用相对导入',
    files: ['src/composables/**/*.ts'],
    patterns: [/from ['"]@\/composables\/[^'"]+['"]/],
  },
]

const violations = []

for (const rule of rules) {
  const files = rule.files.flatMap((pattern) =>
    globSync(pattern, {
      cwd: rootDir,
      absolute: true,
      nodir: true,
      ignore: ['node_modules/**', 'dist/**', 'src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/__tests__/**'],
    })
  )

  for (const file of files) {
    const relativeFile = relative(rootDir, file)
    if (rule.ignoreFiles?.some((pattern) => pattern.test(relativeFile))) {
      continue
    }

    const source = readFileSync(file, 'utf8')
    const lines = source.split(/\r?\n/)

    lines.forEach((line, index) => {
      for (const pattern of rule.patterns) {
        if (pattern.test(line)) {
          violations.push({
            rule: rule.name,
            file: relativeFile,
            line: index + 1,
            text: line.trim(),
          })
        }
      }
    })
  }
}

if (violations.length > 0) {
  console.error('架构边界检查失败：')
  for (const violation of violations) {
    console.error(
      `- ${violation.rule}: ${violation.file}:${violation.line} ${violation.text}`
    )
  }
  process.exit(1)
}

console.log(`架构边界检查通过：${srcDir}`)
