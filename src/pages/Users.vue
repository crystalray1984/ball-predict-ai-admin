<script setup lang="tsx">
import { ActionModal } from '@/components/modal'
import PageGrid from '@/components/PageGrid.vue'
import { api } from '@/libs/api'
import { date, dateTime, USER_REG_SOURCE_TEXT } from '@/libs/helpers'
import { useListLoader } from '@/libs/loader'
import dayjs from 'dayjs'
import { trim } from 'lodash-es'
import {
    NButton,
    NDataTable,
    NDatePicker,
    NFlex,
    NForm,
    NFormItem,
    NInput,
    NInputGroup,
    NInputNumber,
    NPagination,
    NRadio,
    NRadioGroup,
    NSelect,
    NText,
    useMessage,
    type DataTableColumn,
} from 'naive-ui'
import { computed, onMounted, reactive } from 'vue'

const filter = reactive({
    reg_source: undefined as string | undefined,
    search_type: 'luffa_id',
    search_value: '',
    register_dates: undefined as undefined | [number, number],
})

let activeFilter: Record<string, any> = {}

const { list, load, loading, pagination } = useListLoader<User>({
    loader: (params) =>
        api({
            url: '/admin/user/list',
            data: {
                ...activeFilter,
                ...params,
            },
        }),
})

const applyFilter = () => {
    activeFilter = {
        reg_source: filter.reg_source,
        [filter.search_type]: trim(filter.search_value),
    }
    if (filter.register_dates) {
        activeFilter.register_date_start = date(filter.register_dates[0])
        activeFilter.register_date_end = date(filter.register_dates[1])
    }

    load(1)
}

onMounted(applyFilter)

const regSourceOptions = Object.entries(USER_REG_SOURCE_TEXT).map(([value, label]) => ({
    value,
    label,
}))

const columns: DataTableColumn<User>[] = [
    {
        key: 'id',
        title: 'ID',
        width: 60,
    },
    {
        key: 'luffa_id',
        title: 'Luffa ID',
        render: (row) => row.luffa?.account,
    },
    {
        key: 'reg_source',
        title: '来源',
        width: 100,
        render: (row) => USER_REG_SOURCE_TEXT[row.reg_source],
    },
    {
        key: 'status',
        title: '状态',
        width: 80,
        render: (row) =>
            row.status ? <NText type="success">正常</NText> : <NText type="error">已禁用</NText>,
    },
    {
        key: 'expire',
        title: 'VIP到期时间',
        render: (row) => (
            <NFlex>
                <NText delete={!!row.is_expired}>{dateTime(row.expire_time)}</NText>
                {!!row.is_expired && <NText type="error">已过期</NText>}
            </NFlex>
        ),
    },
    {
        key: 'created_at',
        title: '注册时间',
        render: (row) => dateTime(row.created_at),
    },
    {
        key: 'actions',
        title: '',
        render: (row) => {
            return (
                <NFlex>
                    <NButton
                        size="tiny"
                        ghost={true}
                        type="primary"
                        onClick={() => openUserStatusModal(row)}
                    >
                        状态
                    </NButton>
                    <NButton
                        size="tiny"
                        ghost={true}
                        type="warning"
                        onClick={() => openUserExpireModal(row)}
                    >
                        VIP有效期
                    </NButton>
                </NFlex>
            )
        },
    },
]

const userStatusModal = reactive({
    show: false,
    user_id: 0,
    status: 0,
    sending: false,
})

const openUserStatusModal = (user: User) => {
    userStatusModal.user_id = user.id
    userStatusModal.status = user.status
    userStatusModal.show = true
}

const message = useMessage()

const submitUserStatus = async () => {
    userStatusModal.sending = true
    const ret = await api({
        url: '/admin/user/set_status',
        data: {
            user_id: userStatusModal.user_id,
            status: userStatusModal.status,
        },
    })
    if (ret.code) {
        message.error(ret.msg)
        userStatusModal.sending = false
        return
    }

    const row = list.value.find((t) => t.id === userStatusModal.user_id)
    if (row) {
        row.status = userStatusModal.status
    }
    message.success('操作成功')
    userStatusModal.sending = false
    userStatusModal.show = false
}

const userExpireModal = reactive({
    show: false,
    user_id: 0,
    mode: 'add',
    days: 1,
    raw_expire_time: '',
    expire_time: 0,
    sending: false,
})

const nextExpireTime = computed(() => {
    if (!userExpireModal.raw_expire_time) return ''
    return dateTime(dayjs(userExpireModal.raw_expire_time).add(userExpireModal.days, 'day'))
})

const openUserExpireModal = (user: User) => {
    userExpireModal.raw_expire_time = user.expire_time
    userExpireModal.expire_time = dayjs(user.expire_time).valueOf()
    userExpireModal.user_id = user.id
    userExpireModal.show = true
}

const submitUserExpire = async () => {
    userExpireModal.sending = true

    const data: Record<string, any> = {
        user_id: userExpireModal.user_id,
    }
    if (userExpireModal.mode === 'add') {
        data.days = userExpireModal.days
    } else {
        data.expire_time = dateTime(userExpireModal.expire_time)
    }

    const ret = await api<User>({
        url: '/admin/user/set_expire_time',
        data,
    })
    if (ret.code) {
        message.error(ret.msg)
        userExpireModal.sending = false
        return
    }

    const row = list.value.find((t) => t.id === userExpireModal.user_id)
    if (row) {
        row.expire_time = ret.data.expire_time
        row.is_expired = ret.data.is_expired
    }
    message.success('操作成功')
    userExpireModal.sending = false
    userExpireModal.show = false
}
</script>
<template>
    <PageGrid :useContentScroller="false">
        <template #header>
            <NForm labelPlacement="left" :inline="true" :showFeedback="false" :disabled="loading">
                <NFormItem label="来源">
                    <NSelect
                        v-model:value="filter.reg_source"
                        :options="regSourceOptions"
                        :clearable="true"
                        placeholder="所有"
                        :style="{
                            minWidth: '100px',
                        }"
                        :consistentMenuWidth="false"
                    />
                </NFormItem>
                <NFormItem label="搜索">
                    <NInputGroup>
                        <NSelect
                            v-model:value="filter.search_type"
                            :options="[
                                {
                                    value: 'luffa_id',
                                    label: 'Luffa ID',
                                },
                                {
                                    value: 'email',
                                    label: '邮箱',
                                },
                            ]"
                            :consistentMenuWidth="false"
                        />
                        <NInput
                            v-model:value="filter.search_value"
                            placeholder=""
                            :clearable="true"
                        />
                    </NInputGroup>
                </NFormItem>
                <NFormItem label="注册时间">
                    <NDatePicker
                        type="daterange"
                        v-model:value="filter.register_dates"
                        :inputReadonly="true"
                        :clearable="true"
                    />
                </NFormItem>
                <NButton type="primary" :loading="loading" @click="applyFilter">查询</NButton>
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
        :title="`修改状态 ID:${userStatusModal.user_id}`"
        v-model:show="userStatusModal.show"
        :data="true"
        :sending="userStatusModal.sending"
        :style="{ width: '200px' }"
        @positiveClick="submitUserStatus"
    >
        <NRadioGroup v-model:value="userStatusModal.status" :disabled="userStatusModal.sending">
            <NFlex size="large">
                <NRadio :value="1">正常</NRadio>
                <NRadio :value="0">禁用</NRadio>
            </NFlex>
        </NRadioGroup>
    </ActionModal>

    <ActionModal
        :title="`修改VIP有效期 ID:${userExpireModal.user_id}`"
        v-model:show="userExpireModal.show"
        :data="true"
        :sending="userExpireModal.sending"
        :style="{ width: '400px' }"
        @positiveClick="submitUserExpire"
    >
        <NForm labelPlacement="left" labelWidth="86px" :disabled="userExpireModal.sending">
            <NFormItem label="修改方式">
                <NRadioGroup v-model:value="userExpireModal.mode">
                    <NFlex size="large">
                        <NRadio value="add">增加天数</NRadio>
                        <NRadio value="set">设置时间</NRadio>
                    </NFlex>
                </NRadioGroup>
            </NFormItem>
            <template v-if="userExpireModal.mode === 'add'">
                <NFormItem label="当前有效期">
                    {{ dateTime(userExpireModal.raw_expire_time) }}
                </NFormItem>
                <NFormItem label="增加天数">
                    <NInputNumber
                        v-model:value="userExpireModal.days"
                        :min="1"
                        :step="1"
                        :precision="0"
                    />
                </NFormItem>
                <NFormItem label="增加后有效期">
                    {{ nextExpireTime }}
                </NFormItem>
            </template>

            <NFormItem v-else-if="userExpireModal.mode === 'set'" label="有效期">
                <NDatePicker
                    v-model:value="userExpireModal.expire_time"
                    type="datetime"
                    :inputReadonly="true"
                />
            </NFormItem>
        </NForm>
    </ActionModal>
</template>
