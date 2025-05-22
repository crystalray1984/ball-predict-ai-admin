<script setup lang="tsx">
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
                            <NFormItem label="一次比对条件">
                                <NInputGroup>
                                    <NInputGroupLabel>皇冠水位 - 推送水位 ≥</NInputGroupLabel>
                                    <NInput v-model:value="settings.ready_condition" />
                                </NInputGroup>
                            </NFormItem>
                            <NFormItem label="二次比对:球探网趋势">
                                <NRadioGroup v-model:value="settings.titan007_promote_enable">
                                    <NFlex size="large">
                                        <NRadio :value="true">开启</NRadio>
                                        <NRadio :value="false">关闭</NRadio>
                                    </NFlex>
                                </NRadioGroup>
                            </NFormItem>
                            <NFormItem label="二次比对:皇冠变盘">
                                <NRadioGroup v-model:value="settings.allow_promote_1">
                                    <NFlex size="large">
                                        <NRadio :value="true">开启</NRadio>
                                        <NRadio :value="false">关闭</NRadio>
                                    </NFlex>
                                </NRadioGroup>
                            </NFormItem>
                            <NFormItem label="二次比对:皇冠水位">
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
                                    <SpecialEnableEditor :list="settings.special_enable" />
                                    <span
                                        >满足任一规则，则忽略"推荐:半场","推荐:角球"和"推荐:半场角球"，直接进入推荐</span
                                    >
                                </NFlex>
                            </NFormItem>
                            <NFormItem label="推荐方向:全局">
                                <NRadioGroup v-model:value="settings.promote_reverse">
                                    <NFlex size="large">
                                        <NRadio :value="false">正推</NRadio>
                                        <NRadio :value="true">反推</NRadio>
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
                            <NFormItem label="推荐方向:特殊">
                                <NFlex :vertical="true" :inline="false" :style="{ flex: 1 }">
                                    <SpecialReverseEditor :list="settings.special_reverse" />
                                    <span>规则越靠前，优先级越高</span>
                                </NFlex>
                            </NFormItem>
                        </NFlex>
                    </NForm>
                </NCard>
            </NCol>
            <NCol :span="10">
                <NFlex :vertical="true" :inline="false">
                    <NCard :segmented="true" size="small" title="Surebet抓取配置">
                        <NForm
                            labelPlacement="left"
                            labelWidth="80px"
                            :showFeedback="false"
                            :disabled="loading"
                        >
                            <NFlex :vertical="true" size="large">
                                <NFormItem label="min-profit">
                                    <NInput v-model:value="settings.surebet_min_profit" />
                                </NFormItem>
                                <NFormItem label="max-profit">
                                    <NInput v-model:value="settings.surebet_max_profit" />
                                </NFormItem>
                                <NFormItem label="outcomes">
                                    <NInput v-model:value="settings.surebet_outcomes" />
                                </NFormItem>
                                <NFormItem label="startOf">
                                    <NInput v-model:value="settings.surebet_start_of" />
                                </NFormItem>
                                <NFormItem label="endOf">
                                    <NInput v-model:value="settings.surebet_end_of" />
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
