<script setup lang="ts">
import { inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RefreshCwIcon, SaveIcon } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import SettingNumberInput from '@/components/common/SettingNumberInput.vue'
import SettingSwitch from '@/components/common/SettingSwitch.vue'
import { useSystemConfig } from '@/composables'

const isDarkMode = inject('isDarkMode')
const { t } = useI18n()
const {
  config,
  isRefreshing,
  isSaving,
  isDirty,
  fileSize,
  sizeUnit,
  saveTime,
  saveTimeUnit,
  refreshConfig,
  submitConfig,
  toggleConfigFlag
} = useSystemConfig()

const updateAllowedFileTypes = (event: Event) => {
  const target = event.target as HTMLInputElement
  config.value.allowed_file_types = target.value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

onMounted(() => {
  void refreshConfig()
})
</script>

<template>
  <div class="p-6">
    <div
      class="sticky top-0 z-20 -mx-6 -mt-6 mb-6 border-b px-6 py-4 backdrop-blur"
      :class="[isDarkMode ? 'border-white/10 bg-[#101012]/85' : 'border-white/80 bg-white/70']"
    >
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-2xl font-bold" :class="[isDarkMode ? 'text-white' : 'text-zinc-800']">
            {{ t('admin.settings.title') }}
          </h2>
          <p
            class="mt-1 text-sm"
            :class="[isDirty ? 'text-amber-500' : isDarkMode ? 'text-zinc-400' : 'text-zinc-500']"
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

    <div
      class="space-y-6 rounded-2xl border p-6 shadow-sm backdrop-blur-xl"
      :class="[isDarkMode ? 'border-white/10 bg-white/[0.06]' : 'border-white/80 bg-white/70']"
    >
      <!-- 基本设置 -->
      <section class="space-y-4">
        <h3 class="text-lg font-medium mb-4" :class="[isDarkMode ? 'text-white' : 'text-zinc-800']">
          {{ t('admin.settings.basicSettings') }}
        </h3>

        <!-- 网基本信息 -->
        <div class="grid grid-cols-1 gap-6">
          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
            >
              {{ t('admin.settings.siteName') }}
            </label>
            <input
              type="text"
              v-model="config.name"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
              :class="[
                isDarkMode
                  ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                  : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
              ]"
            />
          </div>

          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
            >
              {{ t('admin.settings.websiteDescription') }}
            </label>
            <input
              type="text"
              v-model="config.description"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
              :class="[
                isDarkMode
                  ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                  : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
              ]"
            />
          </div>

          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
            >
              {{ t('admin.settings.adminPassword') }}
            </label>
            <div class="relative">
              <input
                type="password"
                minlength="6"
                v-model="config.admin_token"
                :placeholder="t('admin.settings.passwordPlaceholder')"
                class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                :class="[
                  isDarkMode
                    ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                    : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
                ]"
              />
              <div
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-zinc-400"
                :class="[isDarkMode ? 'text-zinc-500' : 'text-zinc-400']"
              >
                <span class="text-xs">{{ t('admin.settings.passwordNote') }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
            >
              {{ t('admin.settings.keywords') }}
            </label>
            <input
              type="text"
              v-model="config.keywords"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
              :class="[
                isDarkMode
                  ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                  : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
              ]"
            />
          </div>

          <!-- 主题选择 -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
            >
              {{ t('manage.settings.themeSelection') }}
            </label>
            <select
              v-model="config.themesSelect"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none cursor-pointer"
              :class="[
                isDarkMode
                  ? 'border-white/10 bg-zinc-950/45 text-white hover:border-white/20'
                  : 'border-zinc-200/80 bg-white/80 text-zinc-950 hover:border-zinc-300'
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
              :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
            >
              {{ t('manage.settings.robotsFile') }}
            </label>
            <textarea
              v-model="config.robotsText"
              rows="3"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border resize-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
              :class="[
                isDarkMode
                  ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                  : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
              ]"
            ></textarea>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="grid grid-cols-1 gap-6 mt-8">
          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
            >
              {{ t('manage.settings.notificationTitle') }}
            </label>
            <input
              type="text"
              v-model="config.notify_title"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
              :class="[
                isDarkMode
                  ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                  : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
              ]"
            />
          </div>

          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
            >
              {{ t('manage.settings.notificationContent') }}
            </label>
            <textarea
              v-model="config.notify_content"
              rows="3"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border resize-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
              :class="[
                isDarkMode
                  ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                  : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
              ]"
            ></textarea>
          </div>
        </div>

        <!-- 存储设置 -->
        <div class="space-y-4">
          <h3
            class="text-lg font-medium mb-4"
            :class="[isDarkMode ? 'text-white' : 'text-zinc-800']"
          >
            {{ t('manage.settings.storageSettings') }}
          </h3>
          <!-- 通知设置 -->
          <div class="space-y-2">
            <label
              class="block text-sm font-medium"
              :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
            >
              {{ t('manage.settings.storagePath') }}
            </label>
            <input
              type="text"
              :placeholder="t('manage.settings.storagePathPlaceholder')"
              v-model="config.storage_path"
              class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
              :class="[
                isDarkMode
                  ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                  : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
              ]"
            />
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <label
                class="block text-sm font-medium"
                :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
              >
                {{ t('manage.settings.storageMethod') }}
              </label>
              <select
                v-model="config.file_storage"
                class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border appearance-none bg-no-repeat bg-right focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none cursor-pointer"
                :class="[
                  isDarkMode
                    ? 'border-white/10 bg-zinc-950/45 text-white hover:border-white/20'
                    : 'border-zinc-200/80 bg-white/80 text-zinc-950 hover:border-zinc-300'
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
                  :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
                >
                  Webdav URL
                </label>
                <input
                  type="text"
                  :placeholder="t('manage.settings.webdavUrlPlaceholder')"
                  v-model="config.webdav_url"
                  class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                      : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
                  ]"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
                  >
                    Webdav Username
                  </label>
                  <input
                    type="text"
                    :placeholder="t('manage.settings.webdavUsernamePlaceholder')"
                    v-model="config.webdav_username"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                        : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
                    ]"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
                  >
                    Webdav Password
                  </label>
                  <input
                    type="password"
                    :placeholder="t('manage.settings.webdavPasswordPlaceholder')"
                    v-model="config.webdav_password"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                        : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
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
                    :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
                  >
                    {{ t('manage.settings.s3AccessKeyId') }}
                  </label>
                  <input
                    type="text"
                    v-model="config.s3_access_key_id"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                        : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
                    ]"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
                  >
                    {{ t('manage.settings.s3SecretAccessKey') }}
                  </label>
                  <input
                    type="password"
                    v-model="config.s3_secret_access_key"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                        : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
                    ]"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
                  >
                    {{ t('manage.settings.s3BucketName') }}
                  </label>
                  <input
                    type="text"
                    v-model="config.s3_bucket_name"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                        : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
                    ]"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
                  >
                    {{ t('manage.settings.s3EndpointUrl') }}
                  </label>
                  <input
                    type="text"
                    v-model="config.s3_endpoint_url"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                        : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
                    ]"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
                  >
                    {{ t('manage.settings.s3RegionName') }}
                  </label>
                  <input
                    type="text"
                    v-model="config.s3_region_name"
                    :placeholder="t('manage.settings.autoPlaceholder')"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                        : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
                    ]"
                  />
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
                  >
                    {{ t('manage.settings.s3SignatureVersion') }}
                  </label>
                  <select
                    v-model="config.s3_signature_version"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'border-white/10 bg-zinc-950/45 text-white hover:border-white/20'
                        : 'border-zinc-200/80 bg-white/80 text-zinc-950 hover:border-zinc-300'
                    ]"
                  >
                    <option value="s3v2">{{ t('manage.settings.s3v2') }}</option>
                    <option value="s3v4">{{ t('manage.settings.s3v4') }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
                  >
                    {{ t('manage.settings.s3AddressingStyle') }}
                  </label>
                  <select
                    v-model="config.s3_addressing_style"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'border-white/10 bg-zinc-950/45 text-white hover:border-white/20'
                        : 'border-zinc-200/80 bg-white/80 text-zinc-950 hover:border-zinc-300'
                    ]"
                  >
                    <option value="auto">{{ t('manage.settings.s3AddressingAuto') }}</option>
                    <option value="path">{{ t('manage.settings.s3AddressingPath') }}</option>
                    <option value="virtual">{{ t('manage.settings.s3AddressingVirtual') }}</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label
                    class="block text-sm font-medium"
                    :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
                  >
                    {{ t('manage.settings.s3Hostname') }}
                  </label>
                  <input
                    type="text"
                    v-model="config.s3_hostname"
                    class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                    :class="[
                      isDarkMode
                        ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                        : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
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
            :class="[isDarkMode ? 'text-white' : 'text-zinc-800']"
          >
            {{ t('manage.settings.uploadLimits') }}
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingNumberInput
              v-model="config.uploadMinute"
              :label="t('manage.settings.uploadPerMinute')"
              :suffix="t('common.minute')"
            />

            <SettingNumberInput
              v-model="config.uploadCount"
              :label="t('manage.settings.uploadCountLimit')"
              :suffix="t('common.files')"
            />

            <div class="space-y-2">
              <label
                class="block text-sm font-medium"
                :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
              >
                {{ t('manage.settings.fileSizeLimit') }}
              </label>
              <div class="flex items-center space-x-2">
                <input
                  type="number"
                  v-model="fileSize"
                  class="w-24 rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                      : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
                  ]"
                />
                <select
                  v-model="sizeUnit"
                  class="rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'border-white/10 bg-zinc-950/45 text-white hover:border-white/20'
                      : 'border-zinc-200/80 bg-white/80 text-zinc-950 hover:border-zinc-300'
                  ]"
                >
                  <option value="KB">{{ t('manage.settings.fileSizeUnits.kb') }}</option>
                  <option value="MB">{{ t('manage.settings.fileSizeUnits.mb') }}</option>
                  <option value="GB">{{ t('manage.settings.fileSizeUnits.gb') }}</option>
                </select>
              </div>
            </div>

            <div class="space-y-2 md:col-span-2">
              <label
                class="block text-sm font-medium"
                :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
              >
                {{ t('manage.settings.allowedFileTypes') }}
              </label>
              <input
                type="text"
                :value="config.allowed_file_types.join(', ')"
                @input="updateAllowedFileTypes"
                class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                :class="[
                  isDarkMode
                    ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                    : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
                ]"
                :placeholder="t('manage.settings.allowedFileTypesPlaceholder')"
              />
              <p class="text-xs" :class="[isDarkMode ? 'text-zinc-400' : 'text-zinc-500']">
                {{ t('manage.settings.allowedFileTypesHelp') }}
              </p>
            </div>

            <div class="space-y-2">
              <label
                class="block text-sm font-medium mb-2"
                :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
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
                          ? 'bg-zinc-600 border-zinc-600 text-white'
                          : 'bg-zinc-600 border-zinc-600 text-white'
                        : isDarkMode
                          ? 'bg-white/[0.06] border-white/10 text-zinc-300 hover:border-white/20 hover:bg-white/10'
                          : 'bg-white/70 border-zinc-200/80 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                    ]"
                  >
                    {{ t(`manage.settings.expiration.${style}`) }}
                  </div>
                </label>
              </div>
            </div>

            <div class="space-y-2">
              <label
                class="block text-sm font-medium"
                :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
              >
                {{ t('manage.settings.codeGenerateType') }}
              </label>
              <select
                v-model="config.code_generate_type"
                class="w-full rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                :class="[
                  isDarkMode
                    ? 'border-white/10 bg-zinc-950/45 text-white hover:border-white/20'
                    : 'border-zinc-200/80 bg-white/80 text-zinc-950 hover:border-zinc-300'
                ]"
              >
                <option value="number">{{ t('manage.settings.codeGenerateNumber') }}</option>
                <option value="secret">{{ t('manage.settings.codeGenerateSecret') }}</option>
              </select>
              <p class="text-xs" :class="[isDarkMode ? 'text-zinc-400' : 'text-zinc-500']">
                {{ t('manage.settings.codeGenerateTypeHelp') }}
              </p>
            </div>

            <div class="space-y-2">
              <label
                class="block text-sm font-medium"
                :class="[isDarkMode ? 'text-zinc-300' : 'text-zinc-700']"
              >
                {{ t('manage.settings.maxSaveTime') }}
              </label>
              <div class="flex items-center space-x-2">
                <input
                  type="number"
                  v-model="saveTime"
                  class="w-24 rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'border-white/10 bg-zinc-950/45 text-white placeholder-zinc-500 hover:border-white/20'
                      : 'border-zinc-200/80 bg-white/80 text-zinc-950 placeholder-zinc-400 hover:border-zinc-300'
                  ]"
                />
                <select
                  v-model="saveTimeUnit"
                  class="rounded-md shadow-sm px-4 py-2.5 transition-all duration-200 ease-in-out border focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 outline-none"
                  :class="[
                    isDarkMode
                      ? 'border-white/10 bg-zinc-950/45 text-white hover:border-white/20'
                      : 'border-zinc-200/80 bg-white/80 text-zinc-950 hover:border-zinc-300'
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
            :class="[isDarkMode ? 'text-white' : 'text-zinc-800']"
          >
            {{ t('manage.settings.errorLimits') }}
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingNumberInput
              v-model="config.errorMinute"
              :label="t('manage.settings.errorPerMinute')"
              :suffix="t('common.minute')"
            />

            <SettingNumberInput
              v-model="config.errorCount"
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
