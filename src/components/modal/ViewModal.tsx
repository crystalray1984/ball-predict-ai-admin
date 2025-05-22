import { NButton, NModal, NSpace, NSpin, type ModalProps, NFlex } from 'naive-ui'
import { defineComponent, type DefineComponent, type Slot } from 'vue'

export interface ViewModalProps extends ModalProps {
    data?: any
}

/**
 * 默认带有关闭按钮的数据展示弹窗
 */
export const ViewModal = defineComponent({
    name: 'ViewModal',
    emits: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        'update:show': (_show: boolean) => true,
    },
    props: {
        show: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, ctx) {
        return function () {
            const hasData = (() => {
                if (!Object.keys(ctx.attrs).includes('data')) return true
                const data = ctx.attrs.data
                return data !== null && typeof data !== 'undefined'
            })()

            const attrs = ctx.attrs as ModalProps
            const closable = !hasData ? false : attrs.closable
            const closeOnEsc = !hasData ? false : attrs.closeOnEsc ?? false
            const maskClosable = !hasData ? false : attrs.maskClosable ?? false

            const slots = { ...ctx.slots }
            if (!hasData) {
                slots.default = () => [
                    <NSpace vertical={true} align="center">
                        <NSpin />
                    </NSpace>,
                ]
                delete slots.action
            } else {
                slots.action = () => {
                    let defaultSlot: Slot
                    if (typeof attrs.action === 'function') {
                        defaultSlot = attrs.action as Slot
                    } else if (typeof ctx.slots.action === 'function') {
                        defaultSlot = ctx.slots.action
                    } else {
                        defaultSlot = () => [
                            <NButton
                                type="default"
                                onClick={() => {
                                    if (typeof attrs.onNegativeClick === 'function') {
                                        attrs.onNegativeClick()
                                    }
                                    ctx.emit('update:show', false)
                                }}
                                {...attrs.negativeButtonProps}
                            >
                                {attrs.negativeText ?? '关闭'}
                            </NButton>,
                        ]
                    }

                    return [<NFlex justify="end">{{ default: defaultSlot }}</NFlex>]
                }
            }

            return (
                <NModal
                    preset="card"
                    size="small"
                    displayDirective="if"
                    negativeText="关闭"
                    segmented={true}
                    autoFocus={false}
                    {...attrs}
                    closable={closable}
                    closeOnEsc={closeOnEsc}
                    maskClosable={maskClosable}
                    show={props.show}
                    onUpdateShow={(value) => ctx.emit('update:show', value)}
                >
                    {slots}
                </NModal>
            )
        }
    },
}) as DefineComponent<ViewModalProps>
