import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useAdmin = defineStore('admin', () => {
    const admin = ref() as Ref<Admin>

    return {
        admin,
    }
})
