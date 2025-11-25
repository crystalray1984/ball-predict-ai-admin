import { NButton, NUpload, type UploadFileInfo, type UploadProps } from 'naive-ui'
import { defineComponent, h, markRaw, type DefineComponent } from 'vue'

export interface FilePickerProps extends UploadProps {
    onSelect?: (file: File) => void
    text?: string
}

export const FilePicker = defineComponent({
    name: 'FilePicker',
    props: {
        text: {
            type: String,
            default: '选择文件',
        },
    },
    setup(props, ctx) {
        const onBeforeUpload = ({ file }: { file: UploadFileInfo }) => {
            ctx.emit('select', markRaw(file.file!))
            return false
        }

        return () =>
            h(
                NUpload,
                {
                    ...ctx.attrs,
                    showFileList: false,
                    onBeforeUpload,
                    style: {
                        ...(ctx.attrs.style as any),
                        width: 'auto',
                    },
                },
                {
                    default: () => h(NButton, { type: 'primary' }, () => props.text),
                },
            )
    },
}) as DefineComponent<FilePickerProps>
