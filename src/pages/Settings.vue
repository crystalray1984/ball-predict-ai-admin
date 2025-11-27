<script setup lang="tsx">
import RockballConfigEditor from '@/components/RockballConfigEditor.vue'
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
                            <NFormItem label="一次比对:水位差">
                                <NInputGroup :style="{ width: '200px' }">
                                    <NInputGroupLabel>≥</NInputGroupLabel>
                                    <NInput v-model:value="settings.ready_condition" />
                                </NInputGroup>
                            </NFormItem>
                            <NFormItem label="停止追踪时间">
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
                            <NFormItem label="追踪目标">
                                <NFlex align="center">
                                    <NInputNumber
                                        v-model:value="settings.v3_check_max_duration"
                                        :style="{ width: '100px' }"
                                    />
                                    <span>分钟内水位下降达到</span>
                                    <NInput
                                        v-model:value="settings.v3_check_max_value"
                                        :style="{ width: '100px' }"
                                    />
                                </NFlex>
                            </NFormItem>
                            <NFormItem label="异常下降排除">
                                <NFlex align="center">
                                    <NInputNumber
                                        v-model:value="settings.v3_check_min_duration"
                                        :style="{ width: '100px' }"
                                    />
                                    <span>分钟内水位下降达到</span>
                                    <NInput
                                        v-model:value="settings.v3_check_min_value"
                                        :style="{ width: '100px' }"
                                    />
                                </NFlex>
                            </NFormItem>
                            <NFormItem label="推送水位条件">
                                <NFlex align="center">
                                    <NInput
                                        v-model:value="settings.v3_check_min_promote_value"
                                        :style="{ width: '100px' }"
                                    />
                                </NFlex>
                            </NFormItem>

                            <NFormItem label="新老融合推荐方向">
                                <NRadioGroup v-model:value="settings.surebet_v2_to_v3_back">
                                    <NRadio :value="0">正推</NRadio>
                                    <NRadio :value="1">反推</NRadio>
                                </NRadioGroup>
                            </NFormItem>
                            <NFormItem label="新老融合水位条件">
                                <NInput
                                    v-model:value="settings.surebet_v2_to_v3_min_value"
                                    :style="{ width: '100px' }"
                                />
                            </NFormItem>

                            <NFormItem label="对比推荐水位范围">
                                <NInputGroup>
                                    <NInput
                                        v-model:value="settings.mansion_min_value"
                                        placeholder=""
                                    />
                                    <NInputGroupLabel> - </NInputGroupLabel>
                                    <NInput
                                        v-model:value="settings.mansion_max_value"
                                        placeholder=""
                                    />
                                </NInputGroup>
                            </NFormItem>

                            <NFormItem label="滚球采集规则">
                                <RockballConfigEditor
                                    :list="settings.rockball_config"
                                    :disabled="loading"
                                />
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
