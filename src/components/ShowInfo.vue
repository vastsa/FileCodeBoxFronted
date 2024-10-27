<template>
  <footer v-if="isHomePage" class="py-1 fixed bottom-0 left-0 right-0" :class="[isDarkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gray-100 bg-opacity-50']">
    <div class="max-w-7xl mx-auto px-2 text-center">
      <p class="text-xs" :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']">
        <template v-if="showICP">
          <a href="https://beian.miit.gov.cn" target="_blank" class="hover:underline">{{ ICP }}</a> | © {{ currentYear }} FileCodeBox
        </template>
        <template v-else>
          <a href="https://beian.miit.gov.cn" target="_blank" class="hover:underline">示例备案号</a> | © {{ currentYear }} FileCodeBox
        </template>
      </p>
      <p class="text-xs mt-1 font-light" :class="[isDarkMode ? 'text-gray-600' : 'text-gray-400']">
        免责声明：请勿上传或分享违法内容。用户应遵守相关法律法规，违规内容将被处理。
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useRoute } from 'vue-router'

const currentYear = ref(new Date().getFullYear())
const route = useRoute()
const isHomePage = computed(() => route.path === '/')
const isDarkMode = inject('isDarkMode')
const showICP = import.meta.env.PROD
const ICP = showICP ? import.meta.env.VITE_ICP : '示例备案号'
</script>
