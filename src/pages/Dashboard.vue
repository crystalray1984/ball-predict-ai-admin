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

interface LabelSummary extends Summary<SummaryData> {
    id: number
    title: string
}

//概览数据
const { data } = useApiQuery({
    queryKey: ['/admin/dashboard/summary'],
    queryFn: () =>
        api<Summary<SummaryData>>({
            url: '/admin/dashboard/summary',
        }),
})

//新老融合概览数据
const { data: v3Data } = useApiQuery({
    queryKey: ['/admin/dashboard/v2_to_v3_summary'],
    queryFn: () =>
        api<Summary<SummaryData>>({
            url: '/admin/dashboard/v2_to_v3_summary',
        }),
})

//对比概览数据
const { data: compareData } = useApiQuery({
    queryKey: ['/admin/dashboard/compare_summary'],
    queryFn: () =>
        api<Summary<SummaryData>>({
            url: '/admin/dashboard/compare_summary',
        }),
})

const { data: userData } = useApiQuery({
    queryKey: ['/admin/dashboard/user_summary'],
    queryFn: () =>
        api<{
            users: Summary<number>
            vip: Summary<VipSummaryData>
        }>({
            url: '/admin/dashboard/user_summary',
        }),
})

const { data: labelData } = useApiQuery({
    queryKey: ['/admin/dashboard/label_summary'],
    queryFn: () =>
        api<LabelSummary[]>({
            url: '/admin/dashboard/label_summary',
        }),
})
</script>
<template>
    <div class="page">
        <NFlex :vertical="true" :size="12">
            <NFlex v-if="false" :size="12">
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="用户数" :value="userData?.users.all ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日新增</NText>
                        <NText>{{ userData?.users.today }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日新增</NText>
                        <NText>{{ userData?.users.yesterday }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天新增</NText>
                        <NText>{{ userData?.users.days_7 }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天新增</NText>
                        <NText>{{ userData?.users.days_30 }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="VIP日卡" :value="userData?.vip.all.day ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ userData?.vip.today.day }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ userData?.vip.yesterday.day }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ userData?.vip.days_7.day }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ userData?.vip.days_30.day }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="VIP周卡" :value="userData?.vip.all.week ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ userData?.vip.today.week }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ userData?.vip.yesterday.week }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ userData?.vip.days_7.week }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ userData?.vip.days_30.week }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="VIP月卡" :value="userData?.vip.all.month ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ userData?.vip.today.month }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ userData?.vip.yesterday.month }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ userData?.vip.days_7.month }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ userData?.vip.days_30.month }}</NText>
                    </div>
                </NCard>
            </NFlex>

            <NFlex :size="12">
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="总台 - 推荐数" :value="data?.all.total ?? 0" />
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
                    <NStatistic label="总台 - 赢场数" :value="data?.all.win ?? 0" />
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
                    <NStatistic label="总台 - 和场数" :value="data?.all.draw ?? 0" />
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
                    <NStatistic label="总台 - 输场数" :value="data?.all.loss ?? 0" />
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
                    <NStatistic label="总台 - 胜率" :value="data?.all.win_rate ?? 0">
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
            </NFlex>

            <NFlex :size="12">
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="新老融合 - 推荐数" :value="v3Data?.all.total ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ v3Data?.today.total }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ v3Data?.yesterday.total }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ v3Data?.days_7.total }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ v3Data?.days_30.total }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="新老融合 - 赢场数" :value="v3Data?.all.win ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ v3Data?.today.win }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ v3Data?.yesterday.win }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ v3Data?.days_7.win }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ v3Data?.days_30.win }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="新老融合 - 和场数" :value="v3Data?.all.draw ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ v3Data?.today.draw }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ v3Data?.yesterday.draw }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ v3Data?.days_7.draw }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ v3Data?.days_30.draw }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="新老融合 - 输场数" :value="v3Data?.all.loss ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ v3Data?.today.loss }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ v3Data?.yesterday.loss }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ v3Data?.days_7.loss }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ v3Data?.days_30.loss }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="新老融合 - 胜率" :value="v3Data?.all.win_rate ?? 0">
                        <template #suffix>%</template>
                    </NStatistic>
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ v3Data?.today.win_rate }}%</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ v3Data?.yesterday.win_rate }}%</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ v3Data?.days_7.win_rate }}%</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ v3Data?.days_30.win_rate }}%</NText>
                    </div>
                </NCard>
            </NFlex>

            <NFlex :size="12">
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="对比 - 推荐数" :value="compareData?.all.total ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ compareData?.today.total }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ compareData?.yesterday.total }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ compareData?.days_7.total }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ compareData?.days_30.total }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="对比 - 赢场数" :value="compareData?.all.win ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ compareData?.today.win }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ compareData?.yesterday.win }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ compareData?.days_7.win }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ compareData?.days_30.win }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="对比 - 和场数" :value="compareData?.all.draw ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ compareData?.today.draw }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ compareData?.yesterday.draw }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ compareData?.days_7.draw }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ compareData?.days_30.draw }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="对比 - 输场数" :value="compareData?.all.loss ?? 0" />
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ compareData?.today.loss }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ compareData?.yesterday.loss }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ compareData?.days_7.loss }}</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ compareData?.days_30.loss }}</NText>
                    </div>
                </NCard>
                <NCard size="small" class="statisitc-card">
                    <NStatistic label="对比 - 胜率" :value="compareData?.all.win_rate ?? 0">
                        <template #suffix>%</template>
                    </NStatistic>
                    <div class="statisitc-row">
                        <NText :depth="3">今日</NText>
                        <NText>{{ compareData?.today.win_rate }}%</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">昨日</NText>
                        <NText>{{ compareData?.yesterday.win_rate }}%</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近7天</NText>
                        <NText>{{ compareData?.days_7.win_rate }}%</NText>
                    </div>
                    <div class="statisitc-row">
                        <NText :depth="3">最近30天</NText>
                        <NText>{{ compareData?.days_30.win_rate }}%</NText>
                    </div>
                </NCard>
            </NFlex>

            <template v-if="labelData">
                <NFlex v-for="item of labelData" :key="item.id" :size="12">
                    <NCard size="small" class="statisitc-card">
                        <NStatistic
                            :label="`${item.title} - 推荐数`"
                            :value="item.all.total ?? 0"
                        />
                        <div class="statisitc-row">
                            <NText :depth="3">今日</NText>
                            <NText>{{ item.today.total }}</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">昨日</NText>
                            <NText>{{ item.yesterday.total }}</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">最近7天</NText>
                            <NText>{{ item.days_7.total }}</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">最近30天</NText>
                            <NText>{{ item.days_30.total }}</NText>
                        </div>
                    </NCard>
                    <NCard size="small" class="statisitc-card">
                        <NStatistic :label="`${item.title} - 赢场数`" :value="item.all.win ?? 0" />
                        <div class="statisitc-row">
                            <NText :depth="3">今日</NText>
                            <NText>{{ item.today.win }}</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">昨日</NText>
                            <NText>{{ item.yesterday.win }}</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">最近7天</NText>
                            <NText>{{ item.days_7.win }}</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">最近30天</NText>
                            <NText>{{ item.days_30.win }}</NText>
                        </div>
                    </NCard>
                    <NCard size="small" class="statisitc-card">
                        <NStatistic :label="`${item.title} - 和场数`" :value="item.all.draw ?? 0" />
                        <div class="statisitc-row">
                            <NText :depth="3">今日</NText>
                            <NText>{{ data?.today.draw }}</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">昨日</NText>
                            <NText>{{ item.yesterday.draw }}</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">最近7天</NText>
                            <NText>{{ item.days_7.draw }}</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">最近30天</NText>
                            <NText>{{ item.days_30.draw }}</NText>
                        </div>
                    </NCard>
                    <NCard size="small" class="statisitc-card">
                        <NStatistic :label="`${item.title} - 输场数`" :value="item.all.loss ?? 0" />
                        <div class="statisitc-row">
                            <NText :depth="3">今日</NText>
                            <NText>{{ item.today.loss }}</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">昨日</NText>
                            <NText>{{ item.yesterday.loss }}</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">最近7天</NText>
                            <NText>{{ item.days_7.loss }}</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">最近30天</NText>
                            <NText>{{ item.days_30.loss }}</NText>
                        </div>
                    </NCard>
                    <NCard size="small" class="statisitc-card">
                        <NStatistic :label="`${item.title} - 胜率`" :value="item.all.win_rate ?? 0">
                            <template #suffix>%</template>
                        </NStatistic>
                        <div class="statisitc-row">
                            <NText :depth="3">今日</NText>
                            <NText>{{ item.today.win_rate }}%</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">昨日</NText>
                            <NText>{{ item.yesterday.win_rate }}%</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">最近7天</NText>
                            <NText>{{ item.days_7.win_rate }}%</NText>
                        </div>
                        <div class="statisitc-row">
                            <NText :depth="3">最近30天</NText>
                            <NText>{{ item.days_30.win_rate }}%</NText>
                        </div>
                    </NCard>
                </NFlex>
            </template>
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
