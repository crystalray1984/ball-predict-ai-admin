<script setup lang="tsx">
import { ActionModal } from '@/components/modal'
import PageGrid from '@/components/PageGrid.vue'
import { api } from '@/libs/api'
import { useTournamentLabels } from '@/libs/query'
import { useDialog } from '@/libs/ui'
import type { DataTableColumn } from 'naive-ui'
import {
    NButton,
    NDataTable,
    NFlex,
    NForm,
    NFormItem,
    NInput,
    NInputGroup,
    NSelect,
    useMessage,
} from 'naive-ui'
import { reactive } from 'vue'

const message = useMessage()

const { data, isFetching, refetch } = useTournamentLabels({
    refetchOnMount: 'always',
})

const columns: DataTableColumn<TournamentLabel>[] = [
    {
        key: 'title',
        title: '标签',
    },

    {
        key: 'luffa_type',
        title: '推送目标类型',
        render: (row) => (row.luffa_type === 1 ? 'Luffa群' : 'Luffa用户'),
    },
    {
        key: 'luffa_uid',
        title: '推送目标',
    },
    {
        key: 'actions',
        render: (row) => (
            <NFlex align="center">
                <NButton type="primary" size="tiny" onClick={() => editItem(row)}>
                    编辑
                </NButton>
                <NButton type="error" size="tiny" onClick={() => removeItem(row)}>
                    删除
                </NButton>
            </NFlex>
        ),
    },
]

const editModal = reactive({
    sending: false,
    show: false,
    data: null as unknown as TournamentLabel,
    link: '',
})

const addItem = () => {
    editModal.data = {
        id: 0,
        luffa_type: 1,
        luffa_uid: '',
        title: '',
    }
    editModal.link = ''
    editModal.show = true
}

const editItem = (raw: TournamentLabel) => {
    editModal.data = { ...raw }
    editModal.link = ''
    editModal.show = true
}

const parseLuffaLink = () => {
    const link = editModal.link.trim()
    const match = /^https:\/\/callup\.luffa\.im\/g\/([^/]+)/.exec(link)
    if (!match) {
        message.warning('无效的Luffa群链接')
        return
    }
    editModal.data.luffa_type = 1
    editModal.data.luffa_uid = match[1]
}

const saveItem = async () => {
    editModal.data.title = editModal.data.title.trim()
    editModal.data.luffa_uid = editModal.data.luffa_uid.trim()

    if (editModal.data.title === '') {
        message.warning('标签不能为空')
        return
    }
    if (editModal.data.luffa_uid === '') {
        message.warning('推送目标不能为空')
        return
    }

    editModal.sending = true
    const ret = await api({
        url: '/admin/match/label/save',
        data: {
            ...editModal.data,
        },
    })
    editModal.sending = false
    if (ret.code !== 0) {
        message.error(ret.msg)
    } else {
        editModal.sending = false
        editModal.show = false
        message.success('保存成功')
        refetch()
    }
}

const dialog = useDialog()
const removeItem = async (row: TournamentLabel) => {
    const close = await dialog.confirmAndWait({
        title: `确认要删除标签“${row.title}”？`,
    })
    if (!close) return
    const ret = await api({
        url: '/admin/match/label/delete',
        data: {
            id: row.id,
        },
    })
    if (ret.code === 0) {
        refetch()
    } else {
        message.warning(ret.msg)
    }
    close()
}
</script>
<template>
    <PageGrid :useContentScroller="false">
        <template #header>
            <NFlex>
                <NButton
                    type="primary"
                    :loading="isFetching"
                    @click="
                        () => {
                            refetch()
                        }
                    "
                    >刷新</NButton
                >
                <NButton type="info" :disabled="isFetching" @click="addItem">添加标签</NButton>
            </NFlex>
        </template>
        <NDataTable
            :data="data"
            :rowKey="(t) => t.id"
            :columns="columns"
            :loading="isFetching"
            :pagination="false"
            size="small"
            :striped="true"
            :bordered="true"
            :singleLine="false"
            maxHeight="100%"
        />
    </PageGrid>
    <ActionModal
        v-model:show="editModal.show"
        :title="editModal.data?.id ? '编辑标签' : '添加标签'"
        :style="{ width: '500px' }"
        :data="editModal.data"
        :sending="editModal.sending"
        @positiveClick="saveItem"
    >
        <NForm
            labelPlacement="left"
            labelWidth="62px"
            :disabled="editModal.sending"
            :showFeedback="false"
        >
            <NFlex :vertical="true" size="large">
                <NFormItem label="标签">
                    <NInput v-model:value="editModal.data.title" :maxlength="50" />
                </NFormItem>
                <NFormItem label="推送目标">
                    <NFlex :vertical="true" :style="{ width: '100%' }">
                        <NInputGroup>
                            <NSelect
                                v-model:value="editModal.data.luffa_type"
                                :options="[
                                    { value: 1, label: 'Luffa群' },
                                    { value: 0, label: 'Luffa用户' },
                                ]"
                                :style="{ width: '150px' }"
                            />
                            <NInput
                                v-model:value="editModal.data.luffa_uid"
                                placeholder="推送目标ID"
                            />
                        </NInputGroup>

                        <NInputGroup>
                            <NInput
                                v-model:value="editModal.link"
                                placeholder="粘贴Luffa群分享链接自动解析"
                            />
                            <NButton type="info" @click="parseLuffaLink">解析</NButton>
                        </NInputGroup>
                    </NFlex>
                </NFormItem>
            </NFlex>
        </NForm>
    </ActionModal>
</template>
