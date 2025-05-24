<script setup lang="tsx">
import { NDataTable, NFlex, NRadio, NRadioGroup, type DataTableColumn } from 'naive-ui'
import type { PropType } from 'vue'

const props = defineProps({
    list: {
        type: Array as PropType<SpecialConfig[]>,
        default: () => [],
    },
    disabled: {
        type: Boolean,
        default: false,
    },
})

const columns: DataTableColumn<SpecialConfig>[] = [
    {
        key: 'delta',
        title: '变盘数',
        render: (row, index) =>
            index === props.list.length - 1 ? `${row.delta}或更多` : row.delta,
    },
    {
        key: 'back',
        title: '强制推荐方向',
        render: (row) => (
            <NRadioGroup
                value={row.back}
                onUpdateValue={(value) => {
                    row.back = value
                }}
            >
                <NFlex>
                    <NRadio value={0}>正推</NRadio>
                    <NRadio value={1}>反推</NRadio>
                    <NRadio value={-1}>不强制</NRadio>
                </NFlex>
            </NRadioGroup>
        ),
    },
    {
        key: 'auto_adjust',
        title: '应用盘口',
        render: (row) => (
            <NRadioGroup
                value={row.auto_adjust}
                onUpdateValue={(value) => {
                    row.auto_adjust = value
                }}
            >
                <NFlex>
                    <NRadio value={false}>原始盘口</NRadio>
                    <NRadio value={true}>新盘口</NRadio>
                </NFlex>
            </NRadioGroup>
        ),
    },
]
</script>
<template>
    <NDataTable
        v-if="list.length > 0"
        :style="{ width: '100%' }"
        :data="list"
        :columns="columns"
        :rowKey="(t) => t.delta"
        size="small"
        :bordered="true"
        :singleLine="false"
        :pagination="false"
    />
</template>
