<script setup lang="tsx">
import PageGrid from '@/components/PageGrid.vue'
import { api } from '@/libs/api'
import { dateTime, ODD_TYPE_TEXT, PERIOD_TEXT, VARIETY_TEXT } from '@/libs/helpers'
import { useLoader } from '@/libs/loader'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import {
    NButton,
    NDataTable,
    NDatePicker,
    NFlex,
    NForm,
    NFormItem,
    NSelect,
    NTag,
    NText,
    useMessage,
    NCard,
    NStatistic,
    type DataTableColumn,
    type SelectOption,
} from 'naive-ui'
import { computed, onBeforeUnmount, onMounted, reactive, ref, type Ref } from 'vue'

interface Filter {
    dates?: [number, number]
    variety?: string
    period?: string
    ready_status?: number
    promoted?: number
}

interface OddData extends OddInfo {
    id: number
    match_id: number
    match_time: string
    tournament: Tournament
    team1: Team
    team2: Team
    surebet_value: string
    crown_value?: string
    crown_condition2?: string
    crown_value2?: string
    status: OddStatus
    final_rule: PromotedFinalRule
    promoted?: {
        id: number
        result: {
            result: number
            score: string
        } | null
        back: number
        skip: PromotedSkip
        is_valid: number
        score: string
        final_rule: string
        created_at: string
        value: string
        duration: number
        value0: string
        value1: string
    } & OddInfo
    has_score: number
    has_period1_score: number
    created_at: string
    ready_at: string | null
    is_open: number
    is_updating?: boolean
}

const start = dayjs().subtract(1, 'day').startOf('day')
const end = dayjs().startOf('day')
const message = useMessage()

const filter = reactive<Filter>({
    dates: [start.valueOf(), end.valueOf()],
    ready_status: 1,
})

const activeFilter = {
    start_date: start.format('YYYY-MM-DD') as string | undefined,
    end_date: end.format('YYYY-MM-DD') as string | undefined,
    ready_state: undefined as number | undefined,
    promoted: undefined as number | undefined,
}

const { load, loading } = useLoader()

const list = ref([]) as Ref<OddData[]>

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

    const filtered = list.value.filter((t) => t.promoted && t.promoted.is_valid)

    filtered.forEach((row) => {
        if (row.promoted?.result?.result === 1) {
            win++
        } else if (row.promoted?.result?.result === 0) {
            draw++
        } else if (row.promoted?.result?.result === -1) {
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
        total: filtered.length,
    }
})

const mergeFilter = (target: Record<string, any>) => {
    target.ready_status = filter.ready_status
    target.promoted = filter.promoted
    target.variety = filter.variety
    target.period = filter.period
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
    const ret = await api<OddData[]>({
        url: '/admin/mansion/list',
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

/**
 * 导出
 */
const doExport = () => {
    const params = {}
    mergeFilter(params)

    const form = document.createElement('form')
    form.style.display = 'none'
    form.method = 'POST'
    form.action = new URL(
        '/admin/mansion/export',
        import.meta.env.VITE_API_URL || location.href,
    ).href
    form.enctype = 'application/x-www-form-urlencoded'

    Object.entries(params).forEach(([name, value]) => {
        if (typeof value === 'undefined' || value === null) return
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = name
        input.value = String(value)
        form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
}

const periodOptions: SelectOption[] = Object.entries(PERIOD_TEXT).map(([value, label]) => ({
    value,
    label,
}))

const varietyOptions: SelectOption[] = Object.entries(VARIETY_TEXT).map(([value, label]) => ({
    value,
    label,
}))

const columns: DataTableColumn<OddData>[] = [
    {
        key: 'match_time',
        title: '比赛时间',
        width: 70,
        align: 'center',
        render: (row) => dayjs(row.match_time).format('M/D H:mm'),
    },
    {
        key: 'tournament.name',
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
                        <span>{row.team1.name}</span>
                    </NFlex>
                    <NFlex align="center" size={4}>
                        <NTag size="tiny">客</NTag>
                        <span>{row.team2.name}</span>
                    </NFlex>
                </>
            )
        },
    },
    {
        key: 'period',
        title: '时段',
        width: 50,
        render: (row) => PERIOD_TEXT[row.period],
    },
    {
        key: 'variety',
        title: '玩法',
        width: 50,
        render: (row) => VARIETY_TEXT[row.variety],
    },
    {
        key: 'odd',
        title: '盘口',
        width: 80,
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
        key: 'created_at',
        title: '一次比对时间',
        width: 90,
        align: 'center',
        render: (row) => {
            if (!row.ready_at) return
            return dateTime(row.ready_at, 'M/D H:mm')
        },
    },
    {
        key: 'status',
        title: '状态',
        width: 90,
        render: (row) => {
            if (row.promoted) {
                return <NText type="success">已推荐</NText>
            }
            switch (row.status) {
                case 'ready':
                    return <NText type="info">等待对比</NText>
                default:
                    return <NText type="warning">等待一次比对</NText>
            }
        },
    },
    {
        key: 'promoted_status',
        title: '推荐状态',
        width: 80,
        render: (row) => {
            if (!row.promoted) return
            if (row.promoted.is_valid) {
                //有推荐
                return <NText type="success">推荐</NText>
            } else {
                switch (row.promoted.skip) {
                    case '':
                        return '筛选率过滤'
                    case 'manual_promote':
                        return '手动推荐优先'
                    case 'same_type':
                        return '同盘口过滤'
                    case 'setting':
                        return '规则过滤'
                }
            }
        },
    },
    {
        key: 'promoted_at',
        title: '推荐时间',
        width: 100,
        render: (row) => {
            if (!row.promoted) return
            return dateTime(row.promoted.created_at, 'M/D H:mm')
        },
    },
    {
        key: 'promoted.duration',
        title: '距离开赛',
        width: 80,
    },
    {
        key: 'promote',
        title: '推荐内容',
        width: 120,
        render: (row) => {
            if (!row.promoted) return
            const texts: string[] = []
            texts.push(ODD_TYPE_TEXT[row.promoted.type])
            if (['ah1', 'ah2'].includes(row.promoted.type)) {
                const condition = Decimal(row.promoted.condition)
                texts.push(`${condition.gt(0) ? '+' : ''}${condition.toString()}`)
            } else if (['over', 'under'].includes(row.promoted.type)) {
                texts.push(Decimal(row.promoted.condition).toString())
            }

            return (
                <NFlex align="center" size={4}>
                    {row.promoted.back ? (
                        <NTag type="error" size="tiny">
                            反推
                        </NTag>
                    ) : (
                        <NTag type="success" size="tiny">
                            正推
                        </NTag>
                    )}
                    <span>{texts.join(' ')}</span>
                </NFlex>
            )
        },
    },
    {
        key: 'promoted_value0',
        title: '正推水位',
        width: 70,
        render: (row) => {
            if (!row.promoted) return
            return Decimal(row.promoted.value0).toDP(4).toString()
        },
    },
    {
        key: 'promoted_value1',
        title: '反推水位',
        width: 70,
        render: (row) => {
            if (!row.promoted) return
            return Decimal(row.promoted.value1).toDP(4).toString()
        },
    },
    {
        key: 'promoted_value',
        title: '推荐水位',
        width: 100,
        render: (row) => {
            if (!row.promoted) return
            return Decimal(row.promoted.value).toDP(4).toString()
        },
    },
    {
        key: 'result',
        title: '结果',
        width: 80,
        render: (row) => {
            if (!row.promoted) return
            if (!row.promoted.result) return '待定'
            switch (row.promoted.result.result) {
                case -1:
                    return (
                        <NFlex size="small" align="center">
                            <NText type="error">输</NText>
                            <span>({row.promoted.result.score})</span>
                        </NFlex>
                    )
                case 1:
                    return (
                        <NFlex size="small" align="center">
                            <NText type="success">赢</NText>
                            <span>({row.promoted.result.score})</span>
                        </NFlex>
                    )
                default:
                    return (
                        <NFlex size="small" align="center">
                            <NText type="warning">和</NText>
                            <span>({row.promoted.result.score})</span>
                        </NFlex>
                    )
            }
        },
    },
    {
        key: 'actions',
        render: () => null,
    },
]
</script>
<template>
    <PageGrid :useContentScroller="false">
        <template #header>
            <NFlex :vertical="true">
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
                    <NFormItem label="时段">
                        <NSelect
                            v-model:value="filter.period"
                            :options="periodOptions"
                            :consistentMenuWidth="false"
                            :style="{ minWidth: '70px' }"
                            :clearable="true"
                            placeholder="所有"
                        />
                    </NFormItem>
                    <NFormItem label="玩法">
                        <NSelect
                            v-model:value="filter.variety"
                            :options="varietyOptions"
                            :consistentMenuWidth="false"
                            :style="{ minWidth: '70px' }"
                            :clearable="true"
                            placeholder="所有"
                        />
                    </NFormItem>
                    <NFormItem label="一次比对">
                        <NSelect
                            v-model:value="filter.ready_status"
                            :options="[
                                { value: 1, label: '成功' },
                                { value: 0, label: '失败' },
                            ]"
                            :consistentMenuWidth="false"
                            :style="{ minWidth: '70px' }"
                            :clearable="true"
                            placeholder="不限"
                        />
                    </NFormItem>
                    <NFormItem label="推荐">
                        <NSelect
                            v-model:value="filter.promoted"
                            :options="[
                                { value: 1, label: '推荐' },
                                { value: 2, label: '过滤的推荐' },
                                { value: 0, label: '未推荐' },
                            ]"
                            :consistentMenuWidth="false"
                            :style="{ minWidth: '70px' }"
                            :clearable="true"
                            placeholder="不限"
                        />
                    </NFormItem>
                    <NFormItem>
                        <NButton type="primary" :loading="loading" @click="applyFilter"
                            >查询</NButton
                        >
                    </NFormItem>
                    <NFormItem>
                        <NButton type="info" @click="doExport">导出</NButton>
                    </NFormItem>
                </NForm>
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
