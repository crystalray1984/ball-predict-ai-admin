<script setup lang="tsx">
import PageGrid from '@/components/PageGrid.vue'
import { api } from '@/libs/api'
import { ODD_TYPE_TEXT, PERIOD_TEXT, VARIETY_TEXT } from '@/libs/helpers'
import { useLoader } from '@/libs/loader'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import Decimal from 'decimal.js'
import {
    NButton,
    NCard,
    NCheckbox,
    NDataTable,
    NDatePicker,
    NFlex,
    NForm,
    NFormItem,
    NSelect,
    NStatistic,
    NSwitch,
    NTag,
    NText,
    useMessage,
    type DataTableColumn,
} from 'naive-ui'
import { computed, onBeforeUnmount, onMounted, reactive, ref, type Ref } from 'vue'

dayjs.extend(duration)

interface Filter {
    dates: [number, number]
    order: string
    promote?: number
    auto_hide?: boolean
}

/**
 * 比赛数据
 */
interface OddData {
    id: number
    match_time: string
    team1_name: string
    team2_name: string
    tournament_name: string

    source_variety: Variety
    source_type: OddType
    source_period: Period
    source_condition: string
    source_value: string

    variety: Variety
    type: OddType
    period: Period
    condition: string
    value: string
    created_at: string
    is_open: number

    result: number | null
    score1: number | null
    score2: number | null
    score: string

    promoted_at: string | null
    promoted_value: string | null

    updating?: boolean
}

interface SummaryData {
    win: number
    loss: number
    draw: number
    total: number
    win_rate: number
}

const message = useMessage()
const start = dayjs().startOf('day')
const end = dayjs().add(1, 'day').startOf('day')
const filter = reactive<Filter>({
    dates: [start.valueOf(), end.valueOf()],
    order: 'promote_time',
    auto_hide: true,
})

const activeFilter = {
    start_date: start.format('YYYY-MM-DD') as string | undefined,
    end_date: end.format('YYYY-MM-DD') as string | undefined,
    order: 'promote_time',
    auto_hide: true,
}

const { load, loading } = useLoader()

const list = ref([]) as Ref<OddData[]>

const summary = computed<SummaryData>(() => {
    let win = 0
    let loss = 0
    let draw = 0

    const filtered = list.value.filter((t) => !!t.promoted_at)

    filtered.forEach((row) => {
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
        total: filtered.length,
    }
})

const mergeFilter = (target: Record<string, any>) => {
    target.promote = filter.promote
    target.order = filter.order
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
        url: '/admin/rockball/list',
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
        timer = setInterval(loadData, 60000)
    }
}

onMounted(applyFilter)

const columns = computed<DataTableColumn<OddData>[]>(() => [
    {
        key: 'match_time',
        title: '比赛时间',
        width: 70,
        align: 'center',
        render: (row) => dayjs(row.match_time).format('M/D HH:mm'),
    },
    {
        key: 'tournament_name',
        title: '联赛',
        width: 150,
    },
    {
        key: 'team',
        title: '球队',
        width: 250,
        render: (row) => (
            <>
                <NFlex align="center" size={4}>
                    <NTag size="tiny">主</NTag>
                    <span>{row.team1_name}</span>
                </NFlex>
                <NFlex align="center" size={4}>
                    <NTag size="tiny">客</NTag>
                    <span>{row.team2_name}</span>
                </NFlex>
            </>
        ),
    },
    {
        key: 'source',
        title: '触发条件',
        width: 140,
        render: (row) => {
            const texts: string[] = []
            texts.push(PERIOD_TEXT[row.source_period])
            texts.push(VARIETY_TEXT[row.source_variety])
            texts.push(ODD_TYPE_TEXT[row.source_type])
            if (['ah1', 'ah2'].includes(row.source_type)) {
                const condition = Decimal(row.source_condition)
                texts.push(`${condition.gt(0) ? '+' : ''}${condition.toString()}`)
            } else if (['over', 'under'].includes(row.source_type)) {
                texts.push(Decimal(row.source_condition).toString())
            }

            return (
                <>
                    <div>{texts.join(' ')}</div>
                    <div>{'水位=' + Number(row.source_value)}</div>
                </>
            )
        },
    },
    {
        key: 'created_at',
        title: '匹配时间',
        width: 70,
        align: 'center',
        render: (row) => {
            return dayjs(row.created_at).format('M/D HH:mm:ss')
        },
    },
    {
        key: 'odd',
        title: '追踪盘口',
        width: 140,
        render: (row) => {
            const texts: string[] = []
            texts.push(PERIOD_TEXT[row.period])
            texts.push(VARIETY_TEXT[row.variety])
            texts.push(ODD_TYPE_TEXT[row.type])
            if (['ah1', 'ah2'].includes(row.type)) {
                const condition = Decimal(row.condition)
                texts.push(`${condition.gt(0) ? '+' : ''}${condition.toString()}`)
            } else if (['over', 'under'].includes(row.type)) {
                texts.push(Decimal(row.condition).toString())
            }

            return (
                <>
                    <div>{texts.join(' ')}</div>
                    <div>{'水位≥' + Number(row.value)}</div>
                </>
            )
        },
    },
    {
        key: 'is_open',
        title: '是否推送',
        width: 70,
        render: (row) => (
            <NSwitch
                value={row.is_open}
                checkedValue={1}
                uncheckedValue={0}
                disabled={row.updating}
                onUpdateValue={(is_open: number) => setIsOpen(row, is_open)}
            />
        ),
    },
    {
        key: 'value',
        title: '推荐水位',
        width: 70,
        align: 'center',
        render: (row) => {
            if (!row.promoted_at) return
            return Number(row.promoted_value)
        },
    },
    {
        key: 'promoted_at',
        title: '推荐时间',
        width: 70,
        align: 'center',
        render: (row) => {
            if (!row.promoted_at) return
            return dayjs(row.promoted_at).format('M/D HH:mm:ss')
        },
    },
    {
        key: 'result',
        title: '结果',
        width: 80,
        render: (row) => {
            if (row.result === null) return '待定'
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
    {
        key: 'actions',
    },
])

/**
 * 导出
 */
const doExport = () => {
    const params = {}
    mergeFilter(params)

    const form = document.createElement('form')
    form.style.display = 'none'
    form.target = '_blank'
    form.method = 'POST'
    form.action = new URL(
        '/admin/rockball/export',
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

const setIsOpen = async (row: OddData, is_open: number) => {
    row.updating = true
    const ret = await api({
        url: '/admin/rockball/set_is_open',
        data: {
            id: row.id,
            is_open,
        },
    })
    if (ret.code === 0) {
        row.is_open = is_open
    }
    row.updating = false
}
</script>
<template>
    <PageGrid :useContentScroller="false">
        <template #header>
            <NFlex :vertical="true">
                <NForm
                    labelPlacement="left"
                    :inline="true"
                    :showFeedback="false"
                    :disabled="loading"
                >
                    <NFormItem label="日期">
                        <NDatePicker
                            type="daterange"
                            v-model:value="filter.dates"
                            :inputReadonly="true"
                        />
                    </NFormItem>
                    <NFormItem label="推荐状态">
                        <NSelect
                            v-model:value="filter.promote"
                            :options="[
                                {
                                    value: 1,
                                    label: '有推荐',
                                },
                                {
                                    value: 0,
                                    label: '未推荐',
                                },
                            ]"
                            :consistentMenuWidth="false"
                            :style="{ minWidth: '100px' }"
                            :clearable="true"
                            placeholder="所有"
                        />
                    </NFormItem>
                    <NFormItem label="排序">
                        <NSelect
                            v-model:value="filter.order"
                            :options="[
                                {
                                    value: 'match_time',
                                    label: '比赛时间',
                                },
                                {
                                    value: 'promote_time',
                                    label: '推荐时间',
                                },
                            ]"
                            :consistentMenuWidth="false"
                            :style="{ minWidth: '100px' }"
                        />
                    </NFormItem>
                    <NFormItem>
                        <NCheckbox v-model:checked="filter.auto_hide"
                            >自动隐藏到期未匹配的记录</NCheckbox
                        >
                    </NFormItem>
                    <NFormItem>
                        <NButton type="primary" :loading="loading" @click="applyFilter"
                            >查询</NButton
                        >
                    </NFormItem>
                    <NFormItem>
                        <NButton type="warning" :disabled="loading" @click="doExport">导出</NButton>
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
