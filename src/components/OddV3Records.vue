<script setup lang="tsx">
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import { NDataTable, NText, type DataTableColumn } from 'naive-ui'
import { computed, type PropType } from 'vue'

const props = defineProps({
    type: {
        type: String as PropType<'ah' | 'sum'>,
        required: true,
    },
    list: {
        type: Array as PropType<CrownOdd[]>,
        required: true,
    },
    team1: {
        type: String,
        default: '',
    },
    team2: {
        type: String,
        default: '',
    },
})

const columns = computed<DataTableColumn<CrownOdd>[]>(() => [
    {
        key: 'time',
        title: '时间',
        align: 'center',
        width: 80,
        render: (row) => dayjs(row.created_at).format('HH:mm:ss'),
    },
    {
        key: 'value1',
        title: props.type === 'ah' ? '主队' : '小球',
        align: 'center',
        render: (row) => (
            <NText type={row.promote_flag ? 'error' : undefined}>{Number(row.value1)}</NText>
        ),
    },
    {
        key: 'condition',
        title: '盘口',
        align: 'center',
        render: (row) => {
            if (props.type === 'ah') {
                const condition = Decimal(row.condition)
                return `${condition.gt(0) ? '+' : ''}${condition.toString()}`
            } else {
                return Decimal(row.condition).toString()
            }
        },
    },
    {
        key: 'value2',
        title: props.type === 'ah' ? '客队' : '大球',
        align: 'center',
        render: (row) => Number(row.value2),
    },
])
</script>
<template>
    <NDataTable
        :data="list"
        :rowKey="(t) => t.id"
        :columns="columns"
        :pagination="false"
        size="small"
        :bordered="true"
        :singleLine="false"
    />
</template>
