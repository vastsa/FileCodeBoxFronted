import { defineStore } from 'pinia'
import { reactive } from 'vue'

interface ReceiveData {
  code: string;
  name: string;
  size: number;
  text: string;
}

interface ShareData {
  name: string;
  code: string;
  size: string;
  expiryTime: string;
  date: string;
}

export const useFileDataStore = defineStore('fileData', () => {
  const receiveData = reactive<ReceiveData[]>(JSON.parse(localStorage.getItem('receiveData') || '[]') || []) // 接收的数据
  const shareData = reactive<ShareData[]>(JSON.parse(localStorage.getItem('shareData') || '[]') || []) // 分享的数据
  
  function save() {
    localStorage.setItem('receiveData', JSON.stringify(receiveData))
    localStorage.setItem('shareData', JSON.stringify(shareData))
  }
  
  function addReceiveData(data: ReceiveData) {
    const existingIndex = receiveData.findIndex(item => item.code === data.code)
    if (existingIndex !== -1) {
      receiveData.splice(existingIndex, 1)
    }
    receiveData.unshift(data)
    save()
  }

  function addShareData(data: ShareData) {
    const existingIndex = shareData.findIndex(item => item.code === data.code)
    if (existingIndex !== -1) {
      shareData.splice(existingIndex, 1)
    }
    shareData.unshift(data)
    save()
  }

  function deleteReceiveData(index: number) {
    receiveData.splice(index, 1)
    save()
  }

  function deleteShareData(index: number) {
    shareData.splice(index, 1)
    save()
  }
  
  return {
    receiveData,
    shareData,
    save,
    addShareData,
    addReceiveData,
    deleteReceiveData,
    deleteShareData
  }
})
