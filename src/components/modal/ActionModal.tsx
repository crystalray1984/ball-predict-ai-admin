import { NButton, NFlex } from 'naive-ui'
import { defineComponent, type DefineComponent } from 'vue'
import { ViewModal, type ViewModalProps } from './ViewModal'

export interface ActionModalProps extends ViewModalProps {
    sending?: boolean
}

/**
 * 默认带有确认取消按钮的操作弹窗
 */
export const ActionModal = defineComponent({
    name: 'ActionModal',
    emits: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        'update:show': (_show: boolean) => true,
    },
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        sending: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, ctx) {
        return function () {
            const attrs = ctx.attrs as ViewModalProps

            const closable = props.sending ? false : attrs.closable
            const closeOnEsc = props.sending ? false : attrs.closeOnEsc ?? false
            const maskClosable = props.sending ? false : attrs.maskClosable ?? false
            const loading = props.sending ? true : attrs.loading

            const slots = { ...ctx.slots }
            if (typeof slots.action !== 'function') {
                slots.action = () => {
                    const positiveButtonProps = { ...attrs.positiveButtonProps }
                    const negativeButtonProps = { ...attrs.negativeButtonProps }
                    return [
                        <NFlex size="large" align="center" justify="end" style={{ width: '100%' }}>
                            {typeof slots.actionExtra === 'function' && slots.actionExtra()}
                            <NButton
                                type="primary"
                                onClick={() => {
                                    if (typeof attrs.onPositiveClick === 'function') {
                                        attrs.onPositiveClick()
                                    }
                                }}
                                {...positiveButtonProps}
                                loading={props.sending ? true : positiveButtonProps.loading}
                            >
                                {attrs.positiveText ?? '确定'}
                            </NButton>
                            <NButton
                                type="default"
                                onClick={() => {
                                    if (typeof attrs.onNegativeClick === 'function') {
                                        attrs.onNegativeClick()
                                    }
                                    ctx.emit('update:show', false)
                                }}
                                {...negativeButtonProps}
                                disabled={props.sending ? true : negativeButtonProps.disabled}
                            >
                                {attrs.negativeText ?? '取消'}
                            </NButton>
                        </NFlex>,
                    ]
                }
            }

            return (
                <ViewModal
                    {...attrs}
                    closable={closable}
                    closeOnEsc={closeOnEsc}
                    maskClosable={maskClosable}
                    loading={loading}
                    show={props.show}
                    onUpdateShow={(show) => ctx.emit('update:show', show)}
                >
                    {slots}
                </ViewModal>
            )
        }
    },
}) as DefineComponent<ActionModalProps>
