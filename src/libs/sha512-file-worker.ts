import CryptoJS from 'crypto-js'

const CHUNK_SIZE = 1024000

onmessage = function (event) {
    const input = event.data as Blob

    let index = 0
    const chunks = Math.ceil(input.size / CHUNK_SIZE)

    const hash = CryptoJS.algo.SHA512.create()
    const reader = new FileReader()
    reader.addEventListener('load', () => {
        hash.update(CryptoJS.lib.WordArray.create(reader.result as ArrayBuffer))
        index++
        read()
    })

    const read = () => {
        if (index >= chunks) {
            self.postMessage(hash.finalize().toString(CryptoJS.enc.Base64))
            return
        }

        reader.readAsArrayBuffer(input.slice(CHUNK_SIZE * index, CHUNK_SIZE * (index + 1)))
    }

    read()
}
