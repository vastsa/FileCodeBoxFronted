<template>
  <div>
    <div class="mb-6 text-center" v-if="linkText && linkTo">
      <router-link
        :to="linkTo"
        class="text-indigo-400 hover:text-indigo-300 transition duration-300"
      >
        {{ linkText }}
      </router-link>
    </div>

    <div
      class="px-8 py-4 bg-opacity-50 flex justify-between items-center"
      :class="[isDarkMode ? 'bg-gray-800' : 'bg-gray-100']"
    >
      <span
        class="text-sm flex items-center"
        :class="[isDarkMode ? 'text-gray-300' : 'text-gray-800']"
      >
        <ShieldCheckIcon class="w-4 h-4 mr-1 text-green-400" />
        {{ t('send.secureEncryption') }}
      </span>
      <div class="flex items-center space-x-4">
        <router-link
          to="/login"
          class="text-sm hover:text-indigo-300 transition duration-300 flex items-center"
          :class="[
            isDarkMode
              ? 'text-gray-400 hover:text-indigo-400'
              : 'text-gray-500 hover:text-indigo-600'
          ]"
        >
          <UserIcon class="w-4 h-4" />
        </router-link>
        <button
          @click="$emit('toggle-drawer')"
          class="text-sm hover:text-indigo-300 transition duration-300 flex items-center"
          :class="[isDarkMode ? 'text-indigo-400' : 'text-indigo-600']"
        >
          {{ drawerText }}
          <ClipboardListIcon class="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { ShieldCheckIcon, ClipboardListIcon, UserIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  linkText?: string
  linkTo?: string
  drawerText: string
}

interface Emits {
  'toggle-drawer': []
}

defineProps<Props>()
defineEmits<Emits>()

const isDarkMode = inject('isDarkMode')
</script>
