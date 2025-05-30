<script setup lang="ts">
import { api } from '@/libs/api'
import { useApiQuery } from '@/libs/query'
import { NCard, NFlex, NStatistic, NText } from 'naive-ui'

interface SummaryData {
    win: number
    loss: number
    draw: number
    total: number
    win_rate: number
    user: number
}

interface Summary<T> {
    today: T
    yesterday: T
    days_7: T
    days_30: T
    all: T
}

interface VipSummaryData {
    day: number
    month: number
    week: number
    quarter: number
}

//概览数据
const { data } = useApiQuery({
    queryKey: ['/admin/dashboard/summary'],
    queryFn: () =>
        api<Summary<SummaryData>>({
            url: '/admin/dashboard/summary',
        }),
})

//概览数据
const { data: vipData } = useApiQuery({
    queryKey: ['/admin/dashboard/vip_summary'],
    queryFn: () =>
        api<Summary<VipSummaryData>>({
            url: '/admin/dashboard/vip_summary',
        }),
})
</script>
<template>
    <div class="page">
        <NFlex :vertical="true" :size="12">
            <NFlex :size="12">
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="推荐数" :value="data?.all.total ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ data?.today.total }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ data?.yesterday.total }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ data?.days_7.total }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ data?.days_30.total }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="赢场数" :value="data?.all.win ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ data?.today.win }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ data?.yesterday.win }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ data?.days_7.win }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ data?.days_30.win }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="和场数" :value="data?.all.draw ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ data?.today.draw }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ data?.yesterday.draw }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ data?.days_7.draw }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ data?.days_30.draw }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="输场数" :value="data?.all.loss ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ data?.today.loss }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ data?.yesterday.loss }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ data?.days_7.loss }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ data?.days_30.loss }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="胜率" :value="data?.all.win_rate ?? 0">
                        <template #suffix>%</template>
                    </NStatistic>
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ data?.today.win_rate }}%</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ data?.yesterday.win_rate }}%</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ data?.days_7.win_rate }}%</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ data?.days_30.win_rate }}%</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="用户数" :value="data?.all.user ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日新增</NText>
                        <NText>{{ data?.today.user }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日新增</NText>
                        <NText>{{ data?.yesterday.user }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天新增</NText>
                        <NText>{{ data?.days_7.user }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天新增</NText>
                        <NText>{{ data?.days_30.user }}</NText>
                    </div>
                </NCard>
            </NFlex>

            <NFlex :size="12">
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="VIP日卡" :value="vipData?.all.day ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ vipData?.today.day }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ vipData?.yesterday.day }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ vipData?.days_7.day }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ vipData?.days_30.day }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="VIP周卡" :value="vipData?.all.week ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ vipData?.today.week }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ vipData?.yesterday.week }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ vipData?.days_7.week }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ vipData?.days_30.week }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="VIP月卡" :value="vipData?.all.month ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ vipData?.today.month }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ vipData?.yesterday.month }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ vipData?.days_7.month }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ vipData?.days_30.month }}</NText>
                    </div>
                </NCard>
            </NFlex>
        </NFlex>
    </div>
</template>
<style lang="less" scoped>
.statisitc-card {
    width: auto;
    flex: 1;

    .statisitc-row {
        display: flex;
        justify-content: space-between;
        white-space: nowrap;
        gap: 12px;
    }
}
</style>
