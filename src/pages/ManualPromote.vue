<script setup lang="tsx">
import PageGrid from '@/components/PageGrid.vue'
import { api } from '@/libs/api'
import { ODD_TYPE_TEXT, PERIOD_TEXT, VARIETY_TEXT } from '@/libs/helpers'
import { useListLoader } from '@/libs/loader'
import { useDialog } from '@/libs/ui'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import {
    NButton,
    NCard,
    NDataTable,
    NFlex,
    NForm,
    NFormItem,
    NPagination,
    NTag,
    NText,
    useMessage,
    type DataTableColumn,
} from 'naive-ui'

const { list, loading, load, pagination, page } = useListLoader<ManualPromoteRecord>({
    loader: (params) =>
        api({
            url: '/admin/manual_promote/list',
            data: {
                ...params,
            },
        }),
})

const applyFilter = () => {
    load(1)
}

const columns: DataTableColumn<ManualPromoteOdd>[] = [
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
        key: 'status',
        title: '状态',
        width: 80,
        render: (row) => {
            if (row.promoted_odd_id === -1) {
                return <NText type="warning">跳过</NText>
            } else if (row.promoted_odd_id > 0) {
                return <NText type="success">已推荐</NText>
            } else {
                return '待推荐'
            }
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
        title: '操作',
        width: 180,
        render: (row) => {
            return (
                <NFlex align="center" size={4}>
                    <NButton
                        type="error"
                        ghost={true}
                        size="tiny"
                        style={{
                            visibility: row.promoted_odd_id === 0 ? 'visible' : 'hidden',
                        }}
                        onClick={() => remove(row.record_id, row.id)}
                    >
                        取消推荐
                    </NButton>
                </NFlex>
            )
        },
    },
]

const dialog = useDialog()
const message = useMessage()
/**
 * 取消推荐
 */
const remove = async (id: number, odd_id?: number) => {
    const close = await dialog.confirmAndWait({
        title: '确认取消这场推荐？',
    })
    if (!close) return
    const ret = await api({
        url: '/admin/manual_promote/remove',
        data: {
            id,
            odd_id,
        },
    })
    if (ret.code) {
        message.error(ret.msg)
    } else {
        await load(page.value)
        message.success('删除成功')
    }
    close()
}
</script>
<template>
    <PageGrid>
        <template #header>
            <NForm labelPlacement="left" :inline="true" :showFeedback="false" :disabled="loading">
                <NFormItem>
                    <NButton type="primary" :loading="loading" @click="applyFilter">刷新</NButton>
                </NFormItem>
                <!-- <NFormItem>
                    <NButton type="warning">添加推荐</NButton>
                </NFormItem> -->
            </NForm>
        </template>
        <div class="list">
            <NCard
                v-for="record in list"
                :key="record.id"
                size="small"
                :contentStyle="{ padding: 0 }"
            >
                <template #header>
                    #{{ record.id }}
                    <span v-if="record.type === 'single'">单场推荐</span>
                    <span v-else-if="record.type === 'chain'">串场推荐</span>
                </template>
                <NDataTable
                    :data="record.odds"
                    :rowKey="(t) => t.id"
                    :columns="columns"
                    :pagination="false"
                    size="small"
                    :striped="true"
                    :bordered="false"
                    :singleLine="false"
                />
            </NCard>
        </div>
        <template #footer>
            <NPagination v-bind="pagination" />
        </template>
    </PageGrid>
</template>
<style lang="less" scoped>
.list {
    padding: 0 12px;

    .n-card + .n-card {
        margin-top: 12px;
    }
}
</style>
