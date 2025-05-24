<script setup lang="tsx">
import AddPromoted from '@/components/AddPromoted.vue'
import MatchScoreSetter from '@/components/MatchScoreSetter.vue'
import PageGrid from '@/components/PageGrid.vue'
import { api } from '@/libs/api'
import {
    dateTime,
    FINAL_RULE_TEXT,
    ODD_TYPE_TEXT,
    PERIOD_TEXT,
    PROMOTE_RULE_TEXT,
    VARIETY_TEXT,
} from '@/libs/helpers'
import { useLoader } from '@/libs/loader'
import { useDialog } from '@/libs/ui'
import dayjs from 'dayjs'
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
    type SelectOption,
} from 'naive-ui'
import { onBeforeUnmount, onMounted, reactive, ref, type Ref } from 'vue'

interface Filter {
    tournament_id?: number
    team: string
    dates?: [number, number]
    variety?: string
    period?: string
    matched1?: number
    matched2?: number | string
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
    } & OddInfo
    has_score: number
    has_period1_score: number
    created_at: string
    ready_at: string | null
}

const start = dayjs().subtract(2, 'day').startOf('day')
const end = dayjs().add(1, 'day').startOf('day')
const message = useMessage()

const filter = reactive<Filter>({
    tournament_id: undefined,
    team: '',
    dates: [start.valueOf(), end.valueOf()],
})

const activeFilter = {
    tournament_id: undefined as undefined | number,
    team: '',
    start_date: start.format('YYYY-MM-DD') as string | undefined,
    end_date: end.format('YYYY-MM-DD') as string | undefined,
    matched1: undefined as number | undefined,
    matched2: undefined as number | string | undefined,
    variety: undefined as string | undefined,
    period: undefined as string | undefined,
    promoted: undefined as number | undefined,
}

const { load, loading } = useLoader()

const list = ref([]) as Ref<OddData[]>

const mergeFilter = (target: Record<string, any>) => {
    target.matched1 = filter.matched1
    target.matched2 = filter.matched2
    target.promoted = filter.promoted
    target.variety = filter.variety
    target.period = filter.period
    target.team = trim(filter.team)
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
        url: '/admin/odd/list',
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
    form.action = new URL('/admin/odd/export', import.meta.env.VITE_API_URL || location.href).href
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

const onAddPromoted = async (match_id: number, odd: OddInfo, orgOdd: OddData): Promise<boolean> => {
    const ret = await api({
        url: '/admin/odd/add',
        data: {
            match_id,
            odd_id: orgOdd.id,
            back: odd.type !== orgOdd.type ? 1 : 0,
        },
    })
    if (ret.code) {
        message.error(ret.msg)
        return false
    } else {
        await onMatchScoreUpdated(match_id)
        message.success('操作成功')
        return true
    }
}

const dialog = useDialog()

/**
 * 删除推荐
 * @param odd
 */
const removePromote = async (odd: OddData) => {
    if (!odd.promoted || !odd.promoted.is_valid) return
    const close = await dialog.confirmAndWait({
        title: '确认要删除这个推荐？',
    })
    if (!close) return

    const ret = await api({
        url: '/admin/odd/remove_promoted',
        data: {
            id: odd.promoted.id,
        },
    })
    if (ret.code) {
        message.warning(ret.msg)
    } else {
        await onMatchScoreUpdated(odd.match_id)
        message.success('操作成功')
    }
    close()
}

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
        key: 'surebet_value',
        title: '推送水位',
        width: 70,
        render: (row) => Decimal(row.surebet_value).toFixed(4),
    },
    {
        key: 'crown_value',
        title: '一次水位',
        width: 70,
        render: (row) => (row.crown_value ? Decimal(row.crown_value).toFixed(4) : ''),
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
        key: 'crown_condition2',
        title: '二次盘口',
        width: 70,
        render: (row) => {
            if (!row.crown_condition2) return
            const texts: string[] = []
            if (['ah1', 'ah2'].includes(row.type)) {
                const condition = Decimal(row.crown_condition2)
                texts.push(`${condition.gt(0) ? '+' : ''}${condition.toString()}`)
            } else if (['over', 'under'].includes(row.type)) {
                texts.push(Decimal(row.crown_condition2).toString())
            }
            return texts.join(' ')
        },
    },
    {
        key: 'crown_value2',
        title: '二次水位',
        width: 70,
        render: (row) => (row.crown_value2 ? Decimal(row.crown_value2).toFixed(4) : ''),
    },
    {
        key: 'status',
        title: '状态',
        width: 90,
        render: (row) => {
            switch (row.status) {
                case 'ready':
                    return <NText type="info">等待二次比对</NText>
                case 'promoted':
                    return <NText type="success">二次比对成功</NText>
                case 'ignored':
                    return <NText type="error">二次比对失败</NText>
                default:
                    return <NText type="warning">一次比对失败</NText>
            }
        },
    },
    {
        key: 'final_rule',
        title: '二次比对规则',
        width: 90,
        render: (row) => {
            if (row.status !== 'promoted') return
            return FINAL_RULE_TEXT[row.final_rule]
        },
    },
    {
        key: 'promoted_status',
        title: '推荐',
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
        key: 'promote_rule',
        title: '推荐规则',
        width: 80,
        render: (row) => (row.promoted ? PROMOTE_RULE_TEXT[row.promoted.final_rule] : ''),
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
        title: '操作',
        width: 180,
        render: (row) => {
            const allowSetResult = (() => {
                if (row.has_score) return false
                if (row.has_period1_score && row.period === 'period1') return false
                if (!row.promoted) return false
                return true
            })()

            const allowAdd = (() => {
                if (row.status === 'ready') return false
                if (!row.has_score) return false
                if (!row.promoted) return true
                if (row.promoted.is_valid) return false
                if (row.promoted.skip === 'manual_promote') return false
                if (row.promoted.skip === 'same_type') return false
                return true
            })()

            const allowRemove = !!row.promoted && !!row.promoted.is_valid

            return (
                <NFlex align="center" size={4}>
                    <MatchScoreSetter onSuccess={onMatchScoreUpdated}>
                        {{
                            default: ({ open }: { open(id: number, period1?: boolean): void }) => (
                                <NButton
                                    type="info"
                                    ghost={true}
                                    size="tiny"
                                    style={{
                                        visibility: allowSetResult ? 'visible' : 'hidden',
                                    }}
                                    onClick={() => open(row.match_id, row.period === 'period1')}
                                >
                                    设赛果
                                </NButton>
                            ),
                        }}
                    </MatchScoreSetter>

                    <AddPromoted onSubmit={(match_id, info) => onAddPromoted(match_id, info, row)}>
                        {{
                            default: ({
                                open,
                            }: {
                                open: (match_id: number, odd?: OddInfo) => void
                            }) => (
                                <NButton
                                    type="warning"
                                    ghost={true}
                                    size="tiny"
                                    style={{
                                        visibility: allowAdd ? 'visible' : 'hidden',
                                    }}
                                    onClick={() => addPromote(open, row)}
                                >
                                    补推荐
                                </NButton>
                            ),
                        }}
                    </AddPromoted>

                    <NButton
                        type="error"
                        ghost={true}
                        size="tiny"
                        style={{
                            visibility: allowRemove ? 'visible' : 'hidden',
                        }}
                        onClick={() => removePromote(row)}
                    >
                        删推荐
                    </NButton>
                </NFlex>
            )
        },
    },
]

const onMatchScoreUpdated = async (match_id: number) => {
    const ret = await api<OddData[]>({
        url: '/admin/odd/list_by_match',
        data: {
            match_id,
        },
    })
    if (ret.code) return
    ret.data.forEach((odd) => {
        const index = list.value.findIndex((t) => t.id === odd.id)
        if (index !== -1) {
            list.value.splice(index, 1, odd)
        }
    })
}

/**
 * 补推荐
 */
const addPromote = (
    handler: (
        match_id: number,
        odd?: OddInfo,
        allowChange?: boolean,
        allowReverse?: boolean,
    ) => void,
    odd: OddData,
) => {
    if (odd.promoted) {
        //有推荐的，就按推荐的内容生成，不允许修改
        handler(
            odd.match_id,
            {
                variety: odd.promoted.variety,
                type: odd.promoted.type,
                period: odd.promoted.period,
                condition: odd.promoted.condition,
            },
            false,
            false,
        )
    } else {
        //没有推荐，按原始盘口的正推生成
        handler(
            odd.match_id,
            {
                variety: odd.variety,
                period: odd.period,
                type: odd.type,
                condition: odd.condition,
            },
            false,
            true,
        )
    }
}
</script>
<template>
    <PageGrid :useContentScroller="false">
        <template #header>
            <NForm labelPlacement="left" :inline="true" :disabled="loading" :showFeedback="false">
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
                        v-model:value="filter.matched1"
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
                <NFormItem label="二次比对">
                    <NSelect
                        v-model:value="filter.matched2"
                        :options="[
                            { value: 1, label: '成功' },
                            { value: 'crown', label: '成功:水位' },
                            { value: 'crown_special', label: '成功:变盘' },
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
                    <NButton type="primary" :loading="loading" @click="applyFilter">查询</NButton>
                </NFormItem>
                <NFormItem>
                    <NButton type="info" @click="doExport">导出</NButton>
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
<style lang="less" scoped></style>
