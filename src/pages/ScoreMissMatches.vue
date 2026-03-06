<script setup lang="tsx">
import MatchScoreSetter from '@/components/MatchScoreSetter.vue'
import { ActionModal } from '@/components/modal'
import PageGrid from '@/components/PageGrid.vue'
import { api } from '@/libs/api'
import { dateTime, isNullOrUndefined, MATCH_ERROR_STATUS_TEXT, PERIOD_TEXT } from '@/libs/helpers'
import { useListLoader } from '@/libs/loader'
import { useDialog } from '@/libs/ui'
import dayjs from 'dayjs'
import { uniq } from 'lodash-es'
import {
    NButton,
    NDataTable,
    NFlex,
    NForm,
    NFormItem,
    NPagination,
    NSelect,
    NTag,
    NText,
    useMessage,
    type DataTableColumn,
} from 'naive-ui'
import { onMounted, reactive } from 'vue'

const { load, loading, list, pagination } = useListLoader<Match>({
    loader: (params) =>
        api<ListData<Match>>({
            url: '/admin/match/score_miss_list',
            data: {
                ...params,
            },
        }),
})

onMounted(() => load(1))

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
        key: 'error_status',
        title: '状态',
        width: 70,
        render: (row) => {
            if (!row.error_status) {
                return <NText type="success">正常</NText>
            }
            return <NText type="error">{MATCH_ERROR_STATUS_TEXT[row.error_status]}</NText>
        },
    },
    {
        key: 'periods',
        title: '缺失赛果',
        width: 70,
        render: (row) => {
            return uniq(row.periods.substring(1, row.periods.length - 1).split(','))
                .map((period) => PERIOD_TEXT[period as Period])
                .join(',')
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
        width: 370,
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
                    {!row.error_status && (
                        <NButton
                            type="error"
                            ghost={true}
                            size="small"
                            onClick={() => openErrorStatusModal(row)}
                        >
                            设置异常状态
                        </NButton>
                    )}
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

const message = useMessage()

const errorStatusModal = reactive({
    show: false,
    error_status: '' as MatchErrorStatus,
    match: null as unknown as Match,
    sending: false,
})

const openErrorStatusModal = (row: Match) => {
    errorStatusModal.match = row
    errorStatusModal.error_status = row.error_status
    errorStatusModal.show = true
}

const errorStatusOptions = Object.entries(MATCH_ERROR_STATUS_TEXT).map(([value, label]) => ({
    value,
    label,
}))

const dialog = useDialog()

const submitErrorStatus = async () => {
    if (errorStatusModal.error_status) {
        const close = await dialog.confirm({
            title: `确认要把这场比赛设置为${MATCH_ERROR_STATUS_TEXT[errorStatusModal.error_status]}？`,
            content: '设置了异常状态后不可恢复，且影响后续赛果结算',
        })
        if (!close) return
    }

    errorStatusModal.sending = true

    const ret = await api({
        url: '/admin/match/set_error_status',
        data: {
            match_id: errorStatusModal.match.id,
            error_status: errorStatusModal.error_status,
        },
    })
    if (ret.code) {
        message.error(ret.msg)
    } else {
        errorStatusModal.match.error_status = errorStatusModal.error_status
        errorStatusModal.show = false
    }
    errorStatusModal.sending = false
}
</script>
<template>
    <PageGrid :useContentScroller="false">
        <template #header>
            <NForm labelPlacement="left" :inline="true" :showFeedback="false" :disabled="loading">
                <NButton type="primary" :loading="loading" @click="() => load(1)">刷新</NButton>
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
        title="修改比赛异常状态"
        v-model:show="errorStatusModal.show"
        :data="errorStatusModal.match"
        :sending="errorStatusModal.sending"
        @positiveClick="submitErrorStatus"
        :style="{ width: '400px' }"
    >
        <NForm
            labelPlacement="left"
            labelWidth="80px"
            :disabled="errorStatusModal.sending"
            :showFeedback="false"
        >
            <NFlex :vertical="true" size="large">
                <NFormItem label="对阵球队"
                    >{{ errorStatusModal.match.team1.name }} vs
                    {{ errorStatusModal.match.team2.name }}</NFormItem
                >
                <NFormItem label="比赛时间">{{
                    dateTime(errorStatusModal.match.match_time)
                }}</NFormItem>
                <NFormItem label="异常状态">
                    <NSelect
                        v-model:value="errorStatusModal.error_status"
                        :options="errorStatusOptions"
                    />
                </NFormItem>
            </NFlex>
        </NForm>
    </ActionModal>
</template>
<style lang="less" scoped></style>
