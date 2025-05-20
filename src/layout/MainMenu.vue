<script setup lang="tsx">
import { NMenu, type MenuGroupOption, type MenuOption } from 'naive-ui'
import { type VNodeChild } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const menuOptions: MenuOption[] = [
    {
        key: '/dashboard',
        label: '概览',
    },
    {
        key: '/odd-view',
        label: '数据总览',
    },
]

const renderLabel = (option: MenuOption | MenuGroupOption): VNodeChild => {
    if (option.type === 'group') {
        return <span>{option.label}</span>
    } else {
        return <RouterLink to={option.key as string}>{option.label}</RouterLink>
    }
}
</script>
<template>
    <NMenu :value="route.path" :inverted="true" :options="menuOptions" :renderLabel="renderLabel" />
</template>
<style lang="less" scoped></style>
