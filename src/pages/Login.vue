<script setup lang="ts">
import { api } from '@/libs/api'
import { useApiQuery } from '@/libs/query'
import { useAdmin } from '@/libs/store'
import { token } from '@/libs/token'
import { trim } from 'lodash-es'
import md5 from 'md5'
import { NButton, NCard, NForm, NFormItem, NInput, useMessage } from 'naive-ui'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const adminStore = useAdmin()
const router = useRouter()
const message = useMessage()
const form = reactive({
    username: '',
    password: '',
    code: '',
})
const isLoginning = ref(false)

const { data: captcha, refetch: refreshCaptcha } = useApiQuery({
    queryKey: ['/api/common/captcha'],
    queryFn: () =>
        api<{
            key: string
            base64: string
        }>({
            url: '/api/common/captcha',
        }),
    refetchOnMount: 'always',
    staleTime: 0,
})

/**
 * 执行登录
 */
const login = async () => {
    if (isLoginning.value) return

    //数据检查
    form.username = trim(form.username)
    if (form.username === '') {
        message.warning('请输入账号')
        return
    }

    if (form.password === '') {
        message.warning('请输入密码')
        return
    }

    form.code = trim(form.code)
    if (form.code === '') {
        message.warning('请输入验证码')
        return
    }

    isLoginning.value = true

    const ret = await api<{
        token: string
        user: Admin
    }>({
        url: '/admin/admin/login',
        token: '',
        data: {
            ...form,
            password: md5(form.password),
            code_key: captcha.value?.key,
        },
    })

    if (ret.code) {
        refreshCaptcha()
        message.error(ret.msg)
        isLoginning.value = false
        return
    }

    token.value = ret.data.token
    adminStore.admin = ret.data.user
    router.replace('/')
}
</script>
<template>
    <div class="login-page">
        <NCard class="login-card">
            <NForm size="large" class="login-form" :showFeedback="false" :disabled="isLoginning">
                <NFormItem label="账号">
                    <NInput v-model:value="form.username" />
                </NFormItem>
                <NFormItem label="密码">
                    <NInput type="password" v-model:value="form.password" />
                </NFormItem>
                <NFormItem label="验证码">
                    <div class="code-field">
                        <NInput v-model:value="form.code" />
                        <img
                            v-if="captcha"
                            :src="captcha.base64"
                            class="code-img"
                            @click="
                                () => {
                                    if (!isLoginning) {
                                        refreshCaptcha()
                                    }
                                }
                            "
                        />
                    </div>
                </NFormItem>
                <NButton
                    size="large"
                    type="primary"
                    :block="true"
                    :loading="isLoginning"
                    @click="login"
                >
                    登录
                </NButton>
            </NForm>
        </NCard>
    </div>
</template>
<style lang="less" scoped>
.login-page {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-card {
    width: 400px;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .code-field {
        width: 100%;
        display: flex;
        gap: 10px;

        .n-input {
            flex: 1;
        }

        .code-img {
            height: 40px;
            width: auto;
            flex-shrink: 0;
            display: block;
            cursor: pointer;
        }
    }
}
</style>
