<script lang="tsx" setup>
import { CloseCircleOutlined } from '@vicons/antd'
import Decimal from 'decimal.js'
import { eq } from 'lodash-es'
import {
    NButton,
    NDataTable,
    NFlex,
    NIcon,
    NInputGroup,
    NSelect,
    useMessage,
    type DataTableColumn,
} from 'naive-ui'
import { nanoid } from 'nanoid'
import { reactive, type PropType } from 'vue'
import ConditionSelect from './ConditionSelect'
import { ActionModal } from './modal'

const props = defineProps({
    list: {
        type: Array as PropType<SumCondition[]>,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
})

const remove = (index: number) => {
    props.list.splice(index, 1)
}

const columns: DataTableColumn<SumCondition>[] = [
    {
        key: 'condition',
        title: '盘口',
        render: (row) => `${row.condition_symbol} ${row.condition}`,
    },
    {
        key: 'actions',
        width: '40px',
        align: 'center',
        render: (_, index) => (
            <NButton size="tiny" type="error" text={true} onClick={() => remove(index)}>
                {{
                    icon: () => (
                        <NIcon>
                            <CloseCircleOutlined />
                        </NIcon>
                    ),
                }}
            </NButton>
        ),
    },
]

const addModal = reactive({
    show: false,
    data: null as unknown as SumCondition,
})

/**
 * 添加规则
 */
const add = () => {
    addModal.data = {
        id: nanoid(),
        condition_symbol: '=',
        condition: '1',
    }
    addModal.show = true
}

const message = useMessage()

const submitAdd = () => {
    //重复检查
    const exists = props.list.find((rule) => {
        if (!eq(rule.condition_symbol, addModal.data.condition_symbol)) return false
        return Decimal(rule.condition).eq(addModal.data.condition)
    })

    if (exists) {
        message.warning('已经存在相同条件的规则')
        return
    }

    props.list.push({
        ...addModal.data,
    })
    addModal.show = false
}
</script>
<template>
    <NFlex :vertical="true" :inline="true">
        <NDataTable
            v-if="list.length > 0"
            :data="list"
            :columns="columns"
            :rowKey="(t) => t.id"
            size="small"
            :bordered="true"
            :singleLine="false"
            :pagination="false"
            :style="{ width: '300px' }"
        />
        <NButton
            type="primary"
            size="small"
            :disabled="disabled"
            :style="{ alignSelf: 'flex-start' }"
            @click="add"
        >
            添加规则
        </NButton>
    </NFlex>
    <ActionModal
        title="添加对比小球规则"
        v-model:show="addModal.show"
        :data="addModal.data"
        :style="{ width: '400px' }"
        @positiveClick="submitAdd"
    >
        <NInputGroup>
            <NSelect
                v-model:value="addModal.data.condition_symbol"
                :options="[
                    { value: '>', label: '大于' },
                    { value: '>=', label: '大于等于' },
                    { value: '=', label: '等于' },
                    { value: '<', label: '小于' },
                    { value: '<=', label: '小于等于' },
                ]"
            />
            <ConditionSelect v-model:value="addModal.data.condition" oddType="over" />
        </NInputGroup>
    </ActionModal>
</template>
<style lang="less" scoped></style>
