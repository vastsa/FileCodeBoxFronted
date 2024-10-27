<template>
  <footer v-if="isHomePage" class="py-2 fixed bottom-0 left-0 right-0" :class="[isDarkMode ? 'bg-gray-800' : 'bg-gray-100']">
    <div class="max-w-7xl mx-auto px-4 text-center">
      <p class="text-xs" :class="[isDarkMode ? 'text-gray-300' : 'text-gray-600']">
        <template v-if="showICP">
          备案信息: <a href="https://beian.miit.gov.cn" target="_blank" class="hover:underline">{{ ICP }}</a> | 版权所有 © {{ currentYear }} FileCodeBox
        </template>
        <template v-else>
          备案信息: <a href="https://beian.miit.gov.cn" target="_blank" class="hover:underline">示例备案号</a> | 版权所有 © {{ currentYear }} FileCodeBox
        </template>
      </p>
      <p class="text-xxs mt-1" :class="[isDarkMode ? 'text-gray-500' : 'text-gray-400']">免责声明：本网站内容仅供学习参考，不构成任何建议或保证。用户应遵守相关法规并对自身行为负责。</p>
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
