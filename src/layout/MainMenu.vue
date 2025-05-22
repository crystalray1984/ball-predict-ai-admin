<script setup lang="tsx">
import { NMenu, type MenuGroupOption, type MenuOption, NConfigProvider } from 'naive-ui'
import { type VNodeChild } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const menuOptions: MenuOption[] = [
    {
        key: '/dashboard',
        label: '概览',
    },
    {
        key: '/odds',
        label: '盘口数据',
    },
    {
        key: '/matches',
        label: '比赛列表',
    },
    {
        key: '/settings',
        label: '系统设置',
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
    <NConfigProvider
        :abstract="true"
        :themeOverrides="{
            common: {
                fontSizeMedium: '14px',
                fontSize: '14px',
                fontSizeSmall: '14px',
            },
        }"
    >
        <NMenu
            :value="route.path"
            :inverted="true"
            :options="menuOptions"
            :renderLabel="renderLabel"
        />
    </NConfigProvider>
</template>
<style lang="less" scoped></style>
