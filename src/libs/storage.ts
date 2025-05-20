import { STORAGE_PREFIX } from './config'

/**
 * 从本地数据存储区读取数据
 * @param key 数据键名
 */
export function getStorage<T>(key: string): T | undefined
/**
 * 从本地数据存储区读取数据
 * @param key 数据键名
 * @param defaultValue 读取失败时的默认值
 */
export function getStorage<T>(key: string, defaultValue: T): T
export function getStorage(key: string, defaultValue?: any) {
    key = `${STORAGE_PREFIX}${key}`
    const cache = localStorage.getItem(key)
    if (!cache) return defaultValue
    try {
        return JSON.parse(cache)
    } catch {
        return defaultValue
    }
}

/**
 * 保存数据到本地存储区
 * @param key
 * @param value
 */
export function setStorage(key: string, value: any) {
    key = `${STORAGE_PREFIX}${key}`
    if (
        typeof value === 'undefined' ||
        value === null ||
        typeof value === 'function' ||
        typeof value === 'symbol'
    ) {
        localStorage.removeItem(key)
    } else {
        localStorage.setItem(key, JSON.stringify(value))
    }
}
