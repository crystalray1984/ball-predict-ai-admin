<script setup lang="tsx">
import PageGrid from '@/components/PageGrid.vue'
import { api } from '@/libs/api'
import { useLoader } from '@/libs/loader'
import { trim } from 'lodash-es'
import {
    NButton,
    NDataTable,
    NForm,
    NFormItem,
    NInput,
    NSelect,
    NSwitch,
    type DataTableColumn,
} from 'naive-ui'
import { onMounted, reactive, ref, type Ref } from 'vue'

const filter = reactive({
    name: '',
    order: 'name:asc',
})

const { load, loading } = useLoader()
const list = ref([]) as Ref<Tournament[]>

const applyFilter = async () => {
    const data: Record<string, any> = {
        name: trim(filter.name),
    }
    if (filter.order) {
        const [order_field, order_order] = filter.order.split(':')
        data.order_field = order_field
        data.order_order = order_order
    }

    const ret = await load(() =>
        api<Tournament[]>({
            url: '/admin/match/tournament_list',
            data,
        }),
    )
    list.value = ret.data ?? []
}

onMounted(applyFilter)

const onToggleOpen = async (item: Tournament, is_open: number) => {
    item.is_updating = true
    await api({
        url: '/admin/match/tournament_toggle_open',
        data: {
            id: item.id,
            is_open,
        },
    })
    item.is_open = 1 - item.is_open
    item.is_updating = false
}

const columns: DataTableColumn<Tournament>[] = [
    {
        key: 'id',
        title: '赛事ID',
    },
    {
        key: 'name',
        title: '赛事名称',
    },
    {
        key: 'is_open',
        title: '允许推荐',
        render: (row) => (
            <NSwitch
                size="small"
                checkedValue={1}
                uncheckedValue={0}
                value={row.is_open}
                loading={row.is_updating}
                onUpdateValue={(e) => onToggleOpen(row, e)}
            ></NSwitch>
        ),
    },
]

/**
 * 排序顺序
 */
const orderOptions = [
    {
        value: 'name:asc',
        label: '比赛名称',
    },
    {
        value: 'id:desc',
        label: '创建时间',
    },
]
</script>
<template>
    <PageGrid :useContentScroller="false">
        <template #header>
            <NForm labelPlacement="left" :inline="true" :showFeedback="false" :disabled="loading">
                <NFormItem label="赛事名称筛选">
                    <NInput v-model:value="filter.name" />
                </NFormItem>
                <NFormItem label="排序顺序">
                    <NSelect
                        v-model:value="filter.order"
                        :options="orderOptions"
                        :consistentMenuWidth="false"
                    />
                </NFormItem>
                <NButton type="primary" :loading="loading" @click="applyFilter">查询</NButton>
            </NForm>
        </template>
        <NDataTable
            class="tournament-table"
            :data="list"
            :rowKey="(t) => t.id"
            :columns="columns"
            :loading="loading"
            :pagination="{ pageSize: 50 }"
            size="small"
            :striped="true"
            :bordered="true"
            :singleLine="false"
            maxHeight="100%"
        />
    </PageGrid>
</template>
<style lang="less" scoped>
.tournament-table {
    &:deep(.n-data-table__pagination) {
        padding: 0 12px 12px;
        justify-content: flex-start;
    }
}
</style>
