<script setup lang="tsx">
import DesktopClientVersionEditor from '@/components/DesktopClientVersionEditor.vue'
import { ActionModal } from '@/components/modal'
import PageGrid from '@/components/PageGrid.vue'
import { api, upload } from '@/libs/api'
import { useListLoader } from '@/libs/loader'
import {
    NButton,
    NForm,
    NFormItem,
    NPagination,
    NSelect,
    NDataTable,
    type DataTableColumn,
    NDropdown,
    useMessage,
} from 'naive-ui'
import { reactive } from 'vue'

interface Filter {
    platform: 'win32' | 'darwin'
    arch?: 'x64' | 'ia32'
}

const filter = reactive<Filter>({
    platform: 'win32',
    arch: 'x64',
})

const activeFilter: Filter = {
    platform: 'win32',
    arch: 'x64',
}

const { list, load, loading, pagination } = useListLoader<DesktopClientVersion>({
    loader: (params) =>
        api({
            url: '/admin/version/list',
            data: {
                ...activeFilter,
                ...params,
            },
        }),
})

const applyFilter = () => {
    activeFilter.platform = filter.platform
    activeFilter.arch = filter.platform === 'win32' ? filter.arch : undefined
    load(1)
}

const columns: DataTableColumn<DesktopClientVersion>[] = [
    {
        key: 'platform',
        title: '平台',
    },
    {
        key: 'arch',
        title: '架构',
    },
    {
        key: 'version',
        title: '版本号',
    },
    {
        key: 'status',
        title: '状态',
    },
    {
        key: 'full_url',
        title: '完整包下载地址',
    },
    {
        key: 'actions',
    },
]

const editModal = reactive({
    show: false,
    data: null as unknown as DesktopClientVersion,
    sending: false,
})

const createVersion = (platform: 'win32' | 'darwin') => {
    editModal.data = {
        id: 0,
        platform,
        arch: platform === 'win32' ? 'x64' : '',
        version: '',
        is_mandatory: 1,
        status: 1,
    }
    editModal.show = true
}

const message = useMessage()
/**
 * 保存版本
 */
const saveVersion = async () => {
    const version = editModal.data
    version.version = version.version.trim()
    if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version.version)) {
        message.warning('请输入正确的版本号')
        return
    }

    if (!version.id && !version.full_file) {
        message.warning('请上传全量安装包')
        return
    }

    if (version.platform === 'win32') {
        if (version.full_file && !version.full_blockmap) {
            message.warning('请上传全量安装包blockmap')
            return
        }
    } else {
        if (!version.id && !version.hot_update_file) {
            message.warning('请上传更新包')
            return
        }

        if (version.hot_update_file && !version.hot_update_blockmap) {
            message.warning('请上传更新包blockmap')
            return
        }
    }

    editModal.sending = true

    //开始上传
    // if (version.full_file) {
    //     const ret = await upload({
    //         file: version.full_file,
    //         type: 'update',
    //         onProgress: (evt) => console.log(evt),
    //     })
    // }

    if (version.full_blockmap) {
        const ret = await upload({
            file: version.full_blockmap,
            type: 'update',
            onProgress: (evt) => console.log(evt),
        })
    }

    editModal.sending = false
}
</script>
<template>
    <PageGrid :useContentScroller="false">
        <template #header>
            <NForm :inline="true" labelPlacement="left" :disabled="loading" :showFeedback="false">
                <NFormItem label="平台">
                    <NSelect
                        v-model:value="filter.platform"
                        :options="[
                            { value: 'win32', label: 'Windows' },
                            { value: 'darwin', label: 'MacOS' },
                        ]"
                        :consistentMenuWidth="false"
                    />
                </NFormItem>
                <NFormItem v-if="filter.platform === 'win32'" label="架构">
                    <NSelect
                        v-model:value="filter.arch"
                        :options="[
                            { value: 'x64', label: '64位' },
                            { value: 'ia32', label: '32位' },
                        ]"
                        :consistentMenuWidth="false"
                    />
                </NFormItem>
                <NFormItem>
                    <NButton type="primary" :loading="loading" @click="applyFilter">查询</NButton>
                </NFormItem>
                <NFormItem>
                    <NDropdown
                        trigger="click"
                        :options="[
                            {
                                key: 'win32',
                                label: '添加Windows版',
                            },
                            {
                                key: 'darwin',
                                label: '添加MacOS版',
                            },
                        ]"
                        @select="(key) => createVersion(key)"
                    >
                        <NButton type="info">添加新版本</NButton>
                    </NDropdown>
                </NFormItem>
            </NForm>
        </template>
        <NDataTable
            :data="list"
            :rowKey="(t) => t.id"
            :columns="columns"
            :pagination="false"
            :loading="loading"
            size="small"
            :striped="true"
            :bordered="true"
            :singleLine="false"
            maxHeight="100%"
        />
        <template #footer>
            <NPagination v-bind="pagination" />
        </template>
    </PageGrid>

    <ActionModal
        v-model:show="editModal.show"
        :title="editModal.data?.id === 0 ? '添加新版本' : '编辑版本'"
        :style="{ width: '500px' }"
        :data="editModal.data"
        :sending="editModal.sending"
        @positiveClick="saveVersion"
    >
        <DesktopClientVersionEditor :data="editModal.data" :disabled="editModal.sending" />
    </ActionModal>
</template>
