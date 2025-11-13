<script lang="tsx" setup>
import { isNullOrUndefined, ODD_TYPE_TEXT, PERIOD_TEXT, VARIETY_TEXT } from '@/libs/helpers'
import { CloseCircleOutlined } from '@vicons/antd'
import Decimal from 'decimal.js'
import { eq } from 'lodash-es'
import {
    NButton,
    NDataTable,
    NFlex,
    NForm,
    NFormItem,
    NIcon,
    NInput,
    NInputGroup,
    NInputGroupLabel,
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
        type: Array as PropType<RockballConfig[]>,
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

const columns: DataTableColumn<RockballConfig>[] = [
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
        key: 'odds',
        title: '追踪盘口',
        // render: (row) => {
        //     if (row.odds.length === 0) return
        //     return (
        //         <NList>
        //             {row.odds.map((odd) => (
        //                 <NListItem key={odd.id}>abc</NListItem>
        //             ))}
        //         </NList>
        //     )
        // },
        render: (row) => (
            <NFlex vertical={true} inline={false}>
                {row.odds.map((odd, index) => (
                    <NFlex key={odd.id} align="center">
                        <span>
                            {PERIOD_TEXT[odd.period]} {ODD_TYPE_TEXT[odd.type]} {odd.condition}{' '}
                            {`水位≥${odd.value}`}
                        </span>
                        <NButton
                            size="tiny"
                            type="error"
                            text={true}
                            onClick={() => row.odds.splice(index)}
                        >
                            {{
                                icon: () => (
                                    <NIcon>
                                        <CloseCircleOutlined />
                                    </NIcon>
                                ),
                            }}
                        </NButton>
                    </NFlex>
                ))}
                <NButton
                    size="tiny"
                    type="info"
                    style={{ alignSelf: 'flex-start' }}
                    onClick={() => addOdd(row)}
                >
                    +
                </NButton>
            </NFlex>
        ),
    },
    {
        key: 'actions',
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
    data: null as unknown as RockballConfig,
})

const periodOptions = Object.entries(PERIOD_TEXT).map(([value, label]) => ({ value, label }))
const varietyOptions = Object.entries(VARIETY_TEXT).map(([value, label]) => ({ value, label }))
const oddTypeOptions = Object.entries(ODD_TYPE_TEXT)
    .filter((t) => t[0] !== 'draw')
    .map(([value, label]) => ({ value, label }))

/**
 * 添加规则
 */
const add = () => {
    addModal.data = {
        id: nanoid(),
        condition_symbol: '=',
        condition: '0',
        value: '1.00',
        odds: [],
    }
    addModal.show = true
}

const message = useMessage()

const submitAdd = () => {
    //检查数据
    if (
        isNullOrUndefined(addModal.data.variety) &&
        isNullOrUndefined(addModal.data.period) &&
        isNullOrUndefined(addModal.data.type)
    ) {
        message.warning('时段、玩法、盘口这3个条件必须限制至少1个')
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

const addOdd = (target: RockballConfig) => {
    addOddModal.target = target
    addOddModal.data = {
        id: nanoid(),
        period: undefined as unknown as Period,
        variety: target.variety!,
        type: undefined as unknown as OddType,
        condition: '0',
        value: '1.00',
    }
    addOddModal.show = true
}

const addOddModal = reactive({
    show: false,
    data: null as unknown as RockballOddInfo,
    target: null as unknown as RockballConfig,
})

const submitAddOdd = () => {
    if (!addOddModal.data.period) {
        message.warning('请选择时段')
        return
    }
    if (!addOddModal.data.type) {
        message.warning('请选择盘口方向')
        return
    }

    //重复检查
    const exists = addOddModal.target.odds.some((org) => {
        if (!eq(org.variety, addOddModal.data.variety)) return false
        if (!eq(org.period, addOddModal.data.period)) return false
        if (!eq(org.type, addOddModal.data.type)) return false
        return Decimal(org.condition).eq(addOddModal.data.condition)
    })
    if (exists) {
        message.warning('已经设置了相同的追踪盘口')
        return
    }

    addOddModal.target.odds.push(addOddModal.data)
    addOddModal.show = false
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
            title="添加滚球规则"
            v-model:show="addModal.show"
            :data="addModal.data"
            :style="{ width: '400px' }"
            @positiveClick="submitAdd"
        >
            <NForm :showFeedback="false" labelWidth="88px" labelPlacement="left">
                <NFlex :vertical="true" size="large">
                    <NFormItem label="时段">
                        <NSelect v-model:value="addModal.data.period" :options="periodOptions" />
                    </NFormItem>
                    <NFormItem label="玩法">
                        <NSelect v-model:value="addModal.data.variety" :options="varietyOptions" />
                    </NFormItem>
                    <NFormItem label="盘口方向">
                        <NSelect v-model:value="addModal.data.type" :options="oddTypeOptions" />
                    </NFormItem>
                    <NFormItem label="盘口条件">
                        <ConditionSelect
                            v-model:value="addModal.data.condition"
                            :oddType="addModal.data.type"
                        />
                    </NFormItem>
                    <NFormItem label="水位条件">
                        <NInputGroup>
                            <NInputGroupLabel>≥</NInputGroupLabel>
                            <NInput v-model:value="addModal.data.value" />
                        </NInputGroup>
                    </NFormItem>
                </NFlex>
            </NForm>
        </ActionModal>
        <ActionModal
            title="添加滚球追踪盘口"
            v-model:show="addOddModal.show"
            :data="addOddModal.data"
            :style="{ width: '400px' }"
            @positiveClick="submitAddOdd"
        >
            <NForm :showFeedback="false" labelWidth="88px" labelPlacement="left">
                <NFlex :vertical="true" size="large">
                    <NFormItem label="时段">
                        <NSelect v-model:value="addOddModal.data.period" :options="periodOptions" />
                    </NFormItem>
                    <NFormItem label="玩法">
                        {{ VARIETY_TEXT[addOddModal.data.variety] }}
                    </NFormItem>
                    <NFormItem label="盘口方向">
                        <NSelect v-model:value="addOddModal.data.type" :options="oddTypeOptions" />
                    </NFormItem>
                    <NFormItem label="盘口条件">
                        <ConditionSelect
                            v-model:value="addOddModal.data.condition"
                            :oddType="addOddModal.data.type"
                        />
                    </NFormItem>
                    <NFormItem label="水位条件">
                        <NInputGroup>
                            <NInputGroupLabel>≥</NInputGroupLabel>
                            <NInput v-model:value="addOddModal.data.value" />
                        </NInputGroup>
                    </NFormItem>
                </NFlex>
            </NForm>
        </ActionModal>
    </NFlex>
</template>
<style lang="less" scoped></style>
