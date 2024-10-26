<template>
  <footer v-if="isHomePage" class="bg-gray-100 py-2 fixed bottom-0 left-0 right-0">
    <div class="max-w-7xl mx-auto px-4 text-center">
      <p class="text-xs text-gray-600">备案信息: 京ICP备XXXXXXXX号-X | 版权所有 © {{ currentYear }} FileCodeBox</p>
      <p class="text-xxs text-gray-400 mt-1">免责声明：本网站内容仅供学习参考，不构成任何建议或保证。用户应遵守相关法规并对自身行为负责。</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const currentYear = ref(new Date().getFullYear())
const route = useRoute()
const isHomePage = computed(() => route.path === '/')
</script>
