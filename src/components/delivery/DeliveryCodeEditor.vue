<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PlusIcon, PencilIcon } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { useDeliveryAdmin } from '@/composables'
import { toRefs, reactive } from 'vue'

// 页面状态由父层唯一创建，子组件只负责对应区域。
const props = defineProps<{ state: ReturnType<typeof useDeliveryAdmin> }>()
const { editing, minimumUploads, creating, showCreate, form, create } = toRefs(
  reactive(props.state)
)
const { t } = useI18n()
</script>

<template>
  <BaseModal
    :show="showCreate"
    :title="t(editing ? 'delivery.edit' : 'delivery.create')"
    size="lg"
    :closable="!creating"
    :close-on-backdrop="false"
    @close="showCreate = false"
  >
    <template #header>
      <div class="theme-text-strong flex items-center gap-3">
        <div class="theme-control rounded-lg p-2">
          <PencilIcon v-if="editing" class="h-5 w-5" /><PlusIcon v-else class="h-5 w-5" />
        </div>
        <h3 class="text-xl font-semibold">
          {{ t(editing ? 'delivery.edit' : 'delivery.create') }}
        </h3>
      </div>
    </template>
    <!-- 创建与编辑共用字段；未改口令不进入 PUT，兼容历史超长口令。 -->
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
        >{{ t(editing ? 'delivery.code' : 'delivery.customCode')
        }}<input
          v-model="form.code"
          minlength="8"
          :maxlength="editing && form.code === (editing.code || '') ? undefined : 32"
          :pattern="
            editing && form.code === (editing.code || '') ? undefined : '[A-Za-z0-9_-]{8,32}'
          "
          autocomplete="off"
          :placeholder="t(editing ? 'delivery.legacyCode' : 'delivery.autoCode')"
          class="delivery-input"
      /></label>
      <!-- 系统设置统一决定上传方式和保存目录，寄件码不再保存独立位置。 -->
      <p class="theme-text-muted text-xs leading-5 sm:col-span-2">
        {{ t('delivery.systemStorageHint') }}
      </p>
      <label class="delivery-label"
        >{{ t('delivery.expiresLocal')
        }}<input
          v-model="form.expires_at"
          required
          type="datetime-local"
          step="1"
          class="delivery-input"
      /></label>
      <label class="delivery-label sm:col-span-2"
        >{{ t('delivery.note')
        }}<textarea
          v-model="form.note"
          maxlength="2000"
          rows="3"
          class="delivery-input resize-y"
          :placeholder="t('delivery.notePlaceholder')"
        />
      </label>
      <label class="delivery-label sm:col-span-2"
        >{{ t('delivery.tags')
        }}<input
          v-model="form.tagsText"
          class="delivery-input"
          :placeholder="t('delivery.tagsPlaceholder')"
        /><span class="theme-text-muted mt-1 text-xs">{{ t('delivery.tagsHint') }}</span></label
      >
      <label class="delivery-label"
        >{{ t('delivery.maxUploads')
        }}<input
          v-model.number="form.max_uploads"
          required
          type="number"
          :min="minimumUploads"
          max="100000"
          step="1"
          class="delivery-input"
      /></label>
      <p class="theme-text-muted text-xs leading-5 sm:col-span-2">
        {{ t('delivery.editHint') }}
      </p>
    </form>
    <template #footer
      ><BaseButton variant="secondary" :disabled="creating" @click="showCreate = false">{{
        t('common.cancel')
      }}</BaseButton
      ><BaseButton type="submit" form="delivery-create-form" :loading="creating">{{
        t(editing ? 'common.save' : 'delivery.create')
      }}</BaseButton></template
    >
  </BaseModal>
</template>

<style scoped src="./delivery.css"></style>
