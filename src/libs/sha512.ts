import CryptoJS from 'crypto-js'
import Sha512FileWorker from './sha512-file-worker?worker'

/**
 * 计算输入值的sha512
 * @param input
 */
export function sha512(input: string): string {
    return CryptoJS.SHA512(input).toString(CryptoJS.enc.Base64)
}

/**
 * 计算文件的sha512
 * @param input
 */
export function sha512File(input: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const worker = new Sha512FileWorker()
        worker.addEventListener('message', (event) => {
            resolve(event.data)
            worker.terminate()
        })
        worker.addEventListener('error', (event) => {
            reject(event.error)
            worker.terminate()
        })
        worker.postMessage(input)
    })
}
