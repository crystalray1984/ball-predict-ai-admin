<script setup lang="tsx">
import {
    NCol,
    NEllipsis,
    NFlex,
    NForm,
    NFormItem,
    NInput,
    NRadio,
    NRadioGroup,
    NRow,
    NSelect,
    NSwitch,
} from 'naive-ui'
import type { PropType } from 'vue'
import { FilePicker } from './FilePicker'

const props = defineProps({
    data: {
        type: Object as PropType<DesktopClientVersion>,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
})
</script>
<template>
    <NForm :showFeedback="false" :disabled="disabled">
        <NRow :gutter="[20, 20]">
            <NCol v-if="data.platform === 'win32'" :span="12">
                <NFormItem label="架构">
                    <NSelect
                        v-model:value="data.arch"
                        :options="[
                            { value: 'x64', label: '64位' },
                            { value: 'ia32', label: '32位' },
                        ]"
                        :consistentMenuWidth="false"
                    />
                </NFormItem>
            </NCol>
            <NCol :span="12">
                <NFormItem label="版本号" :required="true">
                    <NInput v-model:value="data.version" />
                </NFormItem>
            </NCol>
            <NCol :span="12">
                <NFormItem label="强制更新">
                    <NSwitch
                        v-model:value="data.is_mandatory"
                        :checkedValue="1"
                        :uncheckedValue="0"
                    />
                </NFormItem>
            </NCol>
            <NCol :span="12">
                <NFormItem label="状态">
                    <NRadioGroup v-model:value="data.status">
                        <NFlex size="large">
                            <NRadio :value="0">未发布</NRadio>
                            <NRadio :value="1">已发布</NRadio>
                        </NFlex>
                    </NRadioGroup>
                </NFormItem>
            </NCol>
            <NCol :span="24">
                <NFormItem label="全量安装包" :required="!data.id && !data.full_info">
                    <NFlex :wrap="false" align="center" :style="{ flex: 1 }">
                        <FilePicker
                            :accept="data.platform === 'win32' ? '.zip' : '.dmg'"
                            @select="(file) => (data.full_file = file)"
                        />
                        <NEllipsis v-if="data.full_file">{{ data.full_file.name }}</NEllipsis>
                    </NFlex>
                </NFormItem>
            </NCol>
            <template v-if="data.full_file">
                <NCol :span="24">
                    <NFormItem label="更新包" :required="!data.hot_update_info">
                        <NFlex align="center">
                            <FilePicker
                                :accept="data.platform === 'win32' ? '.exe' : '.zip'"
                                @select="(file) => (data.hot_update_file = file)"
                            />
                            <NEllipsis v-if="data.hot_update_file">{{
                                data.hot_update_file.name
                            }}</NEllipsis>
                        </NFlex>
                    </NFormItem>
                </NCol>
                <NCol v-if="data.hot_update_file" :span="24">
                    <NFormItem label="更新包Blockmap" :required="true">
                        <NFlex align="center">
                            <FilePicker
                                accept=".blockmap"
                                @select="(file) => (data.hot_update_blockmap = file)"
                            />
                            <NEllipsis v-if="data.hot_update_blockmap">{{
                                data.hot_update_blockmap.name
                            }}</NEllipsis>
                        </NFlex>
                    </NFormItem>
                </NCol>
            </template>
        </NRow>
    </NForm>
</template>
