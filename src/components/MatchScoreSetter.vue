<script lang="tsx" setup>
import { ActionModal } from '@/components/modal'
import { api } from '@/libs/api'
import { dateTime } from '@/libs/helpers'
import { useLoader } from '@/libs/loader'
import { NFlex, NForm, NInputNumber, NRadio, NRadioGroup, NTable, useMessage } from 'naive-ui'
import { reactive } from 'vue'

interface MatchScore {
    match_id: number
    match_time: string
    team1: string
    team2: string
    period1: boolean
    score1: number
    score2: number
    corner1: number
    corner2: number
    score1_period1: number
    score2_period1: number
    corner1_period1: number
    corner2_period1: number
}

const emit = defineEmits<{
    success: [id: number]
}>()

const modal = reactive({
    data: null as unknown as MatchScore,
    show: false,
    sending: false,
})

const { load } = useLoader()
const message = useMessage()

const open = async (id: number, period1 = false) => {
    modal.data = null as unknown as MatchScore
    modal.show = true
    const ret = await load(() =>
        api<Match>({
            url: '/admin/match/match',
            data: {
                id,
            },
        }),
    )
    if (ret.code) {
        message.error(ret.msg)
        modal.show = false
        return
    }
    modal.data = {
        match_id: id,
        match_time: ret.data.match_time,
        team1: ret.data.team1.name,
        team2: ret.data.team2.name,
        period1,
        score1: ret.data.score1 ?? 0,
        score2: ret.data.score2 ?? 0,
        corner1: ret.data.corner1 ?? 0,
        corner2: ret.data.corner2 ?? 0,
        score1_period1: ret.data.score1_period1 ?? 0,
        score2_period1: ret.data.score2_period1 ?? 0,
        corner1_period1: ret.data.corner1_period1 ?? 0,
        corner2_period1: ret.data.corner2_period1 ?? 0,
    }
}

const submit = async () => {
    modal.sending = true

    //设置数据
    const data: Record<string, any> = {
        match_id: modal.data.match_id,
        period1: modal.data.period1,
        score1_period1: modal.data.score1_period1,
        score2_period1: modal.data.score2_period1,
        corner1_period1: modal.data.corner1_period1,
        corner2_period1: modal.data.corner2_period1,
    }
    if (!modal.data.period1) {
        data.score1 = modal.data.score1
        data.score2 = modal.data.score2
        data.corner1 = modal.data.corner1
        data.corner2 = modal.data.corner2
    }

    const ret = await api({
        url: '/admin/match/set_score',
        data,
    })

    if (ret.code) {
        message.error(ret.msg)
        modal.sending = false
        return
    }

    message.success('设置成功')
    modal.sending = false
    modal.show = false
    emit('success', modal.data.match_id)
}
</script>
<template>
    <slot :open="open"></slot>
    <ActionModal
        title="设置赛果"
        v-model:show="modal.show"
        :data="modal.data"
        :sending="modal.sending"
        :style="{ width: '500px' }"
        :contentStyle="{ padding: '0' }"
        @positiveClick="submit"
    >
        <NForm :disabled="modal.sending" :showFeedback="false">
            <NTable :bordered="false" :singleLine="false">
                <thead>
                    <tr>
                        <th style="width: 100px"></th>
                        <th colspan="2" class="center">
                            {{ dateTime(modal.data.match_time) }}
                        </th>
                    </tr>
                    <tr>
                        <th></th>
                        <th class="center">{{ modal.data.team1 }}</th>
                        <th class="center">{{ modal.data.team2 }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="center">设置类型</td>
                        <td colspan="2">
                            <NRadioGroup v-model:value="modal.data.period1">
                                <NFlex size="large">
                                    <NRadio :value="true">半场赛果</NRadio>
                                    <NRadio :value="false">全场赛果</NRadio>
                                </NFlex>
                            </NRadioGroup>
                        </td>
                    </tr>
                    <tr>
                        <td class="center">半场得分</td>
                        <td>
                            <NInputNumber
                                v-model:value="modal.data.score1_period1"
                                :min="0"
                                :step="1"
                                :precision="0"
                                placeholder="主队"
                            />
                        </td>
                        <td>
                            <NInputNumber
                                v-model:value="modal.data.score2_period1"
                                :min="0"
                                :step="1"
                                :precision="0"
                                placeholder="客队"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td class="center">半场角球</td>
                        <td>
                            <NInputNumber
                                v-model:value="modal.data.corner1_period1"
                                :min="0"
                                :step="1"
                                :precision="0"
                                placeholder="主队"
                            />
                        </td>
                        <td>
                            <NInputNumber
                                v-model:value="modal.data.corner2_period1"
                                :min="0"
                                :step="1"
                                :precision="0"
                                placeholder="客队"
                            />
                        </td>
                    </tr>
                    <template v-if="!modal.data.period1">
                        <tr>
                            <td class="center">全场得分</td>
                            <td>
                                <NInputNumber
                                    v-model:value="modal.data.score1"
                                    :min="0"
                                    :step="1"
                                    :precision="0"
                                    placeholder="主队"
                                />
                            </td>
                            <td>
                                <NInputNumber
                                    v-model:value="modal.data.score2"
                                    :min="0"
                                    :step="1"
                                    :precision="0"
                                    placeholder="客队"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="center">全场角球</td>
                            <td>
                                <NInputNumber
                                    v-model:value="modal.data.corner1"
                                    :min="0"
                                    :step="1"
                                    :precision="0"
                                    placeholder="主队"
                                />
                            </td>
                            <td>
                                <NInputNumber
                                    v-model:value="modal.data.corner2"
                                    :min="0"
                                    :step="1"
                                    :precision="0"
                                    placeholder="客队"
                                />
                            </td>
                        </tr>
                    </template>
                </tbody>
            </NTable>
            <!-- <NFlex :vertical="true">
                <NFormItem label="比赛时间">
                    {{ dateTime(modal.data.match_time) }}
                </NFormItem>
                <NFormItem label="主队">
                    {{ modal.data.team1 }}
                </NFormItem>
                <NFormItem label="客队">
                    {{ modal.data.team2 }}
                </NFormItem>
                <NFormItem label="设置类型">
                    <NRadioGroup v-model:value="modal.data.period1">
                        <NRadio :value="true">半场赛果</NRadio>
                        <NRadio :value="false">全场赛果</NRadio>
                    </NRadioGroup>
                </NFormItem>
                <NFormItem label="半场得分">
                    <NInputGroup>
                        <NInputNumber
                            v-model:value="modal.data.score1_period1"
                            :min="0"
                            :step="1"
                            :precision="0"
                            placeholder="主队得分"
                        />
                        <NInputNumber
                            v-model:value="modal.data.score2_period1"
                            :min="0"
                            :step="1"
                            :precision="0"
                            placeholder="客队得分"
                        />
                    </NInputGroup>
                </NFormItem>
            </NFlex> -->
        </NForm>
    </ActionModal>
</template>
<style lang="less" scoped>
.center {
    text-align: center;
}
</style>
