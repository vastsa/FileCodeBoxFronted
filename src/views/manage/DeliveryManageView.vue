<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  PlusIcon,
  RefreshCwIcon,
  InboxIcon,
  CopyIcon,
  ExternalLinkIcon,
  FileIcon
} from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import DeleteActionButton from '@/components/common/DeleteActionButton.vue'
import FileManageView from './FileManageView.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import DataTable from '@/components/common/DataTable.vue'
import DataPagination from '@/components/common/DataPagination.vue'
import { useDeliveryAdmin } from '@/composables'
import { formatFileSize } from '@/utils/common'

// 接入原 AdminLayout，不再维护第二套登录、导航或主题状态。
const { t } = useI18n()
const codeInput = ref<HTMLInputElement | null>(null)
// 每行保留展示文本引用，复制受限时直接选中原文，不再展示可编辑输入框。
const codeElements = new Map<number, HTMLElement>()
function registerCodeElement(id: number, element: unknown) {
  if (element instanceof HTMLElement) codeElements.set(id, element)
  else codeElements.delete(id)
}
const {
  codes,
  files,
  page,
  total,
  filePage,
  fileTotal,
  loading,
  filesLoading,
  creating,
  acting,
  showCreate,
  createdCode,
  copyMessage,
  showCreated,
  selected,
  pendingDelete,
  form,
  openCreate,
  refresh,
  loadFiles,
  viewFiles,
  closeFiles,
  create,
  toggle,
  confirmDelete,
  copy,
  copyListedCode,
  closeCreated,
  download
} = useDeliveryAdmin()
const receivedRefresh = ref(0)
// 两类记录分页独立；刷新时同时更新普通分享列表与历史/处理中收件。
function refreshReceived() {
  receivedRefresh.value++
  void loadFiles()
}
onMounted(refresh)
</script>

<template>
  <div class="delivery-management p-4 sm:p-6">
    <template v-if="!selected">
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="theme-text-strong text-2xl font-bold">{{ t('delivery.manage') }}</h2>
          <p class="theme-text-muted mt-1 text-sm">{{ t('delivery.manageSubtitle') }}</p>
        </div>
        <!-- 刷新沿用文件管理的文案和按钮，置于页面标题旁，不单独占用白色面板。 -->
        <BaseButton class="self-start sm:self-auto" variant="secondary" :loading="loading" @click="refresh">
          <template #icon><RefreshCwIcon class="mr-2 h-4 w-4" /></template>
          {{ t('fileManage.refresh') }}
        </BaseButton>
      </div>
      <DataTable
        class="delivery-code-table"
        :title="t('delivery.list')"
        :headers="[
          t('delivery.name'),
          t('delivery.code'),
          t('delivery.storage'),
          t('delivery.expires'),
          t('delivery.status'),
          t('delivery.usage'),
          t('delivery.actions')
        ]"
      >
        <!-- 两个寄件操作与列表标题同排，统一高度，窄屏允许自然换行。 -->
        <template #actions>
          <RouterLink
            to="/delivery"
            class="theme-control inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3 text-sm font-medium"
          >
            <ExternalLinkIcon class="h-4 w-4" />{{ t('delivery.title') }}
          </RouterLink>
          <BaseButton size="sm" class="h-9 whitespace-nowrap" @click="openCreate">
            <template #icon><PlusIcon class="mr-2 h-4 w-4" /></template>
            {{ t('delivery.create') }}
          </BaseButton>
        </template>
        <template #body>
          <tr v-if="!codes.length">
            <td colspan="7" class="px-6 py-14 text-center">
              <InboxIcon class="theme-text-muted mx-auto mb-3 h-8 w-8" />
              <p class="theme-text-strong font-medium">
                {{ t(loading ? 'common.loading' : 'delivery.empty') }}
              </p>
              <p v-if="!loading" class="theme-text-muted mt-1 text-sm">
                {{ t('delivery.emptyHint') }}
              </p>
            </td>
          </tr>
          <tr v-for="item in codes" :key="item.id">
            <td>
              <span class="theme-text-strong font-medium">{{ item.name }}</span
              ><span class="theme-text-muted mt-1 block text-xs">#{{ item.id }}</span>
            </td>
            <td>
              <div v-if="item.code" class="flex items-center gap-2">
                <code
                  :ref="(el) => registerCodeElement(item.id, el)"
                  :aria-label="`${t('delivery.code')} #${item.id}`"
                  tabindex="0"
                  class="theme-text-strong max-w-64 select-all break-all font-mono text-sm font-semibold tracking-wide"
                  >{{ item.code }}</code
                >
                <BaseButton
                  size="sm"
                  variant="outline"
                  :aria-label="`${t('delivery.copy')} #${item.id}`"
                  @click="copyListedCode(item, codeElements.get(item.id) || null)"
                  ><CopyIcon class="h-4 w-4"
                /></BaseButton>
              </div>
              <span
                v-else
                class="theme-text-muted block max-w-48 text-xs leading-5"
                :title="t('delivery.legacyCodeHint')"
                >{{ t('delivery.legacyCode') }}</span
              >
            </td>
            <td>
              <span class="uppercase">{{ item.storage_type }}</span
              ><span class="theme-text-muted mt-1 block max-w-48 break-all text-xs">{{
                item.target_path
              }}</span>
            </td>
            <td class="whitespace-nowrap">{{ new Date(item.expires_at).toLocaleString() }}</td>
            <td>
              <span
                class="inline-block whitespace-nowrap rounded-lg px-2 py-1 text-xs"
                :class="
                  item.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'theme-control'
                "
                >{{ t(`delivery.states.${item.status}`) }}</span
              >
            </td>
            <td class="whitespace-nowrap tabular-nums">
              {{ item.used_count }} / {{ item.reserved_count }} / {{ item.max_uploads }}
            </td>
            <td>
              <div class="flex flex-wrap gap-2">
                <BaseButton size="sm" variant="outline" @click="viewFiles(item)">{{
                  t('delivery.viewFiles')
                }}</BaseButton>
                <BaseButton
                  size="sm"
                  variant="outline"
                  :disabled="acting"
                  @click="toggle(item)"
                  >{{ t(item.enabled ? 'delivery.disable' : 'delivery.enable') }}</BaseButton
                >
                <DeleteActionButton
                  :disabled="acting"
                  @click="pendingDelete = { kind: 'code', id: item.id, name: item.name }"
                />
              </div>
            </td>
          </tr>
        </template>
        <template #footer
          ><DataPagination
            v-if="total > 0"
            :current-page="page"
            :page-size="20"
            :total="total"
            @page-change="page = $event"
        /></template>
      </DataTable>
    </template>

    <BaseModal
      :show="showCreate"
      :title="t('delivery.create')"
      size="lg"
      :closable="!creating"
      :close-on-backdrop="false"
      @close="showCreate = false"
    >
      <form id="delivery-create-form" class="grid gap-4 sm:grid-cols-2" @submit.prevent="create">
        <label class="delivery-label"
          >{{ t('delivery.name')
          }}<input
            v-model="form.name"
            required
            maxlength="100"
            :placeholder="t('delivery.namePlaceholder')"
            class="delivery-input"
        /></label>
        <label class="delivery-label"
          >{{ t('delivery.customCode')
          }}<input
            v-model="form.code"
            minlength="8"
            maxlength="64"
            pattern="[A-Za-z0-9_-]{8,64}"
            autocomplete="off"
            :placeholder="t('delivery.autoCode')"
            class="delivery-input"
        /></label>
        <label class="delivery-label"
          >{{ t('delivery.storage')
          }}<select v-model="form.storage_type" class="delivery-input">
            <option value="local">{{ t('delivery.local') }}</option>
            <option value="webdav">WebDAV</option>
            <option value="s3">S3</option>
            <option value="onedrive">OneDrive</option>
            <option value="opendal">OpenDAL</option>
          </select></label
        >
        <label class="delivery-label"
          >{{ t('delivery.target')
          }}<input
            v-model="form.target_path"
            required
            maxlength="200"
            :placeholder="t('delivery.targetPlaceholder')"
            class="delivery-input"
        /></label>
        <label class="delivery-label"
          >{{ t('delivery.expiresLocal')
          }}<input v-model="form.expires_at" required type="datetime-local" class="delivery-input"
        /></label>
        <label class="delivery-label"
          >{{ t('delivery.maxUploads')
          }}<input
            v-model.number="form.max_uploads"
            required
            type="number"
            min="1"
            max="100000"
            step="1"
            class="delivery-input"
        /></label>
        <p class="theme-text-muted text-xs leading-5 sm:col-span-2">
          {{ t('delivery.configHint') }}
        </p>
      </form>
      <template #footer
        ><BaseButton variant="secondary" :disabled="creating" @click="showCreate = false">{{
          t('common.cancel')
        }}</BaseButton
        ><BaseButton type="submit" form="delivery-create-form" :loading="creating">{{
          t('delivery.create')
        }}</BaseButton></template
      >
    </BaseModal>

    <BaseModal
      :show="showCreated"
      :title="t('delivery.created')"
      :close-on-backdrop="false"
      @close="closeCreated"
    >
      <p class="theme-text-muted mb-5 text-sm leading-6">{{ t('delivery.saveCode') }}</p>
      <label class="delivery-label"
        >{{ t('delivery.code')
        }}<input
          ref="codeInput"
          :value="createdCode"
          readonly
          class="delivery-input !py-4 text-center font-mono !text-lg tracking-wide"
          @click="codeInput?.select()"
      /></label>
      <p v-if="copyMessage" role="status" class="theme-text-muted mt-3 text-sm">
        {{ copyMessage }}
      </p>
      <template #footer
        ><BaseButton variant="secondary" @click="closeCreated">{{ t('common.close') }}</BaseButton
        ><BaseButton @click="copy(codeInput)"
          ><template #icon><CopyIcon class="mr-2 h-4 w-4" /></template
          >{{ t('delivery.copy') }}</BaseButton
        ></template
      >
    </BaseModal>

    <section v-if="selected">
      <div class="mb-5 flex items-center justify-between gap-3">
        <h2 class="theme-text-strong text-xl font-bold">
          {{ selected.name }} · {{ t('delivery.received') }}
        </h2>
        <BaseButton variant="secondary" @click="closeFiles">{{
          t('delivery.backToCodes')
        }}</BaseButton>
      </div>
      <div class="mb-4 flex items-center justify-between gap-3">
        <p class="theme-text-muted text-xs leading-5">{{ t('delivery.retained') }}</p>
        <BaseButton variant="outline" size="sm" :loading="filesLoading" @click="refreshReceived">{{
          t('delivery.refresh')
        }}</BaseButton>
      </div>
      <FileManageView
        :key="selected.id"
        embedded
        :delivery-id="selected.id"
        :refresh-key="receivedRefresh"
      />
      <!-- 不把旧私有或未完成收件伪造成普通文件；这些记录继续使用原有受限操作。 -->
      <div v-if="fileTotal > 0 || filesLoading" class="mt-6 overflow-x-auto">
        <h3 class="theme-text-strong mb-3 font-semibold">{{ t('delivery.otherReceipts') }}</h3>
        <table class="delivery-legacy-table w-full text-sm">
          <thead class="theme-text-muted text-left text-xs">
            <tr>
              <th>{{ t('delivery.filename') }}</th>
              <th>{{ t('delivery.size') }}</th>
              <th>{{ t('delivery.retrievalCode') }}</th>
              <th>{{ t('delivery.status') }}</th>
              <th>{{ t('delivery.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!files.length">
              <td colspan="5" class="!py-10 text-center theme-text-muted">
                {{ t(filesLoading ? 'common.loading' : 'delivery.noFiles') }}
              </td>
            </tr>
            <tr v-for="file in files" :key="file.id" class="theme-divider border-t">
              <td>
                <div class="flex gap-2">
                  <FileIcon class="mt-0.5 h-4 w-4 shrink-0" /><span class="max-w-64 break-all"
                    >{{ file.filename || t('delivery.states.pending')
                    }}<span class="theme-text-muted mt-1 block text-xs">{{
                      new Date(file.created_at).toLocaleString()
                    }}</span></span
                  >
                </div>
              </td>
              <td class="whitespace-nowrap">{{ formatFileSize(file.size) }}</td>
              <td>
                <code v-if="file.retrieval_code" class="select-all font-mono tracking-wider">{{
                  file.retrieval_code
                }}</code
                ><span v-else class="theme-text-muted text-xs">{{
                  file.status === 'stored' ? t('delivery.privateLegacy') : '—'
                }}</span>
              </td>
              <td class="whitespace-nowrap">{{ t(`delivery.states.${file.status}`) }}</td>
              <td>
                <div class="flex gap-2">
                  <BaseButton
                    v-if="['stored', 'shared'].includes(file.status)"
                    variant="outline"
                    size="sm"
                    :disabled="acting"
                    @click="download(file)"
                    >{{ t('delivery.download') }}</BaseButton
                  ><DeleteActionButton
                    v-if="!['pending', 'finalizing'].includes(file.status)"
                    :disabled="acting"
                    @click="pendingDelete = { kind: 'file', id: file.id, name: file.filename }"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <DataPagination
        v-if="fileTotal > 0"
        :current-page="filePage"
        :page-size="20"
        :total="fileTotal"
        @page-change="filePage = $event"
      />
    </section>

    <BaseModal
      :show="!!pendingDelete"
      :title="t(pendingDelete?.kind === 'code' ? 'delivery.deleteCode' : 'delivery.removeFile')"
      :closable="!acting"
      :close-on-backdrop="false"
      @close="pendingDelete = null"
    >
      <p class="theme-text-strong mb-3 break-all font-medium">{{ pendingDelete?.name }}</p>
      <p class="theme-text-muted text-sm">
        {{ t(pendingDelete?.kind === 'code' ? 'delivery.confirmCode' : 'delivery.confirmFile') }}
      </p>
      <template #footer
        ><BaseButton variant="secondary" :disabled="acting" @click="pendingDelete = null">{{
          t('common.cancel')
        }}</BaseButton
        ><BaseButton variant="danger" :loading="acting" @click="confirmDelete">{{
          t('common.delete')
        }}</BaseButton></template
      >
    </BaseModal>
  </div>
</template>

<style scoped>
/* 与上游 theme-control 使用相同变量，弹窗被 Teleport 后也能继承全局主题。 */
.delivery-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--color-text-muted));
}
.delivery-input {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.75rem;
  padding: 0.65rem 0.85rem;
  font-size: 0.875rem;
  color: rgb(var(--color-text-strong));
  background: rgb(var(--color-surface-input) / 0.8);
  outline: none;
}
.delivery-input:focus {
  border-color: rgb(var(--color-focus-ring));
  box-shadow: 0 0 0 3px rgb(var(--color-focus-ring) / 0.15);
}
/* 寄件码/历史收件的局部样式不能覆盖嵌入的原文件管理表格。 */
:deep(.delivery-code-table td),
:deep(.delivery-code-table th),
.delivery-legacy-table td,
.delivery-legacy-table th {
  padding: 1rem;
  vertical-align: top;
  font-size: 0.875rem;
}
@media (max-width: 640px) {
  :deep(.delivery-code-table td),
  :deep(.delivery-code-table th),
  .delivery-legacy-table td,
  .delivery-legacy-table th {
    padding: 0.75rem;
  }
  :deep(.delivery-code-table .mt-4.flex.items-center.justify-between) {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.75rem;
  }
}
</style>
