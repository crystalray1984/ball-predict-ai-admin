import { useDialog as _useDialog, type DialogOptions } from 'naive-ui'

export function useDialog() {
    const dialog = _useDialog()

    const confirm = (options: DialogOptions) => {
        return new Promise<boolean>((resolve) => {
            dialog.warning({
                positiveText: '确定',
                negativeText: '取消',
                ...options,
                maskClosable: false,
                onPositiveClick: () => {
                    resolve(true)
                },
                onNegativeClick: () => {
                    resolve(false)
                },
                onEsc: () => {
                    resolve(false)
                },
            })
        })
    }

    const confirmAndWait = (options: DialogOptions) => {
        return new Promise<(() => void) | void>((resolve) => {
            const instance = dialog.warning({
                positiveText: '确定',
                negativeText: '取消',
                ...options,
                maskClosable: false,
                onPositiveClick: () => {
                    instance.loading = true
                    instance.closeOnEsc = false
                    instance.closable = false
                    instance.negativeButtonProps = Object.assign(
                        instance.negativeButtonProps ?? {},
                        { disabled: true },
                    )
                    instance.positiveButtonProps = Object.assign(
                        instance.positiveButtonProps ?? {},
                        { loading: true },
                    )

                    return new Promise<void>((close) => {
                        resolve(close)
                    })
                },
                onNegativeClick: () => {
                    resolve()
                },
                onEsc: () => {
                    resolve()
                },
            })
        })
    }

    return {
        confirm,
        confirmAndWait,
    }
}
