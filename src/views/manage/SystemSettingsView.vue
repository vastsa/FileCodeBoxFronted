<script setup lang="ts">
import { inject, nextTick, onMounted, unref, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  InfoIcon,
  RefreshCwIcon,
  SaveIcon,
  ShieldAlertIcon
} from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import SettingNumberInput from '@/components/common/SettingNumberInput.vue'
import SettingSwitch from '@/components/common/SettingSwitch.vue'
import { useSystemConfig } from '@/composables'
import type { ConfigDiagnosticItem, ConfigDiagnosticSeverity } from '@/types'

const isDarkMode = inject('isDarkMode')
const { t } = useI18n()
const {
  config,
  isRefreshing,
  isSaving,
  isDiagnosticsRefreshing,
  isDirty,
  configDiagnosticItems,
  configDiagnosticSummary,
  fileSize,
  sizeUnit,
  saveTime,
  saveTimeUnit,
  refreshConfig,
  refreshDiagnostics,
  submitConfig,
  toggleConfigFlag
} = useSystemConfig()

const diagnosticSeverities: ConfigDiagnosticSeverity[] = ['danger', 'warning', 'success', 'neutral']

const normalizeDiagnosticSeverity = (severity: string): ConfigDiagnosticSeverity =>
  diagnosticSeverities.includes(severity as ConfigDiagnosticSeverity)
    ? (severity as ConfigDiagnosticSeverity)
    : 'neutral'

const isDark = () => Boolean(unref(isDarkMode))

const getDiagnosticTitle = (item: ConfigDiagnosticItem) =>
  t(`manage.settings.diagnosticsItems.${item.key}.title`, {
    count: item.count ?? 0
  })

const getDiagnosticDescription = (item: ConfigDiagnosticItem) =>
  t(`manage.settings.diagnosticsItems.${item.key}.description`, {
    count: item.count ?? 0
  })

const getDiagnosticSeverityLabel = (severity: string) =>
  t(`manage.settings.diagnosticSeverity.${normalizeDiagnosticSeverity(severity)}`)

const getDiagnosticIcon = (severity: string): Component => {
  const normalizedSeverity = normalizeDiagnosticSeverity(severity)
  if (normalizedSeverity === 'danger') {
    return ShieldAlertIcon
  }
  if (normalizedSeverity === 'warning') {
    return AlertTriangleIcon
  }
  if (normalizedSeverity === 'success') {
    return CheckCircleIcon
  }
  return InfoIcon
}

const getDiagnosticClass = (severity: string) => {
  const normalizedSeverity = normalizeDiagnosticSeverity(severity)
  const darkMode = isDark()

  if (normalizedSeverity === 'danger') {
    return darkMode
      ? 'border-red-500/40 bg-red-500/10 hover:border-red-400'
      : 'border-red-200 bg-red-50 hover:border-red-300'
  }
  if (normalizedSeverity === 'warning') {
    return darkMode
      ? 'border-amber-500/40 bg-amber-500/10 hover:border-amber-400'
      : 'border-amber-200 bg-amber-50 hover:border-amber-300'
  }
  if (normalizedSeverity === 'success') {
    return darkMode
      ? 'border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-400'
      : 'border-emerald-200 bg-emerald-50 hover:border-emerald-300'
  }
  return darkMode
    ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
}

const getDiagnosticIconClass = (severity: string) => {
  const normalizedSeverity = normalizeDiagnosticSeverity(severity)
  if (normalizedSeverity === 'danger') {
    return 'bg-red-100 text-red-600'
  }
  if (normalizedSeverity === 'warning') {
    return 'bg-amber-100 text-amber-600'
  }
  if (normalizedSeverity === 'success') {
    return 'bg-emerald-100 text-emerald-600'
  }
  return 'bg-gray-100 text-gray-600'
}

const getDiagnosticTargetField = (item: ConfigDiagnosticItem) => {
  const field =
    item.targetField ??
    item.target_field ??
    item.field ??
    item.fields?.[0] ??
    item.action?.field ??
    item.action?.fields?.[0]
  return field ? String(field) : ''
}

const findConfigFieldElement = (field: string) =>
  document.querySelector<HTMLElement>(`[data-config-field="${field}"]`)

const focusDiagnosticField = async (item: ConfigDiagnosticItem) => {
  const targetField = getDiagnosticTargetField(item)
  if (!targetField) {
    return
  }

  await nextTick()

  const fieldElement =
    findConfigFieldElement(targetField) ??
    (targetField === 'enableChunk' ? findConfigFieldElement('file_storage') : null)

  if (!fieldElement) {
    return
  }

  fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' })

  window.setTimeout(() => {
    const focusable = fieldElement.matches('input, select, textarea, button')
      ? fieldElement
      : fieldElement.querySelector<HTMLElement>('input, select, textarea, button')
    focusable?.focus({ preventScroll: true })
  }, 260)
}

onMounted(() => {
  void refreshConfig()
})
</script>

<template>
  <div class="p-6 h-screen overflow-y-auto custom-scrollbar">
    <div
      class="sticky top-0 z-20 -mx-6 -mt-6 mb-6 border-b px-6 py-4 backdrop-blur"
      :class="[isDarkMode ? 'border-gray-700 bg-gray-900/85' : 'border-gray-200 bg-gray-50/90']"
    >
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-2xl font-bold" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
            {{ t('admin.settings.title') }}
          </h2>
          <p
            class="mt-1 text-sm"
            :class="[isDirty ? 'text-amber-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500']"
          >
            {{
              isDirty ? t('manage.settings.unsavedChanges') : t('manage.settings.allChangesSaved')
            }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <BaseButton
            variant="secondary"
            :loading="isRefreshing"
            :disabled="isSaving || isDirty"
            :title="
              isDirty ? t('manage.settings.refreshBlocked') : t('manage.settings.refreshConfig')
            "
            @click="refreshConfig"
          >
            <template #icon>
              <RefreshCwIcon class="mr-2 h-4 w-4" />
            </template>
            {{
              isRefreshing ? t('manage.settings.refreshing') : t('manage.settings.refreshConfig')
            }}
          </BaseButton>

          <BaseButton
            :loading="isSaving"
            :disabled="!isDirty || isRefreshing"
            @click="submitConfig"
          >
            <template #icon>
              <SaveIcon class="mr-2 h-4 w-4" />
            </template>
            {{ isSaving ? t('manage.settings.saving') : t('manage.settings.saveChanges') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <section
      class="mb-6 space-y-4 border-b pb-6"
      :class="[isDarkMode ? 'border-gray-700' : 'border-gray-200']"
    >
      <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div class="max-w-3xl">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-md"
              :class="[
                isDarkMode ? 'bg-indigo-500/15 text-indigo-300' : 'bg-indigo-50 text-indigo-600'
              ]"
            >
              <ShieldAlertIcon class="h-5 w-5" />
            </div>
            <div>
              <h3
                class="text-lg font-semibold"
                :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
              >
                {{ t('manage.settings.diagnosticsTitle') }}
              </h3>
              <p class="mt-1 text-sm" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">
                {{ t('manage.settings.diagnosticsDesc') }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div
            class="min-w-24 rounded-md border px-3 py-2"
            :class="[isDarkMode ? 'border-gray-700 bg-gray-800/70' : 'border-gray-200 bg-white']"
          >
            <p class="text-xs" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']">
              {{ t('manage.settings.diagnosticsTotal') }}
            </p>
            <p
              class="mt-1 text-xl font-semibold"
              :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
            >
              {{ configDiagnosticSummary.total }}
            </p>
          </div>
          <div
            class="min-w-24 rounded-md border px-3 py-2"
            :class="[isDarkMode ? 'border-red-500/30 bg-red-500/10' : 'border-red-200 bg-red-50']"
          >
            <p class="text-xs" :class="[isDarkMode ? 'text-red-200' : 'text-red-600']">
              {{ t('manage.settings.diagnosticsDanger') }}
            </p>
            <p
              class="mt-1 text-xl font-semibold"
              :class="[isDarkMode ? 'text-red-100' : 'text-red-700']"
            >
              {{ configDiagnosticSummary.dangerCount }}
            </p>
          </div>
          <div
            class="min-w-24 rounded-md border px-3 py-2"
            :class="[
              isDarkMode ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-200 bg-amber-50'
            ]"
          >
            <p class="text-xs" :class="[isDarkMode ? 'text-amber-200' : 'text-amber-600']">
              {{ t('manage.settings.diagnosticsWarning') }}
            </p>
            <p
              class="mt-1 text-xl font-semibold"
              :class="[isDarkMode ? 'text-amber-100' : 'text-amber-700']"
            >
              {{ configDiagnosticSummary.warningCount }}
            </p>
          </div>

          <BaseButton
            variant="outline"
            :loading="isDiagnosticsRefreshing"
            :disabled="isRefreshing || isSaving"
            @click="() => void refreshDiagnostics()"
          >
            <template #icon>
              <RefreshCwIcon class="mr-2 h-4 w-4" />
            </template>
            {{ t('manage.settings.diagnosticsRefresh') }}
          </BaseButton>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <button
          v-for="item in configDiagnosticItems"
          :key="item.key"
          type="button"
          class="group flex h-full items-start gap-3 rounded-md border p-4 text-left transition"
          :class="getDiagnosticClass(item.severity)"
          @click="focusDiagnosticField(item)"
        >
          <span
            class="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md"
            :class="getDiagnosticIconClass(item.severity)"
          >
            <component :is="getDiagnosticIcon(item.severity)" class="h-4 w-4" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="flex flex-wrap items-center gap-2">
              <span
                class="text-sm font-semibold"
                :class="[isDarkMode ? 'text-white' : 'text-gray-900']"
              >
                {{ getDiagnosticTitle(item) }}
              </span>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="[isDarkMode ? 'bg-gray-900/70 text-gray-300' : 'bg-white/80 text-gray-600']"
              >
                {{ getDiagnosticSeverityLabel(item.severity) }}
              </span>
            </span>
            <span
              class="mt-1 block text-sm leading-6"
              :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']"
            >
              {{ getDiagnosticDescription(item) }}
            </span>
          </span>
          <span
            class="mt-1 inline-flex items-center gap-1 text-xs font-medium"
            :class="[isDarkMode ? 'text-indigo-300' : 'text-indigo-600']"
          >
            {{ t('manage.settings.diagnosticsFocusAction') }}
            <ArrowRightIcon class="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </button>
      </div>
    </section>

    <div
      class="space-y-6 rounded-lg shadow-md p-6"
      :class="[isDarkMode ? 'bg-gray-800 bg-opacity-70' : 'bg-white']"
    >
      <!-- 基本设置 -->
      <section class="space-y-4">
        <h3 class="text-lg font-medium mb-4" :class="[isDarkMode ? 'text-white' : 'text-gray-800']">
          {{ t('admin.settings.basicSettings') }}
        </h3>

        <!-- 网基本信息 -->
        <div class="grid grid-cols-1 gap-6">
          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
            >
              {{ t('admin.settings.siteName') }}
            </label>
            <input
              type="text"
              v-model="config.name"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
              ]"
            />
          </div>

          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
            >
              {{ t('admin.settings.websiteDescription') }}
            </label>
            <input
              type="text"
              v-model="config.description"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
              ]"
            />
          </div>

          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
            >
              {{ t('admin.settings.adminPassword') }}
            </label>
            <div class="relative">
              <input
                type="password"
                minlength="6"
                v-model="config.admin_token"
                data-config-field="admin_token"
                :placeholder="t('admin.settings.passwordPlaceholder')"
                class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                :class="[
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                ]"
              />
              <div
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-400"
                :class="[isDarkMode ? 'text-gray-500' : 'text-gray-400']"
              >
                <span class="text-xs">{{ t('admin.settings.passwordNote') }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
            >
              {{ t('admin.settings.keywords') }}
            </label>
            <input
              type="text"
              v-model="config.keywords"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
              ]"
            />
          </div>

          <!-- 主题选择 -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
            >
              {{ t('manage.settings.themeSelection') }}
            </label>
            <select
              v-model="config.themesSelect"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400'
              ]"
              style="
                background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%208l3%203%203-3%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E');
              "
            >
              <option v-for="item in config.themesChoices" :value="item.key" :key="item.key">
                {{ item.name }} (by {{ item.author }} V{{ item.version }})
              </option>
            </select>
          </div>
          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
            >
              {{ t('manage.settings.robotsFile') }}
            </label>
            <textarea
              v-model="config.robotsText"
              rows="3"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
              ]"
            ></textarea>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="grid grid-cols-1 gap-6 mt-8">
          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
            >
              {{ t('manage.settings.notificationTitle') }}
            </label>
            <input
              type="text"
              v-model="config.notify_title"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
              ]"
            />
          </div>

          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
            >
              {{ t('manage.settings.notificationContent') }}
            </label>
            <textarea
              v-model="config.notify_content"
              rows="3"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
              ]"
            ></textarea>
          </div>
        </div>

        <!-- 存储设置 -->
        <div class="space-y-4">
          <h3
            class="text-lg font-medium mb-4"
            :class="[isDarkMode ? 'text-white' : 'text-gray-800']"
          >
            {{ t('manage.settings.storageSettings') }}
          </h3>
          <!-- 通知设置 -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
            >
              {{ t('manage.settings.storagePath') }}
            </label>
            <input
              type="text"
              :placeholder="t('manage.settings.storagePathPlaceholder')"
              v-model="config.storage_path"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="[
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                  : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
              ]"
            />
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label
                class="block text-sm font-medium"
                :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
              >
                {{ t('manage.settings.storageMethod') }}
              </label>
              <select
                v-model="config.file_storage"
                data-config-field="file_storage"
                class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                :class="[
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                    : 'border-gray-300 hover:border-gray-400'
                ]"
                style="
                  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%208l3%203%203-3%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E');
                "
              >
                <option value="local">{{ t('manage.settings.localStorage') }}</option>
                <option value="s3">{{ t('manage.settings.s3Storage') }}</option>
                <option value="webdav">{{ t('manage.settings.webdavStorage') }}</option>
              </select>
            </div>
            <SettingSwitch
              v-if="config.file_storage === 'local'"
              data-config-field="enableChunk"
              :label="t('manage.settings.chunkUploadNote')"
              :model-value="config.enableChunk"
              :enabled-text="t('common.enabled')"
              :disabled-text="t('common.disabled')"
              @toggle="toggleConfigFlag('enableChunk')"
            />
            <div v-if="config.file_storage === 'webdav'" class="space-y-4">
              <!-- 通知设置 -->
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium"
                  :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
                >
                  Webdav URL
                </label>
                <input
                  type="text"
                  :placeholder="t('manage.settings.webdavUrlPlaceholder')"
                  v-model="config.webdav_url"
                  data-config-field="webdav_url"
                  class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                  ]"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
                  >
                    Webdav Username
                  </label>
                  <input
                    type="text"
                    :placeholder="t('manage.settings.webdavUsernamePlaceholder')"
                    v-model="config.webdav_username"
                    data-config-field="webdav_username"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
                  >
                    Webdav Password
                  </label>
                  <input
                    type="password"
                    :placeholder="t('manage.settings.webdavPasswordPlaceholder')"
                    v-model="config.webdav_password"
                    data-config-field="webdav_password"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]"
                  />
                </div>
              </div>
            </div>
            <!-- S3 配置 -->
            <div v-if="config.file_storage === 's3'" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
                  >
                    {{ t('manage.settings.s3AccessKeyId') }}
                  </label>
                  <input
                    type="text"
                    v-model="config.s3_access_key_id"
                    data-config-field="s3_access_key_id"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
                  >
                    {{ t('manage.settings.s3SecretAccessKey') }}
                  </label>
                  <input
                    type="password"
                    v-model="config.s3_secret_access_key"
                    data-config-field="s3_secret_access_key"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
                  >
                    {{ t('manage.settings.s3BucketName') }}
                  </label>
                  <input
                    type="text"
                    v-model="config.s3_bucket_name"
                    data-config-field="s3_bucket_name"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
                  >
                    {{ t('manage.settings.s3EndpointUrl') }}
                  </label>
                  <input
                    type="text"
                    v-model="config.s3_endpoint_url"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
                  >
                    {{ t('manage.settings.s3RegionName') }}
                  </label>
                  <input
                    type="text"
                    v-model="config.s3_region_name"
                    :placeholder="t('manage.settings.autoPlaceholder')"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
                  >
                    {{ t('manage.settings.s3SignatureVersion') }}
                  </label>
                  <select
                    v-model="config.s3_signature_version"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                    ]"
                  >
                    <option value="s3v2">{{ t('manage.settings.s3v2') }}</option>
                    <option value="s3v4">{{ t('manage.settings.s3v4') }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
                  >
                    {{ t('manage.settings.s3Hostname') }}
                  </label>
                  <input
                    type="text"
                    v-model="config.s3_hostname"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                    ]"
                  />
                </div>

                <SettingSwitch
                  :label="t('manage.settings.enableProxy')"
                  :model-value="config.s3_proxy"
                  :enabled-text="t('common.enabled')"
                  :disabled-text="t('common.disabled')"
                  @toggle="toggleConfigFlag('s3_proxy')"
                />

                <SettingSwitch
                  data-config-field="enableChunk"
                  :label="t('manage.settings.chunkUploadNote')"
                  :model-value="config.enableChunk"
                  :enabled-text="t('common.enabled')"
                  :disabled-text="t('common.disabled')"
                  @toggle="toggleConfigFlag('enableChunk')"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 上传限制 -->
        <div class="mt-8">
          <h3
            class="text-lg font-medium mb-4"
            :class="[isDarkMode ? 'text-white' : 'text-gray-800']"
          >
            {{ t('manage.settings.uploadLimits') }}
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingNumberInput
              v-model="config.uploadMinute"
              data-config-field="uploadMinute"
              :label="t('manage.settings.uploadPerMinute')"
              :suffix="t('common.minute')"
            />

            <SettingNumberInput
              v-model="config.uploadCount"
              data-config-field="uploadCount"
              :label="t('manage.settings.uploadCountLimit')"
              :suffix="t('common.files')"
            />

            <div class="space-y-2">
              <label
                class="block text-sm font-medium"
                :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
              >
                {{ t('manage.settings.fileSizeLimit') }}
              </label>
              <div class="flex items-center space-x-2">
                <input
                  type="number"
                  v-model="fileSize"
                  class="w-24 rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                  ]"
                />
                <select
                  v-model="sizeUnit"
                  class="rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                  ]"
                >
                  <option value="KB">{{ t('manage.settings.fileSizeUnits.kb') }}</option>
                  <option value="MB">{{ t('manage.settings.fileSizeUnits.mb') }}</option>
                  <option value="GB">{{ t('manage.settings.fileSizeUnits.gb') }}</option>
                </select>
              </div>
            </div>

            <div class="space-y-2" data-config-field="expireStyle">
              <label
                class="block text-sm font-medium mb-2"
                :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
              >
                {{ t('manage.settings.expirationType') }}
              </label>
              <div class="flex flex-wrap gap-3">
                <label
                  v-for="style in ['day', 'hour', 'minute', 'forever', 'count']"
                  :key="style"
                  class="relative inline-flex items-center group cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="style"
                    v-model="config.expireStyle"
                    class="peer sr-only"
                  />
                  <div
                    class="px-4 py-2 rounded-full border-2 transition-all duration-200 select-none"
                    :class="[
                      config.expireStyle.includes(style)
                        ? isDarkMode
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-indigo-600 border-indigo-600 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:border-indigo-500'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-500'
                    ]"
                  >
                    {{ t(`manage.settings.expiration.${style}`) }}
                  </div>
                </label>
              </div>
            </div>

            <div class="space-y-2" data-config-field="max_save_seconds">
              <label
                class="block text-sm font-medium"
                :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']"
              >
                {{ t('manage.settings.maxSaveTime') }}
              </label>
              <div class="flex items-center space-x-2">
                <input
                  type="number"
                  v-model="saveTime"
                  class="w-24 rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400 placeholder-gray-500'
                  ]"
                />
                <select
                  v-model="saveTimeUnit"
                  class="rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                  ]"
                >
                  <option value="秒">{{ t('common.second') }}</option>
                  <option value="分">{{ t('common.minute') }}</option>
                  <option value="时">{{ t('common.hour') }}</option>
                  <option value="天">{{ t('common.day') }}</option>
                </select>
              </div>
            </div>

            <SettingSwitch
              :label="t('manage.settings.guestUpload')"
              :model-value="config.openUpload"
              :enabled-text="t('common.enabled')"
              :disabled-text="t('common.disabled')"
              @toggle="toggleConfigFlag('openUpload')"
            />
          </div>
        </div>

        <!-- 错误限制 -->
        <div class="mt-8">
          <h3
            class="text-lg font-medium mb-4"
            :class="[isDarkMode ? 'text-white' : 'text-gray-800']"
          >
            {{ t('manage.settings.errorLimits') }}
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingNumberInput
              v-model="config.errorMinute"
              data-config-field="errorMinute"
              :label="t('manage.settings.errorPerMinute')"
              :suffix="t('common.minute')"
            />

            <SettingNumberInput
              v-model="config.errorCount"
              data-config-field="errorCount"
              :label="t('manage.settings.errorCountLimit')"
              :suffix="t('common.times')"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<style scoped></style>
