import axios, { type AxiosRequestConfig } from 'axios'
import { token as appToken } from './token'

/**
 * 负责执行接口调用的axios实例
 */
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    method: 'POST',
    headers: {
        common: {
            __debug: '1',
        },
    },
})

export type OnAuthorzationFailHandler = () => void | Promise<void>

let _onAuthorizationFailHandler: OnAuthorzationFailHandler | undefined = undefined

/**
 * 全局设置访问接口验证失败时的回调
 * @param handler
 */
export function setOnAuthorzationFailHandler(handler?: OnAuthorzationFailHandler) {
    _onAuthorizationFailHandler = handler
}

/**
 * 接口调用的附加配置项
 */
export interface ApiAddons {
    token?: string
    throwOnFail?: boolean
    onAuthorizationFail?: OnAuthorzationFailHandler | undefined | false
}

export interface ApiOptions extends AxiosRequestConfig, ApiAddons {
    url: string
}

export class ApiError extends Error {
    public readonly code: number

    constructor(resp: ApiResp<any>) {
        super(resp.msg)
        this.code = resp.code
    }
}

export async function api<T = void>(options: ApiOptions): Promise<ApiResp<T>> {
    let { headers, token, throwOnFail = false, onAuthorizationFail, ...rest } = options

    //构建请求头中的token
    let tokenValue = ''
    if (typeof token === 'string') {
        tokenValue = token
    } else {
        tokenValue = appToken.value
    }
    if (tokenValue !== '') {
        if (headers) {
            headers.Authorization = `Bearer ${tokenValue}`
        } else {
            headers = {
                Authorization: `Bearer ${tokenValue}`,
            }
        }
    }

    //执行请求
    const resp = await instance.request<ApiResp<T>>({
        ...rest,
        headers,
    })

    //响应检查
    const ret = resp.data
    if (typeof ret === 'object' && ret && ret.code !== 0) {
        if (ret.code === 401) {
            //token验证失败
            if (typeof onAuthorizationFail === 'function') {
                await onAuthorizationFail()
            } else if (
                onAuthorizationFail !== false &&
                typeof _onAuthorizationFailHandler === 'function'
            ) {
                await _onAuthorizationFailHandler()
            }
        }

        if (throwOnFail) {
            throw new ApiError(ret)
        }
    }

    return ret
}

/**
 * 返回一个成功的响应
 */
export function success<T>(data: T): ApiResp<T>
export function success(): ApiResp<void>
export function success<T>(data?: T) {
    return {
        code: 0,
        msg: '',
        data,
    }
}

/**
 * 文件上传
 */
export interface UploadOptions {
    file: File
    type: string
    onProgress?: (data: { loaded: number; total: number }) => void
}

interface RawUploadForm {
    post_url: string
    fields: Record<string, any>
    file_path: string
    file_url: string
}

/**
 * 文件上传
 * @param options
 */
export async function upload(options: UploadOptions): Promise<ApiResp<RemoteFile>> {
    const { file, type, onProgress } = options

    const retForm = await api<RawUploadForm>({
        url: '/admin/common/create_upload_form',
        data: {
            type,
            filename: file.name,
        },
    })
    if (retForm.code) {
        return retForm as any
    }

    //上传
    const data = new FormData()
    Object.entries(retForm.data.fields).forEach(([name, value]) => data.append(name, value))
    data.append('file', file)

    await axios.request({
        url: retForm.data.post_url,
        method: 'POST',
        data,
        onUploadProgress: onProgress as any,
    })

    return success({
        url: retForm.data.file_url,
        path: retForm.data.file_path,
    })
}
