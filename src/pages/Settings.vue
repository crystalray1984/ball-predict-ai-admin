<script setup lang="tsx">
import AdjustConditionEditor from '@/components/AdjustConditionEditor.vue'
import SpecialConfigEditor from '@/components/SpecialConfigEditor.vue'
import SpecialEnableEditor from '@/components/SpecialEnableEditor.vue'
import SpecialReverseEditor from '@/components/SpecialReverseEditor.vue'
import { api } from '@/libs/api'
import { useLoader } from '@/libs/loader'
import { pick } from 'lodash-es'
import {
    NButton,
    NCard,
    NCol,
    NFlex,
    NForm,
    NFormItem,
    NInput,
    NInputGroup,
    NInputGroupLabel,
    NInputNumber,
    NRadio,
    NRadioGroup,
    NRow,
    NSelect,
    useMessage,
} from 'naive-ui'
import { onMounted, ref, type Ref } from 'vue'

const settings = ref() as Ref<Setting>
const message = useMessage()
const { loading, load } = useLoader()

const loadSettings = async (...keys: Array<keyof Setting>) => {
    const ret = await load(() =>
        api<Setting>({
            url: '/admin/setting/get',
        }),
    )

    if (ret.code) {
        message.error(ret.msg)
        return
    }
    if (!settings.value || keys.length === 0) {
        settings.value = ret.data
    } else {
        Object.assign(settings.value, pick(ret.data, keys))
    }
}

onMounted(() => loadSettings())

/**
 * 保存配置
 */
const saveSettings = async () => {
    const ret = await load(() =>
        api({
            url: '/admin/setting/set',
            data: settings.value,
        }),
    )
    if (ret.code) {
        message.error(ret.msg)
    } else {
        message.success('保存成功')
    }
}
</script>
<template>
    <div v-if="settings" class="page">
        <NRow :gutter="12">
            <NCol :span="14">
                <NCard :segmented="true" size="small" title="系统配置">
                    <NForm
                        labelPlacement="left"
                        labelWidth="130px"
                        :showFeedback="false"
                        :disabled="loading"
                    >
                        <NFlex :vertical="true" size="large">
                            <NFormItem label="筛选率">
                                <NRadioGroup v-model:value="settings.filter_rate">
                                    <NFlex size="large">
                                        <NRadio :value="1">25%</NRadio>
                                        <NRadio :value="2">50%</NRadio>
                                        <NRadio :value="3">75%</NRadio>
                                        <NRadio :value="4">100%</NRadio>
                                    </NFlex>
                                </NRadioGroup>
                            </NFormItem>
                            <NFormItem label="一次比对:水位差">
                                <NInputGroup>
                                    <NInputGroupLabel>≥</NInputGroupLabel>
                                    <NInput v-model:value="settings.ready_condition" />
                                </NInputGroup>
                            </NFormItem>
                            <NFormItem label="二次比对时间">
                                <NFlex align="center">
                                    <NInputNumber
                                        v-model:value="settings.final_check_time"
                                        :min="1"
                                        :precision="0"
                                        :step="1"
                                    />
                                    <span>分钟</span>
                                </NFlex>
                            </NFormItem>
                            <NFormItem label="二次比对:变盘">
                                <NRadioGroup v-model:value="settings.allow_promote_1">
                                    <NFlex size="large">
                                        <NRadio :value="true">开启</NRadio>
                                        <NRadio :value="false">关闭</NRadio>
                                    </NFlex>
                                </NRadioGroup>
                            </NFormItem>

                            <NFormItem v-if="settings.allow_promote_1" label="变盘配置">
                                <SpecialConfigEditor
                                    :list="settings.special_config"
                                    :disabled="loading"
                                />
                            </NFormItem>

                            <NFormItem label="二次比对:水位差">
                                <NInputGroup>
                                    <NSelect
                                        v-model:value="settings.promote_symbol"
                                        :options="[
                                            { value: '>=', label: '≥' },
                                            { value: '<=', label: '≤' },
                                        ]"
                                        :style="{ width: '100px' }"
                                    />
                                    <NInput v-model:value="settings.promote_condition" />
                                </NInputGroup>
                            </NFormItem>
                            <NFormItem label="推荐:半场">
                                <NRadioGroup v-model:value="settings.period1_enable">
                                    <NFlex size="large">
                                        <NRadio :value="true">开启</NRadio>
                                        <NRadio :value="false">关闭</NRadio>
                                    </NFlex>
                                </NRadioGroup>
                            </NFormItem>
                            <NFormItem label="推荐:角球">
                                <NRadioGroup v-model:value="settings.corner_enable">
                                    <NFlex size="large">
                                        <NRadio :value="true">开启</NRadio>
                                        <NRadio :value="false">关闭</NRadio>
                                    </NFlex>
                                </NRadioGroup>
                            </NFormItem>
                            <NFormItem label="推荐:半场角球">
                                <NRadioGroup v-model:value="settings.corner_period1_enable">
                                    <NFlex size="large">
                                        <NRadio :value="true">开启</NRadio>
                                        <NRadio :value="false">关闭</NRadio>
                                    </NFlex>
                                </NRadioGroup>
                            </NFormItem>
                            <NFormItem label="推荐:特殊规则">
                                <NFlex :vertical="true" :inline="false" :style="{ flex: 1 }">
                                    <SpecialEnableEditor
                                        :list="settings.special_enable"
                                        :disabled="loading"
                                    />
                                    <span
                                        >满足任一规则，则忽略"推荐:半场","推荐:角球"和"推荐:半场角球"，直接进入推荐</span
                                    >
                                </NFlex>
                            </NFormItem>

                            <NFormItem label="推荐方向:趋势">
                                <NRadioGroup v-model:value="settings.titan007_reverse">
                                    <NFlex size="large">
                                        <NRadio :value="true">开启</NRadio>
                                        <NRadio :value="false">关闭</NRadio>
                                    </NFlex>
                                </NRadioGroup>
                            </NFormItem>
                            <NFormItem label="推荐方向:角球">
                                <NRadioGroup v-model:value="settings.corner_reverse">
                                    <NFlex size="large">
                                        <NRadio :value="false">正推</NRadio>
                                        <NRadio :value="true">反推</NRadio>
                                    </NFlex>
                                </NRadioGroup>
                            </NFormItem>
                            <NFormItem label="推荐方向:全局">
                                <NRadioGroup v-model:value="settings.promote_reverse">
                                    <NFlex size="large">
                                        <NRadio :value="false">正推</NRadio>
                                        <NRadio :value="true">反推</NRadio>
                                    </NFlex>
                                </NRadioGroup>
                            </NFormItem>
                            <NFormItem label="推荐方向:特殊">
                                <NFlex :vertical="true" :inline="false" :style="{ flex: 1 }">
                                    <SpecialReverseEditor
                                        :list="settings.special_reverse"
                                        :disabled="loading"
                                    />
                                    <span>规则越靠前，优先级越高</span>
                                </NFlex>
                            </NFormItem>
                            <NFormItem label="自动变盘规则">
                                <NFlex :vertical="true" :inline="false" :style="{ flex: 1 }">
                                    <AdjustConditionEditor
                                        :list="settings.adjust_condition"
                                        :disabled="loading"
                                    />
                                    <span>
                                        规则越靠前，优先级越高，一旦触发一个规则则不再触发另一个
                                    </span>
                                </NFlex>
                            </NFormItem>
                        </NFlex>
                    </NForm>
                </NCard>
            </NCol>
            <NCol :span="10">
                <NFlex :vertical="true" :inline="false">
                    <NCard :segmented="true" size="small" title="抓取配置">
                        <NForm
                            labelPlacement="left"
                            labelWidth="80px"
                            :showFeedback="false"
                            :disabled="loading"
                        >
                            <NFlex :vertical="true" size="large">
                                <NFormItem label="min-profit">
                                    <NInput
                                        v-model:value="settings.surebet_min_profit"
                                        placeholder=""
                                    />
                                </NFormItem>
                                <NFormItem label="max-profit">
                                    <NInput
                                        v-model:value="settings.surebet_max_profit"
                                        placeholder=""
                                    />
                                </NFormItem>
                                <NFormItem label="outcomes">
                                    <NInput
                                        v-model:value="settings.surebet_outcomes"
                                        placeholder=""
                                    />
                                </NFormItem>
                                <NFormItem label="startOf">
                                    <NInput
                                        v-model:value="settings.surebet_start_of"
                                        placeholder=""
                                    />
                                </NFormItem>
                                <NFormItem label="endOf">
                                    <NInput
                                        v-model:value="settings.surebet_end_of"
                                        placeholder=""
                                    />
                                </NFormItem>
                                <NFormItem label="水位范围">
                                    <NInputGroup>
                                        <NInput
                                            v-model:value="settings.min_surebet_value"
                                            placeholder=""
                                        />
                                        <NInputGroupLabel> - </NInputGroupLabel>
                                        <NInput
                                            v-model:value="settings.max_surebet_value"
                                            placeholder=""
                                        />
                                    </NInputGroup>
                                </NFormItem>
                            </NFlex>
                        </NForm>
                    </NCard>
                    <NButton
                        type="primary"
                        size="large"
                        :loading="loading"
                        :style="{ alignSelf: 'flex-start' }"
                        @click="saveSettings"
                    >
                        保存所有配置
                    </NButton>
                </NFlex>
            </NCol>
        </NRow>
    </div>
</template>
<style lang="less" scoped></style>
