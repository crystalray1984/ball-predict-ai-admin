import './styles/main.less'

import { queryClient } from '@/libs/query'
import { router } from '@/router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).use(VueQueryPlugin, { queryClient }).use(router).use(createPinia()).mount('#app')
