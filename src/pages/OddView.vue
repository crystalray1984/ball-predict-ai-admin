<script setup lang="tsx">
import PageGrid from '@/components/PageGrid.vue'
import { api } from '@/libs/api'
import { FINAL_RULE_TEXT, ODD_TYPE_TEXT, PERIOD_TEXT, VARIETY_TEXT } from '@/libs/helpers'
import { useLoader } from '@/libs/loader'
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
import { onMounted, reactive, ref, type Ref } from 'vue'

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
        result: {
            result: number
            score: string
        } | null
        back: number
        skip: PromotedSkip
        is_valid: number
        score: string
    } & OddInfo
    has_score: number
    has_period1_score: number
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

const applyFilter = async () => {
    activeFilter.matched1 = filter.matched1
    activeFilter.matched2 = filter.matched2
    activeFilter.promoted = filter.promoted
    activeFilter.variety = filter.variety
    activeFilter.period = filter.period
    activeFilter.team = trim(filter.team)
    if (filter.dates) {
        activeFilter.start_date = dayjs(filter.dates[0]).format('YYYY-MM-DD')
        activeFilter.end_date = dayjs(filter.dates[1]).format('YYYY-MM-DD')
    } else {
        activeFilter.start_date = activeFilter.end_date = undefined
    }

    const ret = await load(() =>
        api<OddData[]>({
            url: '/admin/odd/list',
            data: activeFilter,
        }),
    )

    if (ret.code) {
        message.warning(ret.msg)
    } else {
        list.value = ret.data
    }
}

onMounted(applyFilter)

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
        width: 80,
        align: 'center',
        render: (row) => dayjs(row.match_time).format('M/D H:mm'),
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
        render: (row) => PERIOD_TEXT[row.period],
    },
    {
        key: 'variety',
        title: '玩法',
        render: (row) => VARIETY_TEXT[row.variety],
    },
    {
        key: 'odd',
        title: '盘口',
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
        key: 'result',
        title: '结果',
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
        render: (row) => {
            const allowSetResult = (() => {
                if (row.has_score) return false
                if (row.has_period1_score && row.period === 'period1') return false
                if (!row.promoted) return false
                return true
            })()

            const allowAdd = (() => {
                if (!row.promoted) return true
                if (row.promoted.is_valid) return false
                if (row.promoted.skip === 'manual_promote') return false
                if (row.promoted.skip === 'same_type') return false
                return true
            })()

            return (
                <NFlex align="center" size={4}>
                    <NButton
                        type="info"
                        ghost={true}
                        size="small"
                        style={{
                            visibility: allowSetResult ? 'visible' : 'hidden',
                        }}
                    >
                        设置赛果
                    </NButton>
                    <NButton
                        type="warning"
                        ghost={true}
                        size="small"
                        style={{
                            visibility: allowAdd ? 'visible' : 'hidden',
                        }}
                    >
                        加入推荐
                    </NButton>
                </NFlex>
            )
        },
    },
]
</script>
<template>
    <PageGrid :useContentScroller="false">
        <template #header>
            <NForm labelPlacement="left" :inline="true" :disabled="loading" :showFeedback="false">
                <NFormItem label="日期范围">
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
                            { value: 'titan007', label: '成功:球探网趋势' },
                            { value: 'crown', label: '成功:皇冠水位' },
                            { value: 'crown_special', label: '成功:皇冠变盘' },
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
                <NButton type="primary" :loading="loading" @click="applyFilter">查询</NButton>
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
        />
    </PageGrid>
</template>
<style lang="less" scoped></style>
