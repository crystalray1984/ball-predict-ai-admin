<script setup lang="tsx">
import { ViewModal } from '@/components/modal'
import OddV3Records from '@/components/OddV3Records.vue'
import PageGrid from '@/components/PageGrid.vue'
import { api } from '@/libs/api'
import { ODD_TYPE_TEXT } from '@/libs/helpers'
import { useLoader } from '@/libs/loader'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import { omit, trim } from 'lodash-es'
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
    type DataTableColumn,
} from 'naive-ui'
import { computed, onBeforeUnmount, onMounted, reactive, ref, type Ref } from 'vue'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

interface Filter {
    tournament_id?: number
    team: string
    dates: [number, number]
    promoted?: number
    ready_status?: number
}

/**
 * 比赛数据
 */
interface OddData {
    id: number
    match_time: string
    team1: Team
    team2: Team
    tournament: Tournament
    surebet: OddSurebetData | null
    promoted: OddPromote[]
}

interface OddSurebetData {
    id: number
    variety: Variety
    type: OddType
    period: Period
    condition: string
    crown_value: string
    surebet_value: string
    ready_at: string
}

interface OddPromote {
    id: number
    variety: Variety
    type: OddType
    period: Period
    condition: string
    manual_promote_odd_id: number
    result1: number | null
    score1: number | null
    score2: number | null
    score: string
    value: string
    start_odd_data: PromoteOddData | null
    end_odd_data: PromoteOddData | null
}

interface PromoteOddData {
    time: number
    value: string
}

interface OddDataRow {
    key: string
    type: 'ah' | 'sum'
    main: Omit<OddData, 'promoted'>
    promoted: OddPromote | undefined
}

const message = useMessage()
const start = dayjs().startOf('day')
const end = dayjs().add(1, 'day').startOf('day')
const filter = reactive<Filter>({
    team: '',
    dates: [start.valueOf(), end.valueOf()],
    ready_status: 1,
})

const activeFilter = {
    team: '',
    start_date: start.format('YYYY-MM-DD') as string | undefined,
    end_date: end.format('YYYY-MM-DD') as string | undefined,
    ready_status: 1,
}

const { load, loading } = useLoader()

const list = ref([]) as Ref<OddData[]>

const rows = computed(() => {
    const rows: OddDataRow[] = []
    list.value.forEach((row) => {
        const main = omit(row, 'promoted')
        rows.push({
            key: `${main.id}:ah`,
            type: 'ah',
            main,
            promoted: row.promoted.find((t) => t.type === 'ah1' || t.type === 'ah2'),
        })
        rows.push({
            key: `${main.id}:sum`,
            type: 'sum',
            main,
            promoted: row.promoted.find((t) => t.type === 'under' || t.type === 'over'),
        })
    })
    return rows
})

const mergeFilter = (target: Record<string, any>) => {
    target.team = trim(filter.team)
    target.promoted = filter.promoted
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
        url: '/admin/odd_v3/list',
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

const columns = computed<DataTableColumn<OddDataRow>[]>(() => [
    {
        key: 'match_time',
        title: '比赛时间',
        width: 70,
        align: 'center',
        rowSpan: () => 2,
        render: (row) => dayjs(row.main.match_time).format('M/D HH:mm'),
    },
    {
        key: 'main.tournament.name',
        title: '联赛',
        width: 150,
        rowSpan: () => 2,
    },
    {
        key: 'team',
        title: '球队',
        width: 250,
        rowSpan: () => 2,
        render: (row) => (
            <>
                <NFlex align="center" size={4}>
                    <NTag size="tiny">主</NTag>
                    <span>{row.main.team1.name}</span>
                </NFlex>
                <NFlex align="center" size={4}>
                    <NTag size="tiny">客</NTag>
                    <span>{row.main.team2.name}</span>
                </NFlex>
            </>
        ),
    },
    {
        key: 'ready_status',
        title: '一次比对',
        align: 'center',
        width: 70,
        rowSpan: () => 2,
        render: (row) => {
            return row.main.surebet ? (
                <NText type="success">成功</NText>
            ) : (
                <NText type="error">失败</NText>
            )
        },
    },
    {
        key: 'ready_at',
        title: '一次时间',
        width: 70,
        align: 'center',
        rowSpan: () => 2,
        render: (row) => {
            return row.main.surebet ? dayjs(row.main.surebet.ready_at).format('M/D HH:mm:ss') : ''
        },
    },
    {
        key: 'type',
        title: '类型',
        width: 60,
        align: 'center',
        render: (row) => (row.type === 'ah' ? '让球' : '大小球'),
    },
    {
        key: 'odd',
        title: '盘口',
        width: 80,
        align: 'center',
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
            return texts.join(' ')
        },
    },
    {
        key: 'value',
        title: '推荐水位',
        width: 70,
        align: 'center',
        render: (row) => {
            if (!row.promoted) return
            return Number(row.promoted.value)
        },
    },
    {
        key: 'start_odd_time',
        title: '起点时间',
        width: 70,
        align: 'center',
        render: (row) => {
            if (!row.promoted || !row.promoted.start_odd_data) return
            return dayjs(row.promoted.start_odd_data.time).format('HH:mm:ss')
        },
    },
    {
        key: 'start_odd_value',
        title: '起点水位',
        width: 70,
        align: 'center',
        render: (row) => {
            if (!row.promoted || !row.promoted.start_odd_data) return
            return Number(row.promoted.start_odd_data.value)
        },
    },
    {
        key: 'end_odd_time',
        title: '终点时间',
        width: 70,
        align: 'center',
        render: (row) => {
            if (!row.promoted || !row.promoted.end_odd_data) return
            return dayjs(row.promoted.end_odd_data.time).format('HH:mm:ss')
        },
    },
    {
        key: 'end_odd_value',
        title: '终点水位',
        width: 70,
        align: 'center',
        render: (row) => {
            if (!row.promoted || !row.promoted.end_odd_data) return
            return Number(row.promoted.end_odd_data.value)
        },
    },
    {
        key: 'end_time_elasped',
        title: '距离开赛',
        width: 70,
        align: 'center',
        render: (row) => {
            if (!row.promoted || !row.promoted.end_odd_data) return
            const duration = dayjs.duration(
                dayjs(row.main.match_time).valueOf() - row.promoted.end_odd_data.time,
            )
            return `${duration.hours()}:${duration.minutes().toString().padStart(2, '0')}`
        },
    },
    {
        key: 'result',
        title: '结果',
        width: 80,
        render: (row) => {
            if (!row.promoted) return
            if (!row.promoted.result1) return '待定'
            switch (row.promoted.result1) {
                case -1:
                    return (
                        <NFlex size="small" align="center">
                            <NText type="error">输</NText>
                            <span>({row.promoted.score})</span>
                        </NFlex>
                    )
                case 1:
                    return (
                        <NFlex size="small" align="center">
                            <NText type="success">赢</NText>
                            <span>({row.promoted.score})</span>
                        </NFlex>
                    )
                default:
                    return (
                        <NFlex size="small" align="center">
                            <NText type="warning">和</NText>
                            <span>({row.promoted.score})</span>
                        </NFlex>
                    )
            }
        },
    },
    {
        key: 'actions',
        render: (row) => {
            if (!row.main.surebet) return
            return (
                <NFlex size="small" align="center">
                    <NButton
                        size="tiny"
                        type="primary"
                        ghost={true}
                        onClick={() => openOddRecords(row)}
                    >
                        盘口明细
                    </NButton>
                </NFlex>
            )
        },
    },
])

const oddRecordModal = reactive({
    show: false,
    data: null as CrownOdd[] | null,
    type: 'ah' as 'ah' | 'sum',
    team1: '',
    team2: '',
})

const openOddRecords = async (row: OddDataRow) => {
    oddRecordModal.data = null
    oddRecordModal.team1 = row.main.team1.name
    oddRecordModal.team2 = row.main.team2.name
    oddRecordModal.type = row.type
    oddRecordModal.show = true

    const ret = await api<CrownOdd[]>({
        url: '/admin/odd_v3/odd_records',
        data: {
            match_id: row.main.id,
            type: row.type,
        },
    })
    oddRecordModal.data = ret.data
}
</script>
<template>
    <PageGrid :useContentScroller="false">
        <template #header>
            <NForm labelPlacement="left" :inline="true" :showFeedback="false" :disabled="loading">
                <NFormItem label="日期">
                    <NDatePicker
                        type="daterange"
                        v-model:value="filter.dates"
                        :inputReadonly="true"
                    />
                </NFormItem>
                <NFormItem label="一次比对">
                    <NSelect
                        v-model:value="filter.ready_status"
                        :options="[
                            {
                                value: 1,
                                label: '比对成功',
                            },
                            {
                                value: 0,
                                label: '比对失败',
                            },
                        ]"
                        :consistentMenuWidth="false"
                        :clearable="true"
                        placeholder="所有"
                        :style="{ minWidth: '100px' }"
                    />
                </NFormItem>
                <NFormItem label="推荐">
                    <NSelect
                        v-model:value="filter.promoted"
                        :options="[
                            {
                                value: 1,
                                label: '已推荐',
                            },
                            {
                                value: 0,
                                label: '未推荐',
                            },
                        ]"
                        :consistentMenuWidth="false"
                        :clearable="true"
                        placeholder="所有"
                        :style="{ minWidth: '100px' }"
                    />
                </NFormItem>
                <NFormItem>
                    <NButton type="primary" :loading="loading" @click="applyFilter">查询</NButton>
                </NFormItem>
            </NForm>
        </template>
        <NDataTable
            :data="rows"
            :rowKey="(t) => t.key"
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

    <ViewModal
        v-model:show="oddRecordModal.show"
        :data="oddRecordModal.data"
        title="盘口明细"
        :style="{ width: '600px' }"
    >
        <OddV3Records :type="oddRecordModal.type" :list="oddRecordModal.data!" />
    </ViewModal>
</template>
