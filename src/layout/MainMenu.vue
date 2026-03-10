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
        key: '/score_miss_matches',
        label: '赛果缺失列表',
    },
    {
        key: '/odds',
        label: '盘口数据',
    },
    {
        key: '/v2_to_v3',
        label: '新老融合数据',
    },
    {
        key: '/compare_odds',
        label: '对比数据',
    },
    {
        key: '/rockball',
        label: '滚球数据',
    },
    {
        key: '/rockball2',
        label: '滚球2数据',
    },
    {
        key: '/rockball3',
        label: '滚球3数据',
    },
    {
        key: '/model3',
        label: '模型3数据',
    },
    {
        key: '/manual_promote',
        label: '手动推荐',
    },
    {
        key: '/matches',
        label: '比赛列表',
    },
    {
        key: '/tournaments',
        label: '赛事列表',
    },
    {
        key: '/tournament_labels',
        label: '赛事标签',
    },
    {
        key: '/surebet_records',
        label: '推送记录',
    },
    {
        key: '/users',
        label: '用户管理',
    },
    {
        key: '/vip_records',
        label: 'VIP购买记录',
    },
    {
        key: '/settings',
        label: '系统设置',
    },
    {
        key: '/versions',
        label: '版本管理',
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
