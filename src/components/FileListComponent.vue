<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <thead>
        <tr class="bg-gray-50">
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文件名</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">过期时间</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">大小</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="file in fileList" :key="file.id" class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">{{ file.id }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ file.uuid_file_name }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(file.created_at) }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(file.expired_at) }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ formatFileSize(file.size) }}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <button @click="downloadFile(file.id)" class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:border-green-700 focus:shadow-outline-green active:bg-green-700 transition ease-in-out duration-150 mr-2">
              <Download class="w-4 h-4 mr-1" /> 下载
            </button>
            <button @click="deleteFile(file.id)" class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red active:bg-red-700 transition ease-in-out duration-150">
              <Trash2 class="w-4 h-4 mr-1" /> 删除
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="flex justify-center items-center mt-4">
      <button 
        @click="handlePageChange(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        上一页
      </button>
      <span class="mx-4 text-sm text-gray-700">{{ currentPage }} / {{ Math.ceil(total / pageSize) }}</span>
      <button 
        @click="handlePageChange(currentPage + 1)" 
        :disabled="currentPage === Math.ceil(total / pageSize)"
        class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Download, Trash2 } from 'lucide-vue-next';
import { useAlertStore } from '@/stores/alertStore';
import api from '@/utils/api';

const alertStore = useAlertStore();

const fileList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const fetchFileList = async () => {
  try {
    const response = await api.get(`/admin/file/list?page=${currentPage.value}&size=${pageSize.value}`, {
      headers: {
        'Authorization': localStorage.getItem('admin_token')
      }
    });
    
    if (response.code === 200) {
      fileList.value = response.detail.data;
      total.value = response.detail.total;
      currentPage.value = response.detail.page;
      pageSize.value = response.detail.size;
    } else {
      alertStore.showAlert('获取文件列表失败', 'error');
    }
  } catch (error) {
    console.log(error)
    alertStore.showAlert('获取文件列表失败', 'error');
  }
};

const handlePageChange = (page) => {
  currentPage.value = page;
  fetchFileList();
};

const downloadFile = async (id) => {
  try {
    const response = await api.get(`/admin/file/download?id=${id}`, {
      responseType: 'blob',
      headers: {
        'Authorization': localStorage.getItem('admin_token')
      }
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'file');
    document.body.appendChild(link);
    link.click();
    alertStore.showAlert('文件下载成功', 'success');
  } catch (error) {
    alertStore.showAlert('下载文件失败', 'error');
  }
};

const deleteFile = async (id) => {
  try {
    await api.delete('/admin/file/delete', {
      data: { id },
      headers: {
        'Authorization': localStorage.getItem('admin_token')
      }
    });
    alertStore.showAlert('删除文件成功', 'success');
    fetchFileList();
  } catch (error) {
    alertStore.showAlert('删除文件失败', 'error');
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

onMounted(() => {
  fetchFileList();
});
</script>
