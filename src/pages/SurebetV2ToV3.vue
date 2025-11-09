<script setup lang="tsx">
import PageGrid from '@/components/PageGrid.vue'
import { api } from '@/libs/api'
import { ODD_TYPE_TEXT } from '@/libs/helpers'
import { useLoader } from '@/libs/loader'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import Decimal from 'decimal.js'
import { trim } from 'lodash-es'
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

dayjs.extend(duration)

interface Filter {
    dates: [number, number]
    order: string
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
    variety: Variety
    type: OddType
    period: Period
    condition: string
    value: string
    back: number
    result: number | null
    score1: number | null
    score2: number | null
    score: string
    created_at: string
    odd_type: 'ah' | 'sum'
}

const message = useMessage()
const start = dayjs().startOf('day')
const end = dayjs().add(1, 'day').startOf('day')
const filter = reactive<Filter>({
    dates: [start.valueOf(), end.valueOf()],
    order: 'promote_time',
})

const activeFilter = {
    start_date: start.format('YYYY-MM-DD') as string | undefined,
    end_date: end.format('YYYY-MM-DD') as string | undefined,
    order: 'promote_time',
}

const { load, loading } = useLoader()

const list = ref([]) as Ref<OddData[]>

const mergeFilter = (target: Record<string, any>) => {
    target.order = trim(filter.order)
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
        url: '/admin/v2_to_v3/list',
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
        key: 'tournament.name',
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
                    <span>{row.team1.name}</span>
                </NFlex>
                <NFlex align="center" size={4}>
                    <NTag size="tiny">客</NTag>
                    <span>{row.team2.name}</span>
                </NFlex>
            </>
        ),
    },
    {
        key: 'type',
        title: '类型',
        width: 60,
        align: 'center',
        render: (row) => (row.odd_type === 'ah' ? '让球' : '大小球'),
    },
    {
        key: 'back',
        title: '正反推',
        width: 60,
        align: 'center',
        render: (row) => (row.back ? '反推' : '正推'),
    },
    {
        key: 'odd',
        title: '盘口',
        width: 80,
        align: 'center',
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
        width: 70,
        align: 'center',
        render: (row) => Number(row.value),
    },
    {
        key: 'created_at',
        title: '推荐时间',
        width: 70,
        align: 'center',
        render: (row) => {
            return dayjs(row.created_at).format('M/D HH:mm:ss')
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
        '/admin/v2_to_v3/export',
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
                    <NButton type="primary" :loading="loading" @click="applyFilter">查询</NButton>
                </NFormItem>
                <NFormItem>
                    <NButton type="warning" :disabled="loading" @click="doExport">导出</NButton>
                </NFormItem>
            </NForm>
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
