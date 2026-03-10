<script setup lang="tsx">
import { ActionModal } from '@/components/modal'
import PageGrid from '@/components/PageGrid.vue'
import { api } from '@/libs/api'
import { dateTime, ODD_TYPE_TEXT } from '@/libs/helpers'
import { useLoader } from '@/libs/loader'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import {
    NButton,
    NCard,
    NDataTable,
    NDatePicker,
    NFlex,
    NForm,
    NFormItem,
    NInput,
    NInputGroup,
    NInputGroupLabel,
    NSelect,
    NStatistic,
    NTag,
    NText,
    useMessage,
    type DataTableColumn,
} from 'naive-ui'
import { computed, onBeforeUnmount, onMounted, reactive, ref, type Ref } from 'vue'

interface Filter {
    dates?: [number, number]
    sort: string
}

interface Model3Data {
    id: number
    match_time: string
    tournament_name: string
    team1_name: string
    team2_name: string
    condition: string
    variety: Variety
    period: Period
    type: OddType
    value: string
    extra: {
        condition: string
        variety: Variety
        period: Period
        type: OddType
        value1: string
    }
    result: number | null
    score: string
    created_at: string
}

const message = useMessage()
const start = dayjs().subtract(1, 'day').startOf('day')
const end = dayjs().startOf('day')

const filter = reactive<Filter>({
    dates: [start.valueOf(), end.valueOf()],
    sort: 'created_at',
})

const activeFilter = {
    start_date: start.format('YYYY-MM-DD') as string | undefined,
    end_date: end.format('YYYY-MM-DD') as string | undefined,
    sort: filter.sort,
}

const { load, loading } = useLoader()

const list = ref([]) as Ref<Model3Data[]>

interface SummaryData {
    win: number
    loss: number
    draw: number
    total: number
    win_rate: number
}

const summary = computed<SummaryData>(() => {
    let win = 0
    let loss = 0
    let draw = 0

    list.value.forEach((row) => {
        if (row.result === 1) {
            win++
        } else if (row.result === 0) {
            draw++
        } else if (row.result === -1) {
            loss++
        }
    })

    const valid = win + loss
    const win_rate = valid > 0 ? Math.floor((win * 1000) / valid) / 10 : 0

    return {
        win,
        loss,
        draw,
        win_rate,
        total: list.value.length,
    }
})

const mergeFilter = (target: Record<string, any>) => {
    target.sort = filter.sort
    if (filter.dates) {
        target.start_date = dayjs(filter.dates[0]).format('YYYY-MM-DD')
        target.end_date = dayjs(filter.dates[1]).format('YYYY-MM-DD')
    } else {
        target.start_date = target.end_date = undefined
    }
}

let timer: any
onBeforeUnmount(() => {
    clearInterval(timer)
})

const loadData = async () => {
    const ret = await api<Model3Data[]>({
        url: '/admin/model3/list',
        data: activeFilter,
    })

    if (ret.code) {
        message.warning(ret.msg)
        return false
    } else {
        list.value = ret.data
        return true
    }
}

const applyFilter = async () => {
    clearInterval(timer)
    mergeFilter(activeFilter)
    const success = await load(loadData)
    if (success) {
        timer = setInterval(loadData, 30000)
    }
}

onMounted(applyFilter)

const columns: DataTableColumn<Model3Data>[] = [
    {
        key: 'match_time',
        title: '比赛时间',
        // width: 70,
        align: 'center',
        render: (row) => dayjs(row.match_time).format('M/D H:mm'),
    },
    {
        key: 'tournament_name',
        title: '联赛',
    },
    {
        key: 'team',
        title: '球队',
        render: (row) => {
            return (
                <>
                    <NFlex align="center" size={4}>
                        <NTag size="tiny">主</NTag>
                        <span>{row.team1_name}</span>
                    </NFlex>
                    <NFlex align="center" size={4}>
                        <NTag size="tiny">客</NTag>
                        <span>{row.team1_name}</span>
                    </NFlex>
                </>
            )
        },
    },
    {
        key: 'source',
        title: '触发盘口',
        render: (row) => {
            const texts: string[] = []
            texts.push(ODD_TYPE_TEXT[row.extra.type])
            if (['ah1', 'ah2'].includes(row.extra.type)) {
                const condition = Decimal(row.extra.condition)
                texts.push(`${condition.gt(0) ? '+' : ''}${condition.toString()}`)
            } else if (['over', 'under'].includes(row.extra.type)) {
                texts.push(Decimal(row.extra.condition).toString())
            }
            texts.push(Number(row.extra.value1).toString())
            return texts.join(' ')
        },
    },
    {
        key: 'promote',
        title: '推荐内容',
        // width: 120,
        render: (row) => {
            const texts: string[] = []
            texts.push(ODD_TYPE_TEXT[row.type])
            if (['ah1', 'ah2'].includes(row.type)) {
                const condition = Decimal(row.condition)
                texts.push(`${condition.gt(0) ? '+' : ''}${condition.toString()}`)
            } else if (['over', 'under'].includes(row.type)) {
                texts.push(Decimal(row.condition).toString())
            }

            return texts.join(' ')
        },
    },
    {
        key: 'value',
        title: '推荐水位',
        // width: 80,
        render: (row) => Number(row.value),
    },

    {
        key: 'created_at',
        title: '推荐时间',
        // width: 100,
        render: (row) => {
            return dateTime(row.created_at)
        },
    },

    {
        key: 'result',
        title: '结果',
        // width: 80,
        render: (row) => {
            if (typeof row.result !== 'number') return '待定'
            switch (row.result) {
                case -1:
                    return (
                        <NFlex size="small" align="center">
                            <NText type="error">输</NText>
                            <span>({row.score})</span>
                        </NFlex>
                    )
                case 1:
                    return (
                        <NFlex size="small" align="center">
                            <NText type="success">赢</NText>
                            <span>({row.score})</span>
                        </NFlex>
                    )
                default:
                    return (
                        <NFlex size="small" align="center">
                            <NText type="warning">和</NText>
                            <span>({row.score})</span>
                        </NFlex>
                    )
            }
        },
    },
]

const configModal = reactive({
    show: false,
    sending: false,
    data: null as unknown as {
        model3_min_value: string
        model3_max_value: string
    },
})

const openConfigModal = async () => {
    configModal.data = null as any
    configModal.show = true
    const ret = await api<{
        model3_min_value: string
        model3_max_value: string
    }>({
        url: '/admin/setting/get',
        data: {
            keys: ['model3_min_value', 'model3_max_value'],
        },
    })
    if (ret.code) {
        message.error(ret.msg)
        configModal.show = false
        return
    }
    configModal.data = ret.data
}

const saveConfig = async () => {
    configModal.sending = true
    const ret = await load(() =>
        api({
            url: '/admin/setting/set',
            data: configModal.data,
        }),
    )
    configModal.sending = false
    if (ret.code) {
        message.error(ret.msg)
    } else {
        message.success('保存成功')
        configModal.show = true
    }
}
</script>
<template>
    <PageGrid :useContentScroller="false">
        <template #header>
            <NFlex :vertical="true">
                <NFlex justify="space-between" align="end">
                    <NForm
                        labelPlacement="left"
                        :inline="true"
                        :disabled="loading"
                        :showFeedback="false"
                    >
                        <NFormItem label="日期">
                            <NDatePicker
                                type="daterange"
                                v-model:value="filter.dates"
                                :inputReadonly="true"
                            />
                        </NFormItem>
                        <NFormItem label="排序">
                            <NSelect
                                v-model:value="filter.sort"
                                :options="[
                                    { value: 'created_at', label: '推荐时间' },
                                    { value: 'match_time', label: '比赛时间' },
                                ]"
                                :consistentMenuWidth="false"
                                :style="{ minWidth: '70px' }"
                                :clearable="false"
                            />
                        </NFormItem>
                        <NFormItem>
                            <NButton type="primary" :loading="loading" @click="applyFilter"
                                >查询</NButton
                            >
                        </NFormItem>
                        <NFormItem>
                            <NButton type="error" @click="openConfigModal">设置</NButton>
                        </NFormItem>
                    </NForm>
                </NFlex>
                <NFlex :size="12">
                    <NCard size="small" class="statisitc-card">
                        <NStatistic label="推荐数" :value="summary.total ?? 0" />
                    </NCard>
                    <NCard size="small" class="statisitc-card">
                        <NStatistic label="赢场数">
                            <NText type="success">{{ summary.win ?? 0 }}</NText>
                        </NStatistic>
                    </NCard>
                    <NCard size="small" class="statisitc-card">
                        <NStatistic label="和场数">
                            <NText type="warning">{{ summary.draw ?? 0 }}</NText>
                        </NStatistic>
                    </NCard>
                    <NCard size="small" class="statisitc-card">
                        <NStatistic label="输场数">
                            <NText type="error">{{ summary.loss ?? 0 }}</NText>
                        </NStatistic>
                    </NCard>
                    <NCard size="small" class="statisitc-card">
                        <NStatistic label="胜率">
                            <NText
                                :type="
                                    summary.win_rate === 0
                                        ? undefined
                                        : summary.win_rate >= 50
                                          ? 'success'
                                          : 'error'
                                "
                                >{{ summary.win_rate ?? 0 }}%</NText
                            >
                        </NStatistic>
                    </NCard>
                </NFlex>
            </NFlex>
        </template>
        <NDataTable
            :data="list"
            :rowKey="(t) => t.id"
            :columns="columns"
            :pagination="false"
            :loading="loading"
            size="small"
            :striped="true"
            :bordered="true"
            :singleLine="false"
            maxHeight="100%"
        />
    </PageGrid>

    <ActionModal
        title="模型3设置"
        v-model:show="configModal.show"
        :data="configModal.data"
        :sending="configModal.sending"
        :style="{ width: '500px' }"
        @positiveClick="saveConfig"
    >
        <NFormItem label="触发盘口的反推水位范围" :showFeedback="false" labelPlacement="top">
            <NInputGroup>
                <NInput v-model:value="configModal.data.model3_min_value" />
                <NInputGroupLabel>至</NInputGroupLabel>
                <NInput v-model:value="configModal.data.model3_max_value" />
            </NInputGroup>
        </NFormItem>
    </ActionModal>
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

    .n-statistic {
        display: flex;
        justify-content: space-between;
        align-items: center;

        &:deep(.n-statistic-value) {
            margin-top: 0;
        }
    }
}
</style>
