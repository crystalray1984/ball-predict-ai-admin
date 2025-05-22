<script setup lang="tsx">
import MatchScoreSetter from '@/components/MatchScoreSetter.vue'
import PageGrid from '@/components/PageGrid.vue'
import TournamentSelect from '@/components/TournamentSelect'
import { api } from '@/libs/api'
import { date, isNullOrUndefined } from '@/libs/helpers'
import { useListLoader } from '@/libs/loader'
import dayjs from 'dayjs'
import { trim } from 'lodash-es'
import {
    NButton,
    NDataTable,
    NDatePicker,
    NFlex,
    NForm,
    NFormItem,
    NInput,
    NPagination,
    NTag,
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
</template>
<style lang="less" scoped></style>
