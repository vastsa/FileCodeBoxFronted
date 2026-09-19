# 2024 主题寄件功能

访客凭管理员分发的寄件码进入 `/#/delivery`，验证后复用 `SendFileView`、`useSendFlow` 及普通上传服务。上传成功返回普通取件码；文本、单文件和一个多文件 ZIP 均按一次成功分享计次。

## 结构

- `DeliveryManageView` 负责列表与收件页面切换。
- `DeliveryCodeList`、`DeliveryCodeEditor`、`DeliveryCodeShare`、`DeliveryBatchActions` 分别负责列表、创建/编辑、口令分享及批量操作。
- `useDeliveryAdmin` 协调查询，表单和批量状态分别位于 `useDeliveryCodeForm`、`useDeliveryBatch`。
- 收件使用原 `FileManageView`，后端按 `FileCodes.delivery_id` 限定范围；历史私有文件不展示公开取件入口。

## 凭证与上传

管理员与寄件客户端分离，寄件 401 不清除管理员会话。`useDelivery` 在令牌到期前刷新，每个分片请求也检查有效期；并发请求共用一次续期。后台计时器暂停导致令牌过期时，用页面内存里的原口令重新验证。页面销毁清除定时器和凭证，不持久化到本地存储。

`useSendFlow` 仅覆盖 `upload_size`、`allowed_file_types`、`expire_style`、`max_save_seconds` 和 `enable_chunk`；token、remaining 等授权字段不进入站点配置。

管理列表不携带口令，点击“查看 / 复制”时请求 `/admin/delivery/codes/{id}/secret`。编辑表单不自动读取旧口令，留空即不修改。后台耗尽寄件码保留并停用，删除采用软删除，收件关联继续有效。

## 接口与主题

依赖后端的验证、续期、管理接口和支持寄件凭证的普通上传接口，以及迁移 013/014。此目录只实现 2024 主题的寄件入口和后台管理；不修改 2023 主题代码、系统设置或 NAS 分享。公共页脚仅保留“凭码寄件”入口，`filecodebox-features=delivery` 标记供后端识别原生主题能力。

## 验证

已在带依赖的临时前端目录执行 `npm run check:architecture`、`npm run type-check`、`npm run build-only` 和 `node --test scripts/test-send-completion.mjs`，均通过。构建验证不依赖个人服务器、存储密钥或实际业务数据。

历史缺失原文的寄件码升级后停用，管理员在编辑界面设置新口令后再启用。前端不再提示通过访客验证恢复摘要对应的口令。

发送完成状态不等待自动复制结果，避免后台页面的剪贴板授权一直挂起时锁住发送按钮。可用 `node --test scripts/test-send-completion.mjs` 验证此回归。

为按真实文件大小控制寄件额度，非分片寄件统一使用原有代理上传模式，包括 S3；普通上传是否直传仍按主干规则处理。
