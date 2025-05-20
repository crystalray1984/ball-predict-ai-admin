import { ref, watch } from 'vue'
import { getStorage, setStorage } from './storage'

export const token = ref(getStorage('token', ''))

//token变化时自动更新本地存储区的数据
watch(token, (token) => setStorage('token', token))
