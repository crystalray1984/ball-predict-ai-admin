import axios from 'axios'

const context = new AudioContext()

export function createAudio(src: string) {
    let buffer: AudioBuffer | undefined = undefined

    axios.get(src, { responseType: 'arraybuffer' }).then(async (resp) => {
        buffer = await context.decodeAudioData(resp.data)
    })

    const play = () => {
        if (!buffer) return
        const source = context.createBufferSource()
        source.buffer = buffer
        source.connect(context.destination)
        source.addEventListener('ended', () => {
            source.disconnect()
        })
        source.start()
    }

    return {
        play,
    }
}
