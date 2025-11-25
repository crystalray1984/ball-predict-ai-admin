<script setup lang="tsx">
import DesktopClientVersionEditor from '@/components/DesktopClientVersionEditor.vue'
import { ActionModal } from '@/components/modal'
import PageGrid from '@/components/PageGrid.vue'
import { api, upload } from '@/libs/api'
import { useListLoader } from '@/libs/loader'
import { sha512File } from '@/libs/sha512'
import dayjs from 'dayjs'
import {
    NA,
    NButton,
    NDataTable,
    NDropdown,
    NFlex,
    NForm,
    NFormItem,
    NPagination,
    NSelect,
    NText,
    useMessage,
    type DataTableColumn,
} from 'naive-ui'
import { reactive } from 'vue'

interface Filter {
    platform: 'win32' | 'darwin'
}

const filter = reactive<Filter>({
    platform: 'win32',
})

const activeFilter: Filter = {
    platform: 'win32',
}

const { list, load, loading, pagination, page } = useListLoader<DesktopClientVersionInList>({
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
    load(1)
}

const columns: DataTableColumn<DesktopClientVersionInList>[] = [
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
        render: (row) =>
            row.status === 1 ? (
                <NText type="success">已发布</NText>
            ) : (
                <NText type="error">未发布</NText>
            ),
    },
    {
        key: 'full_info',
        title: '完整安装包',
        render: (row) => (
            <NA href={row.full_info?.url} target="_blank">
                点击下载
            </NA>
        ),
    },
    {
        key: 'hot_update_info',
        title: '更新包',
        render: (row) => (
            <NA href={row.hot_update_info?.url} target="_blank">
                点击下载
            </NA>
        ),
    },
    {
        key: 'created_at',
        title: '创建时间',
        render: (row) => dayjs(row.created_at).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
        key: 'updated_at',
        title: '更新时间',
        render: (row) => dayjs(row.updated_at).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
        key: 'actions',
        render: (row) => (
            <NFlex>
                <NButton size="tiny" type="primary" onClick={() => editVersion(row)}>
                    编辑
                </NButton>
            </NFlex>
        ),
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

const editVersion = (raw: DesktopClientVersion) => {
    const data = { ...raw }
    delete data.full_info
    delete data.hot_update_info
    editModal.data = data
    editModal.show = true
}

const uploading = reactive({
    uploading: false,
    title: '',
    percent: 0,
})

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

    if (!version.id) {
        if (!version.full_info && !version.full_file) {
            message.warning('请上传全量安装包')
            return
        }

        if (!version.hot_update_info && !version.hot_update_file) {
            message.warning('请上传更新包')
            return
        }
    }

    if (version.hot_update_file && !version.hot_update_blockmap) {
        message.warning('请上传更新包blockmap')
        return
    }

    editModal.sending = true
    uploading.uploading = false

    //开始上传
    if (version.full_file) {
        uploading.percent = 0
        uploading.uploading = true

        const hot_update_file = version.hot_update_file!
        const hot_update_blockmap = version.hot_update_blockmap!

        uploading.title = '更新包上传中'
        uploading.percent = 0

        const retHotUpdate = await upload({
            file: hot_update_file,
            type: 'temp',
            onProgress: (evt) => {
                uploading.percent = Math.floor((evt.loaded * 100) / evt.total)
            },
        })

        if (retHotUpdate.code) {
            editModal.sending = false
            message.error(retHotUpdate.msg)
            return
        }

        uploading.percent = 100

        const retHotUpdateBlockmap = await upload({
            file: hot_update_blockmap,
            type: 'temp',
        })

        if (retHotUpdateBlockmap.code) {
            editModal.sending = false
            message.error(retHotUpdateBlockmap.msg)
            return
        }

        uploading.title = '更新包hash计算中'
        uploading.percent = 0
        const hash = await sha512File(hot_update_file)

        version.hot_update_info = {
            path: retHotUpdate.data.path,
            hash,
            size: hot_update_file.size,
            blockmap: retHotUpdateBlockmap.data.path,
        }
        delete version.hot_update_file
        delete version.hot_update_blockmap

        uploading.title = '全量安装包上传中'
        uploading.percent = 0

        const retFull = await upload({
            file: version.full_file,
            type: 'temp',
            onProgress: (evt) => {
                uploading.percent = Math.floor((evt.loaded * 100) / evt.total)
            },
        })
        if (retFull.code) {
            editModal.sending = false
            message.error(retFull.msg)
            return
        }

        version.full_info = {
            path: retFull.data.path,
            size: version.full_file.size,
            hash: '',
        }

        delete version.full_file
        uploading.percent = 100
    }

    //提交数据
    const ret = await api({
        url: '/admin/version/save_desktop',
        data: version,
    })
    if (ret.code) {
        message.error(ret.msg)
    } else {
        message.success('保存成功')
        editModal.show = false
        if (page.value === 1) {
            load(1)
        }
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
        <template #actionExtra>
            <div v-if="uploading.uploading" class="progress">
                {{ uploading.title }} {{ uploading.percent }}%
            </div>
        </template>
    </ActionModal>
</template>
<style lang="less" scoped>
.progress {
    flex: 1;
}
</style>
