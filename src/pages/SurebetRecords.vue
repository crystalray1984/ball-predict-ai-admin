<script setup lang="tsx">
import { date } from '@/libs/helpers'
import dayjs from 'dayjs'
import { NForm, NFormItem, NDatePicker, NButton } from 'naive-ui'
import { reactive } from 'vue'

const start = dayjs().subtract(6, 'day').startOf('day')
const end = dayjs().add(1, 'day').startOf('day')

const filter = reactive({
    dates: [start.valueOf(), end.valueOf()] as [number, number],
})

/**
 * 导出
 */
const doExport = () => {
    const params = {
        date_start: date(filter.dates[0]),
        date_end: date(filter.dates[1]),
    }

    const form = document.createElement('form')
    form.style.display = 'none'
    form.method = 'POST'
    form.action = new URL(
        '/admin/surebet_record/export',
        import.meta.env.VITE_API_URL || location.href,
    ).href
    form.enctype = 'application/x-www-form-urlencoded'

    Object.entries(params).forEach(([name, value]) => {
        if (typeof value === 'undefined' || value === null) return
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = name
        input.value = String(value)
        form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
}
</script>
<template>
    <div class="page">
        <NForm :inline="true" labelPlacement="left" :showFeedback="false">
            <NFormItem label="推送时间范围">
                <NDatePicker type="daterange" v-model:value="filter.dates" :inputReadonly="true" />
            </NFormItem>
            <NFormItem>
                <NButton type="primary" @click="doExport">导出数据</NButton>
            </NFormItem>
        </NForm>
    </div>
</template>
