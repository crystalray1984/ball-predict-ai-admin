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
        cellProps: (row) => {
            if (row.promote_flag > 0) {
                return {
                    style: {
                        backgroundColor: 'rgb(18,72,61)',
                    },
                }
            } else {
                return {}
            }
        },
        render: (row) => dayjs(row.created_at).format('HH:mm:ss'),
    },
    {
        key: 'value1',
        title: props.type === 'ah' ? '主队' : '小球',
        align: 'center',
        cellProps: (row) => {
            if (row.promote_flag === 1) {
                return {
                    style: {
                        backgroundColor: 'rgb(18,72,61)',
                    },
                }
            } else {
                return {}
            }
        },
        render: (row) => Number(row.value1),
    },
    {
        key: 'condition',
        title: '盘口',
        align: 'center',

        render: (row) => {
            let text = ''
            if (props.type === 'ah') {
                const condition = Decimal(row.condition)
                text = `${condition.gt(0) ? '+' : ''}${condition.toString()}`
            } else {
                text = Decimal(row.condition).toString()
            }
            return text
        },
    },
    {
        key: 'value2',
        title: props.type === 'ah' ? '客队' : '大球',
        align: 'center',
        cellProps: (row) => {
            if (row.promote_flag === 2) {
                return {
                    style: {
                        backgroundColor: 'rgb(18,72,61)',
                    },
                }
            } else {
                return {}
            }
        },
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
