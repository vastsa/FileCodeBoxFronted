<template>
  <transition name="fade">
    <div
      v-if="visible && record"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div
        class="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out"
        :class="isDarkMode ? 'border-zinc-800 bg-zinc-950/95' : 'border-white/50 bg-white/95'"
      >
        <div class="mb-4 flex flex-shrink-0 items-center justify-between gap-4">
          <h3
            class="min-w-0 truncate text-xl font-semibold tracking-tight"
            :class="isDarkMode ? 'text-zinc-100' : 'text-slate-800'"
          >
            {{ record.filename }}
          </h3>
          <div class="flex items-center gap-2">
            <a
              :href="previewUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-xl px-3 py-1.5 text-sm font-semibold transition duration-300"
              :class="
                isDarkMode
                  ? 'bg-zinc-200 text-zinc-950 hover:bg-zinc-100'
                  : 'bg-zinc-800 text-white hover:bg-zinc-900'
              "
            >
              {{ t('fileDetail.download') }}
            </a>
            <button
              type="button"
              class="rounded-xl p-1.5 transition duration-300"
              :class="
                isDarkMode
                  ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              "
              @click="$emit('close')"
            >
              <XIcon class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          class="flex min-h-[16rem] flex-1 items-center justify-center overflow-hidden rounded-xl"
          :class="isDarkMode ? 'bg-zinc-900/70' : 'bg-slate-50'"
        >
          <img
            v-if="mediaType === 'image'"
            :src="previewUrl"
            :alt="record.filename"
            class="max-h-[70vh] max-w-full object-contain"
          />
          <video
            v-else-if="mediaType === 'video'"
            :src="previewUrl"
            class="max-h-[70vh] w-full"
            controls
          ></video>
          <audio
            v-else-if="mediaType === 'audio'"
            :src="previewUrl"
            class="w-full px-4"
            controls
          ></audio>
          <iframe
            v-else
            :src="previewUrl"
            class="h-[70vh] w-full border-0"
            :title="record.filename"
          ></iframe>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { XIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useInjectedDarkMode } from '@/composables'
import type { ReceivedFileRecord } from '@/types'
import { buildDownloadUrl } from '@/utils/share-url'

interface Props {
  visible: boolean
  record: ReceivedFileRecord | null
}

const props = defineProps<Props>()
defineEmits<{
  close: []
}>()

const { t } = useI18n()
const isDarkMode = useInjectedDarkMode()

const previewUrl = computed(() =>
  props.record?.downloadUrl ? buildDownloadUrl(props.record.downloadUrl) : ''
)
const extension = computed(() => props.record?.filename.split('.').pop()?.toLowerCase() || '')
const mediaType = computed(() => {
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension.value)) return 'image'
  if (['mp4', 'webm', 'ogg', 'mov', 'm4v'].includes(extension.value)) return 'video'
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(extension.value)) return 'audio'
  return 'document'
})
</script>
