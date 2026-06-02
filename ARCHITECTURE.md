# 前端架构说明

本文档记录前端代码的分层边界和导入规则，用于保持框架稳定、可扩展。

## 目录职责

- `src/views/`：页面编排层，只负责布局、组件组合和事件绑定。
- `src/components/`：可复用 UI 组件，只接收 props、触发 emits，不直接访问接口。
- `src/composables/`：业务流程层，承载页面状态、业务校验、服务调用和视图模型转换。
- `src/services/`：API 访问层，只封装请求路径、请求参数和响应类型；`client.ts` 是统一 HTTP 客户端入口，`upload-client.ts` 只处理外部直传，`upload-strategy.ts` 承载上传协议编排。
- `src/stores/`：跨页面共享状态。局部页面状态应优先放在对应 composable。
- `src/types/`：领域类型定义，按 `api/auth/config/dashboard/file/presign-upload/ui` 拆分。
- `src/utils/`：纯工具、存储 helper、URL 构造、剪贴板、格式化等无页面状态能力，不直接依赖 store。

## 导入规则

- 页面层统一从 `@/composables` 引入业务流程。
- composable 内部引用同目录 composable 时使用相对路径，不通过 `@/composables/*` 绕回统一出口。
- composable 统一从 `@/services` 引入 API 服务。
- service 内部统一使用 `./client`，不要从 `@/utils/api` 或页面层创建请求客户端。
- 裸 `axios` 只能出现在 `services/client.ts` 与 `services/upload-client.ts` 这类客户端封装内。
- 类型默认从 `@/types` 引入；需要领域内复用时可在 `src/types/*` 内部相对引入。
- 不在页面或组件中直接调用 `axios`、`fetch`、`FileService`、`ConfigService` 等服务。
- 不在页面中直接读写 `localStorage`，持久化逻辑放在 `utils/*-storage.ts`。
- 页面和组件不直接导入剪贴板 helper，复制动作由对应 composable 暴露。

## 状态归属

- 发送流程状态归 `useSendFlow`；路由跳转、返回首页等页面编排放在 view。
- 发送记录列表归 `SentRecordList`，发送记录详情归 `SentRecordDetailModal`，发送页不内联记录抽屉明细模板。
- 发送记录视图模型、过期时间校验和过期时间展示归 `utils/send-record.ts`，`useSendFlow` 不内联日期格式化和记录构造。
- 发送记录复制和二维码取值动作归 `utils/sent-record-actions.ts`，`useSendFlow` 不直接调用底层剪贴板和二维码 URL helper。
- 发送提交策略归 `useSendSubmit`，切片上传、预签名上传、文本上传和多文件打包不回流到 `useSendFlow`。
- 取件流程状态归 `useRetrieveFlow`；路由参数读取、自动提交、页面跳转等页面编排放在 view。
- 取件详情和内容预览的打开/关闭动作归 `useRetrieveFlow`，取件页不直接改内部状态 ref。
- 管理文件列表状态归 `useAdminFiles`。
- 文件管理编辑弹窗字段统一使用 `FileEditField`，页面不手写重复输入字段结构。
- 仪表盘数据状态归 `useDashboardStats`，加载时机由 `DashboardView` 显式触发。
- 登录表单和认证请求归 `useAdminLogin`，登录成功后的页面跳转放在 `LoginView`。
- 可复用的底层 composable 不直接读取全局 store 或弹提示，应通过参数注入配置读取和通知回调。
- 系统配置编辑状态归 `useSystemConfig`，公共配置缓存归 `configStore`。
- 系统配置页的布尔/数字开关由 `useSystemConfig` 暴露语义动作，模板不直接写切换表达式。
- 系统配置页的二值开关统一使用 `SettingSwitch`，页面不手写 switch 样式结构。
- 系统配置页的简单数字项统一使用 `SettingNumberInput`，带单位下拉的复合输入可保留在页面编排层。
- 系统配置页的单位表单状态和提交 payload 构造归 `useSystemConfig`，单位换算纯函数归 `utils/config-form.ts`。
- 发送/接收历史记录归 `fileData` store。
- Alert 计时和进度归 `alertStore`，`AlertComponent` 只负责渲染。

## 工具边界

- URL 构造统一放在 `utils/share-url.ts`。
- 剪贴板能力统一放在 `utils/clipboard.ts`，复制结果提示通过调用方注入回调。
- 粘贴事件的纯解析和文本插入计算统一放在 `utils/clipboard-paste.ts`。
- 文件 hash、zip 打包等浏览器文件处理统一放在 `utils/file-processing.ts`。
- Markdown 预览渲染与 HTML 清洗统一放在 `utils/content-preview.ts`。
- 文件下载、文本另存等浏览器下载动作统一放在 `utils/download-action.ts`。
- 配置表单单位转换统一放在 `utils/config-form.ts`。
- 配置缓存读写统一放在 `utils/config-storage.ts`。
- 认证缓存读写统一放在 `utils/auth-storage.ts`。

## 维护约束

- 新页面应先创建对应 composable，再由 view 绑定 composable 输出。
- composable 默认不在初始化阶段自动发起远程请求，页面或上层流程应显式触发加载。
- 新接口应先进入 `services/`，不要在 composable 中拼接散落的底层请求细节。
- Blob、文件下载等需要保留响应头的接口使用 `rawApiClient`，普通 JSON 接口使用默认 `apiClient`。
- 上传协议、断点续传、外部直传等流程优先放在 `services/*strategy*` 或客户端封装，composable 只传入状态、回调和文案。
- 文件打包依赖 `JSZip` 只能出现在 `utils/file-processing.ts`，页面和 composable 不直接依赖打包库。
- 预览渲染依赖 `marked` / `DOMPurify` 只能出现在 `utils/content-preview.ts`。
- 下载动作依赖 `file-saver` 或 `window.open` 时，只能出现在 `utils/download-action.ts`。
- 新共享状态进入 store 前，需要确认它确实跨页面使用。
- 新类型应放入对应领域类型文件，再由 `types/index.ts` 汇总导出。
- 删除旧代码优先于保留兼容别名，除非已有明确外部调用方。

## 验证

每次结构性改动后至少运行：

```sh
pnpm build
```

`pnpm build` 会先执行 `pnpm check:architecture`，再执行类型检查和生产构建。

快速验证架构边界时可单独运行：

```sh
pnpm check:architecture
```

必要时补充：

```sh
pnpm lint
```
