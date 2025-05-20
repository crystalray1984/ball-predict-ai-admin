<script setup lang="ts">
import { NLayout, NLayoutContent, NLayoutSider } from 'naive-ui'
import { RouterView } from 'vue-router'
import MainMenu from './MainMenu.vue'
</script>
<template>
    <NLayout class="main-layout" :hasSider="true">
        <NLayoutSider :inverted="true" :width="200">
            <MainMenu />
        </NLayoutSider>
        <NLayoutContent>
            <RouterView />
        </NLayoutContent>
    </NLayout>
</template>
<style lang="less" scoped>
.main-layout {
    position: relative;
    width: 100vw;
    height: 100vh;
}
</style>
