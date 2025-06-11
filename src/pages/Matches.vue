<script setup lang="tsx">
import ConditionSelect from '@/components/ConditionSelect'
import MatchScoreSetter from '@/components/MatchScoreSetter.vue'
import { ActionModal } from '@/components/modal'
import PageGrid from '@/components/PageGrid.vue'
import TournamentSelect from '@/components/TournamentSelect'
import { api } from '@/libs/api'
import {
    date,
    dateTime,
    isNullOrUndefined,
    ODD_TYPE_TEXT,
    PERIOD_TEXT,
    VARIETY_TEXT,
} from '@/libs/helpers'
import { useListLoader } from '@/libs/loader'
import dayjs from 'dayjs'
import { trim } from 'lodash-es'
import {
    NButton,
    NCol,
    NDataTable,
    NDatePicker,
    NFlex,
    NForm,
    NFormItem,
    NInput,
    NPagination,
    NRow,
    NSelect,
    NTag,
    useMessage,
    type DataTableColumn,
} from 'naive-ui'
import { onMounted, reactive } from 'vue'

interface Filter {
    tournament_id?: number
    team: string
    dates?: [number, number]
}

const start = dayjs().subtract(6, 'day').startOf('day')
const end = dayjs().add(1, 'day').startOf('day')

const filter = reactive<Filter>({
    tournament_id: undefined,
    team: '',
    dates: [start.valueOf(), end.valueOf()],
})

const activeFilter = {
    tournament_id: undefined as number | undefined,
    team: '',
    start_date: date(start) as string | undefined,
    end_date: date(end) as string | undefined,
}

const { load, loading, list, pagination } = useListLoader<Match>({
    loader: (params) =>
        api<ListData<Match>>({
            url: '/admin/match/match_list',
            data: {
                ...activeFilter,
                ...params,
            },
        }),
})

const applyFilter = () => {
    activeFilter.tournament_id = filter.tournament_id
    activeFilter.team = trim(filter.team)
    if (filter.dates) {
        activeFilter.start_date = date(filter.dates[0])
        activeFilter.end_date = date(filter.dates[1])
    } else {
        activeFilter.start_date = undefined
        activeFilter.end_date = undefined
    }
    load(1)
}

onMounted(applyFilter)

const columns: DataTableColumn<Match>[] = [
    {
        key: 'match_time',
        title: '时间',
        width: 80,
        align: 'center',
        render: (row) => dayjs(row.match_time).format('M/D H:mm'),
    },
    {
        key: 'tournament.name',
        title: '赛事',
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
        key: 'score_period1_goal',
        title: '半场比分',
        align: 'center',
        render: (row) => {
            if (!row.has_period1_score) return
            return `${row.score1_period1}:${row.score2_period1}`
        },
    },
    {
        key: 'score_period1_corner',
        title: '半场角球',
        align: 'center',
        render: (row) => {
            if (
                !row.has_period1_score ||
                isNullOrUndefined(row.corner1_period1) ||
                isNullOrUndefined(row.corner2_period1)
            )
                return
            return `${row.corner1_period1}:${row.corner2_period1}`
        },
    },
    {
        key: 'score_goal',
        title: '全场比分',
        align: 'center',
        render: (row) => {
            if (!row.has_score) return
            return `${row.score1}:${row.score2}`
        },
    },
    {
        key: 'score_corner',
        title: '全场角球',
        align: 'center',
        render: (row) => {
            if (
                !row.has_period1_score ||
                isNullOrUndefined(row.corner1) ||
                isNullOrUndefined(row.corner2)
            )
                return
            return `${row.corner1}:${row.corner2}`
        },
    },
    {
        key: 'actions',
        title: '操作',
        align: 'center',
        render: (row) => {
            return (
                <NFlex align="center" size="small">
                    <MatchScoreSetter onSuccess={reloadMatch}>
                        {{
                            default: ({ open }: { open(id: number): void }) => (
                                <NButton
                                    type="primary"
                                    ghost={true}
                                    size="small"
                                    onClick={() => open(row.id)}
                                >
                                    设置赛果
                                </NButton>
                            ),
                        }}
                    </MatchScoreSetter>
                    <NButton
                        type="warning"
                        ghost={true}
                        size="small"
                        onClick={() => createSinglePromote(row)}
                    >
                        手动推荐
                    </NButton>
                </NFlex>
            )
        },
    },
]

/**
 * 重新加载比赛数据
 * @param id
 */
const reloadMatch = async (id: number) => {
    const ret = await api<Match>({
        url: '/admin/match/match',
        data: {
            id,
        },
    })
    if (ret.code) return
    const index = list.value.findIndex((t) => t.id === id)
    if (index !== -1) {
        list.value.splice(index, 1, ret.data)
    }
}

const periodOptions = Object.entries(PERIOD_TEXT).map(([value, label]) => ({ value, label }))
const varietyOptions = Object.entries(VARIETY_TEXT).map(([value, label]) => ({ value, label }))
const oddTypeOptions = Object.entries(ODD_TYPE_TEXT)
    .filter((t) => t[0] !== 'draw')
    .map(([value, label]) => ({ value, label }))

const singlePromoteModal = reactive({
    show: false,
    data: null as unknown as EditingManualPromoteOdd,
    match: null as unknown as Match,
    sending: false,
})

/**
 * 创建单场推荐
 */
const createSinglePromote = (match: Match) => {
    singlePromoteModal.match = match
    singlePromoteModal.data = {
        match_id: match.id,
        variety: 'goal',
        period: 'regularTime',
        type: 'ah1',
        condition: '0',
        type2: null,
        condition2: null,
    }
    singlePromoteModal.show = true
}

const message = useMessage()

/**
 * 提交单场推荐
 */
const submitSinglePromote = async () => {
    //创建推荐
    singlePromoteModal.sending = true
    const ret = await api({
        url: '/admin/manual_promote/create',
        data: {
            type: 'single',
            odds: [singlePromoteModal.data],
        },
    })
    if (ret.code) {
        message.error(ret.msg)
        singlePromoteModal.sending = false
    } else {
        message.success('添加推荐成功')
        singlePromoteModal.sending = singlePromoteModal.show = false
    }
}
</script>
<template>
    <PageGrid :useContentScroller="false">
        <template #header>
            <NForm labelPlacement="left" :inline="true" :showFeedback="false" :disabled="loading">
                <NFormItem label="赛事">
                    <TournamentSelect
                        v-model:value="filter.tournament_id"
                        placeholder="所有赛事"
                        :consistentMenuWidth="false"
                        :style="{ minWidth: '100px' }"
                        :clearable="true"
                    />
                </NFormItem>
                <NFormItem label="球队">
                    <NInput
                        v-model:value="filter.team"
                        placeholder="搜索球队名称"
                        :clearable="true"
                    />
                </NFormItem>
                <NFormItem label="日期">
                    <NDatePicker
                        type="daterange"
                        v-model:value="filter.dates"
                        :inputReadonly="true"
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
            maxHeight="100%"
        />
        <template #footer>
            <NPagination v-bind="pagination" />
        </template>
    </PageGrid>

    <ActionModal
        title="添加手动推荐"
        v-model:show="singlePromoteModal.show"
        :data="singlePromoteModal.data"
        :sending="singlePromoteModal.sending"
        :style="{ width: '600px' }"
        @positiveClick="submitSinglePromote"
    >
        <NForm
            labelPlacement="left"
            labelWidth="80px"
            :disabled="singlePromoteModal.sending"
            :showFeedback="false"
        >
            <NFlex :vertical="true" size="large">
                <NFormItem label="比赛时间">{{
                    dateTime(singlePromoteModal.match.match_time)
                }}</NFormItem>
                <NFormItem label="对阵球队"
                    >{{ singlePromoteModal.match.team1.name }} vs
                    {{ singlePromoteModal.match.team2.name }}</NFormItem
                >
                <NRow :gutter="12">
                    <NCol :span="12">
                        <NFormItem label="时段">
                            <NSelect
                                v-model:value="singlePromoteModal.data.period"
                                :options="periodOptions"
                            />
                        </NFormItem>
                    </NCol>
                    <NCol :span="12">
                        <NFormItem label="玩法">
                            <NSelect
                                v-model:value="singlePromoteModal.data.variety"
                                :options="varietyOptions"
                            />
                        </NFormItem>
                    </NCol>
                </NRow>
                <NRow :gutter="12">
                    <NCol :span="12">
                        <NFormItem label="方向">
                            <NSelect
                                v-model:value="singlePromoteModal.data.type"
                                :options="oddTypeOptions"
                            />
                        </NFormItem>
                    </NCol>
                    <NCol :span="12">
                        <NFormItem label="盘口">
                            <ConditionSelect
                                v-model:value="singlePromoteModal.data.condition"
                                :oddType="singlePromoteModal.data.type"
                            />
                        </NFormItem>
                    </NCol>
                </NRow>
            </NFlex>
        </NForm>
    </ActionModal>
</template>
<style lang="less" scoped></style>
