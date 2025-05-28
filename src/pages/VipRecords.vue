<script setup lang="tsx">
import PageGrid from '@/components/PageGrid.vue'
import { api } from '@/libs/api'
import { date, dateTime, PAY_CHANNEL_TYPE_TEXT, VIP_TYPE_TEXT } from '@/libs/helpers'
import { useListLoader } from '@/libs/loader'
import {
    NButton,
    NDataTable,
    NDatePicker,
    NForm,
    NFormItem,
    NPagination,
    NSelect,
    type DataTableColumn,
} from 'naive-ui'
import { onMounted, reactive } from 'vue'

const filter = reactive({
    extra_type: undefined as string | undefined,
    dates: undefined as [number, number] | undefined,
})

const activeFilter = {
    extra: undefined as Record<string, any> | undefined,
    start_date: undefined as undefined | string,
    end_date: undefined as undefined | string,
}

const { list, load, loading, pagination } = useListLoader<Order<VipOrderData>>({
    loader: (params) =>
        api({
            url: '/admin/order/list',
            data: {
                type: 'vip',
                ...activeFilter,
                ...params,
            },
        }),
})

const applyFilter = () => {
    if (filter.extra_type) {
        activeFilter.extra = {
            type: filter.extra_type,
        }
    } else {
        activeFilter.extra = undefined
    }

    if (filter.dates) {
        activeFilter.start_date = date(filter.dates[0])
        activeFilter.end_date = date(filter.dates[1])
    } else {
        activeFilter.start_date = activeFilter.end_date = undefined
    }

    load(1)
}

onMounted(applyFilter)

const columns: DataTableColumn<Order<VipOrderData>>[] = [
    {
        key: 'order_number',
        title: '订单号',
    },
    {
        key: 'user_id',
        title: '用户ID',
    },
    {
        key: 'extra.type',
        title: '购买类型',
        render: (row) => VIP_TYPE_TEXT[row.extra.type],
    },
    {
        key: 'channel_type',
        title: '支付渠道',
        render: (row) => PAY_CHANNEL_TYPE_TEXT[row.channel_type],
    },
    {
        key: 'amount',
        title: '支付金额',
        render: (row) => `${Number(row.amount)} ${row.currency}`,
    },
    {
        key: 'paid_at',
        title: '购买时间',
        render: (row) => dateTime(row.paid_at),
    },
]

const typeOptions = Object.entries(VIP_TYPE_TEXT)
    .map(([value, label]) => ({ value, label }))
    .filter((t) => t.value !== 'quarter')
</script>
<template>
    <PageGrid :useContentScroller="false">
        <template #header>
            <NForm labelPlacement="left" :inline="true" :showFeedback="false" :disabled="loading">
                <NFormItem label="类型">
                    <NSelect
                        v-model:value="filter.extra_type"
                        :options="typeOptions"
                        :clearable="true"
                        placeholder="所有"
                        :style="{
                            minWidth: '100px',
                        }"
                        :consistentMenuWidth="false"
                    />
                </NFormItem>
                <NFormItem label="购买时间">
                    <NDatePicker
                        type="daterange"
                        v-model:value="filter.dates"
                        :inputReadonly="true"
                        :clearable="true"
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
