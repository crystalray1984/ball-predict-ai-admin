<script setup lang="tsx">
import { api } from '@/libs/api'
import {
    conditionText,
    dateTime,
    getOddResult,
    getReverseOdd,
    ODD_TYPE_TEXT,
    PERIOD_TEXT,
    VARIETY_TEXT,
} from '@/libs/helpers'
import { NButton, NCol, NFlex, NForm, NFormItem, NRow, NSelect, NText, useMessage } from 'naive-ui'
import { computed, reactive, type PropType } from 'vue'
import ConditionSelect from './ConditionSelect'
import { ActionModal } from './modal'

interface ModalData {
    /**
     * 比赛基础数据
     */
    match: Match
    /**
     * 盘口数据
     */
    odd: OddInfo
}

const props = defineProps({
    onSubmit: {
        type: Function as PropType<(match_id: number, odd: OddInfo) => Promise<boolean>>,
        required: true,
    },
})

const message = useMessage()

const modal = reactive({
    show: false,
    sending: false,
    data: null as unknown as ModalData,
    allowChange: true,
    allowReverse: true,
})

const oddResult = computed(() => {
    if (!modal.data || !modal.data.match || !modal.data.odd) return
    return getOddResult(modal.data.odd, modal.data.match)
})

/**
 * 打开添加推荐的弹窗
 * @param match_id
 * @param odd
 */
const open = async (match_id: number, odd?: OddInfo, allowChange = true, allowReverse = false) => {
    modal.data = null as unknown as ModalData
    modal.show = true
    const ret = await api<Match>({
        url: '/admin/match/match',
        data: {
            id: match_id,
        },
    })
    if (ret.code) {
        message.error(ret.msg)
        modal.show = false
        return
    }
    modal.allowChange = allowChange
    modal.allowReverse = allowReverse
    modal.data = {
        match: ret.data,
        odd: odd
            ? {
                  variety: odd.variety,
                  period: odd.period,
                  type: odd.type,
                  condition: odd.condition,
              }
            : {
                  variety: 'goal',
                  period: 'regularTime',
                  type: 'ah1',
                  condition: '0',
              },
    }
}

const periodOptions = Object.entries(PERIOD_TEXT).map(([value, label]) => ({ value, label }))
const varietyOptions = Object.entries(VARIETY_TEXT).map(([value, label]) => ({ value, label }))

const oddTypeOptions = Object.entries(ODD_TYPE_TEXT)
    .filter((t) => t[0] !== 'draw')
    .map(([value, label]) => ({ value, label }))

//设置当前盘口的反向盘口
const reverse = () => {
    if (!modal.data.odd) return
    const next = getReverseOdd(modal.data.odd)
    modal.data.odd.type = next.type
    modal.data.odd.condition = next.condition
}

const submit = async () => {
    modal.sending = true
    const success = await props.onSubmit(modal.data.match.id, modal.data.odd)
    modal.sending = false
    if (success) {
        modal.show = false
    }
}
</script>
<template>
    <slot :open="open"></slot>
    <ActionModal
        title="补推荐"
        v-model:show="modal.show"
        :data="modal.data"
        :sending="modal.sending"
        :style="{ width: '600px' }"
        @positiveClick="submit"
    >
        <NForm labelPlacement="left" :showFeedback="false" :disabled="modal.sending">
            <NFlex :vertical="true">
                <NFormItem label="比赛时间">{{ dateTime(modal.data.match.match_time) }}</NFormItem>
                <NRow :gutter="12">
                    <NCol :span="12">
                        <NFormItem label="主队">{{ modal.data.match.team1.name }}</NFormItem>
                    </NCol>
                    <NCol :span="12">
                        <NFormItem label="客队">{{ modal.data.match.team2.name }}</NFormItem>
                    </NCol>
                </NRow>
                <NRow :gutter="12">
                    <NCol :span="12">
                        <NFormItem label="半场得分">
                            {{
                                `${modal.data.match.score1_period1}:${modal.data.match.score2_period1}`
                            }}
                        </NFormItem>
                    </NCol>
                    <NCol :span="12">
                        <NFormItem label="全场得分">
                            {{ `${modal.data.match.score1}:${modal.data.match.score2}` }}
                        </NFormItem>
                    </NCol>
                </NRow>
                <NRow :gutter="12">
                    <NCol :span="12">
                        <NFormItem label="半场角球">
                            {{
                                `${modal.data.match.corner1_period1}:${modal.data.match.corner2_period1}`
                            }}
                        </NFormItem>
                    </NCol>
                    <NCol :span="12">
                        <NFormItem label="全场角球">
                            {{ `${modal.data.match.corner1}:${modal.data.match.corner2}` }}
                        </NFormItem>
                    </NCol>
                </NRow>
                <NRow :gutter="12">
                    <NCol :span="12">
                        <NFormItem label="玩法">
                            <NSelect
                                v-if="modal.allowChange"
                                v-model:value="modal.data.odd.variety"
                                :options="varietyOptions"
                            />
                            <span v-else>{{ VARIETY_TEXT[modal.data.odd.variety] }}</span>
                        </NFormItem>
                    </NCol>
                    <NCol :span="12">
                        <NFormItem label="时段">
                            <NSelect
                                v-if="modal.allowChange"
                                v-model:value="modal.data.odd.period"
                                :options="periodOptions"
                            />
                            <span v-else>{{ PERIOD_TEXT[modal.data.odd.period] }}</span>
                        </NFormItem>
                    </NCol>
                </NRow>
                <NRow :gutter="12">
                    <NCol :span="12">
                        <NFormItem label="方向">
                            <NSelect
                                v-if="modal.allowChange"
                                v-model:value="modal.data.odd.type"
                                :options="oddTypeOptions"
                            />
                            <span v-else>{{ ODD_TYPE_TEXT[modal.data.odd.type] }}</span>
                        </NFormItem>
                    </NCol>
                    <NCol :span="12">
                        <NFormItem label="盘口">
                            <ConditionSelect
                                v-if="modal.allowChange"
                                v-model:value="modal.data.odd.condition"
                                :oddType="modal.data.odd.type"
                            />
                            <span v-else>{{
                                conditionText(modal.data.odd.condition, modal.data.odd.type)
                            }}</span>
                        </NFormItem>
                    </NCol>
                </NRow>
                <NButton
                    v-if="modal.allowReverse"
                    type="warning"
                    @click="reverse"
                    :style="{ alignSelf: 'flex-start' }"
                >
                    切换方向
                </NButton>
                <NFormItem v-if="oddResult" label="推荐结果">
                    <NFlex align="center">
                        <NText type="success" v-if="oddResult.result === 1">赢</NText>
                        <NText type="error" v-else-if="oddResult.result === -1">输</NText>
                        <NText type="warning" v-else>和</NText>
                        <span>{{ oddResult.score }}</span>
                    </NFlex>
                </NFormItem>
            </NFlex>
        </NForm>
    </ActionModal>
</template>
<style lang="less" scoped></style>
