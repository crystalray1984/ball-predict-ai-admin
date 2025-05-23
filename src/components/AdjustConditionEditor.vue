<script lang="tsx" setup>
import {
    isNullOrUndefined,
    numberWithSymbol,
    ODD_TYPE_TEXT,
    PERIOD_TEXT,
    VARIETY_TEXT,
} from '@/libs/helpers'
import { ArrowDownOutlined, ArrowUpOutlined, CloseCircleOutlined } from '@vicons/antd'
import Decimal from 'decimal.js'
import { eq } from 'lodash-es'
import {
    NButton,
    NDataTable,
    NFlex,
    NForm,
    NFormItem,
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
        type: Array as PropType<AdjustCondition[]>,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
})

const moveUp = (index: number) => {
    const [item] = props.list.splice(index, 1)
    props.list.splice(index - 1, 0, item)
}

const moveDown = (index: number) => {
    const [item] = props.list.splice(index, 1)
    props.list.splice(index + 1, 0, item)
}

const remove = (index: number) => {
    props.list.splice(index, 1)
}

const columns: DataTableColumn<AdjustCondition>[] = [
    {
        key: 'period',
        title: '时段',
        render: (row) => (row.period ? PERIOD_TEXT[row.period] : '-'),
    },
    {
        key: 'variety',
        title: '玩法',
        render: (row) => (row.variety ? VARIETY_TEXT[row.variety] : '-'),
    },
    {
        key: 'type',
        title: '方向',
        render: (row) => (row.type ? ODD_TYPE_TEXT[row.type] : '-'),
    },
    {
        key: 'condition',
        title: '盘口',
        render: (row) =>
            !isNullOrUndefined(row.condition_symbol) && !isNullOrUndefined(row.condition)
                ? `${row.condition_symbol} ${row.condition}`
                : '-',
    },
    {
        key: 'adjust',
        title: '变盘',
        render: (row) => numberWithSymbol(row.adjust),
    },
    {
        key: 'actions',
        render: (_, index) => (
            <NFlex size={5}>
                <NButton
                    size="tiny"
                    type="primary"
                    text={true}
                    style={{ visibility: index === 0 ? 'hidden' : 'visible' }}
                    onClick={() => moveUp(index)}
                >
                    {{
                        icon: () => (
                            <NIcon>
                                <ArrowUpOutlined />
                            </NIcon>
                        ),
                    }}
                </NButton>
                <NButton
                    size="tiny"
                    type="primary"
                    text={true}
                    style={{
                        visibility: index >= props.list.length - 1 ? 'hidden' : 'visible',
                    }}
                    onClick={() => moveDown(index)}
                >
                    {{
                        icon: () => (
                            <NIcon>
                                <ArrowDownOutlined />
                            </NIcon>
                        ),
                    }}
                </NButton>
                <NButton size="tiny" type="error" text={true} onClick={() => remove(index)}>
                    {{
                        icon: () => (
                            <NIcon>
                                <CloseCircleOutlined />
                            </NIcon>
                        ),
                    }}
                </NButton>
            </NFlex>
        ),
    },
]

const addModal = reactive({
    show: false,
    data: null as unknown as AdjustCondition,
})

const periodOptions = Object.entries(PERIOD_TEXT).map(([value, label]) => ({ value, label }))
const varietyOptions = Object.entries(VARIETY_TEXT).map(([value, label]) => ({ value, label }))
const oddTypeOptions = Object.entries(ODD_TYPE_TEXT)
    .filter((t) => t[0] !== 'draw')
    .map(([value, label]) => ({ value, label }))

const adjustOptions = (() => {
    let start = Decimal('-10')
    const output: { value: string; label: string }[] = []
    while (start.lte(10)) {
        if (start.eq(0)) {
            start = start.add('0.25')
            continue
        }
        const value = start.toString()
        const label = numberWithSymbol(value)
        output.push({ value, label })
        start = start.add('0.25')
    }
    return output
})()

/**
 * 添加规则
 */
const add = () => {
    addModal.data = {
        id: nanoid(),
        adjust: '0.25',
        condition: '0',
    }
    addModal.show = true
}

const message = useMessage()

const submitAdd = () => {
    //检查数据
    if (
        isNullOrUndefined(addModal.data.variety) &&
        isNullOrUndefined(addModal.data.period) &&
        isNullOrUndefined(addModal.data.type) &&
        isNullOrUndefined(addModal.data.condition_symbol)
    ) {
        message.warning('时段、玩法、盘口方向、盘口这4个条件必须限制至少1个')
        return
    }

    //重复检查
    const exists = props.list.find((rule) => {
        if (!eq(rule.variety, addModal.data.variety)) return false
        if (!eq(rule.period, addModal.data.period)) return false
        if (!eq(rule.type, addModal.data.type)) return false
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
    <NFlex :vertical="true" :inline="false">
        <NDataTable
            v-if="list.length > 0"
            :style="{ width: '100%' }"
            :data="list"
            :columns="columns"
            :rowKey="(t) => t.id"
            size="small"
            :bordered="true"
            :singleLine="false"
            :pagination="false"
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
        <ActionModal
            title="添加推荐方向特殊规则"
            v-model:show="addModal.show"
            :data="addModal.data"
            :style="{ width: '400px' }"
            @positiveClick="submitAdd"
        >
            <NForm :showFeedback="false" labelWidth="68px" labelPlacement="left">
                <NFlex :vertical="true" size="large">
                    <NFormItem label="时段">
                        <NSelect
                            v-model:value="addModal.data.period"
                            :options="periodOptions"
                            :clearable="true"
                            placeholder="不限"
                        />
                    </NFormItem>
                    <NFormItem label="玩法">
                        <NSelect
                            v-model:value="addModal.data.variety"
                            :options="varietyOptions"
                            :clearable="true"
                            placeholder="不限"
                        />
                    </NFormItem>
                    <NFormItem label="盘口方向">
                        <NSelect
                            v-model:value="addModal.data.type"
                            :options="oddTypeOptions"
                            :clearable="true"
                            placeholder="不限"
                        />
                    </NFormItem>
                    <NFormItem label="盘口条件">
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
                                :clearable="true"
                                placeholder="不限"
                            />
                            <ConditionSelect
                                v-if="addModal.data.condition_symbol"
                                v-model:value="addModal.data.condition"
                                :oddType="addModal.data.type"
                            />
                        </NInputGroup>
                    </NFormItem>
                    <NFormItem label="变盘">
                        <NSelect v-model:value="addModal.data.adjust" :options="adjustOptions" />
                    </NFormItem>
                </NFlex>
            </NForm>
        </ActionModal>
    </NFlex>
</template>
<style lang="less" scoped></style>
