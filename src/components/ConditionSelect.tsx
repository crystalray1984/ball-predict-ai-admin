import { conditionText, isNullOrUndefined } from '@/libs/helpers'
import Decimal from 'decimal.js'
import { NSelect, type SelectProps } from 'naive-ui'
import { computed, defineComponent, watch, type DefineComponent, type PropType } from 'vue'

const _conditionOptions = (() => {
    const output: { value: string; label: string; negative: boolean }[] = []
    let num = Decimal(-10)
    while (true) {
        const negative = num.lt(0)
        const value = num.toString()
        output.push({ value, label: value, negative })
        if (num.gt(10)) break
        num = num.add('0.25')
    }
    return output
})()

const ahOptions = (() => {
    const output: { value: string; label: string }[] = []
    let num = Decimal(-10)
    while (true) {
        const value = num.toString()
        output.push({ value, label: conditionText(value, 'ah1') })
        if (num.gt(10)) break
        num = num.add('0.25')
    }
    return output
})()
const goalOptions = (() => {
    const output: { value: string; label: string }[] = []
    let num = Decimal('0.25')
    while (true) {
        const value = num.toString()
        output.push({ value, label: value })
        if (num.gt(15)) break
        num = num.add('0.25')
    }
    return output
})()

export default defineComponent({
    emits: ['update:value', 'updateValue'],
    name: 'ConditionSelect',
    props: {
        oddType: {
            type: String as PropType<OddType>,
        },
        value: {
            type: String,
        },
    },
    setup(props, ctx) {
        const conditionOptions = computed(() => {
            if (props.oddType === 'over' || props.oddType === 'under') {
                return goalOptions
            } else {
                return ahOptions
            }
        })

        const onUpdateValue = (value: string | undefined) => {
            ctx.emit('update:value', value)
            ctx.emit('updateValue', value)
        }

        watch(
            () => props.oddType,
            (oddType) => {
                if (oddType === 'over' || oddType === 'under') {
                    if (!isNullOrUndefined(props.value) && typeof props.value === 'string') {
                        const value = Decimal(props.value)
                        if (value.lt(0)) {
                            onUpdateValue(value.abs().toString())
                        } else if (value.eq(0)) {
                            onUpdateValue('0.25')
                        }
                    }
                }
            },
            { immediate: true },
        )

        return () => (
            <NSelect
                {...ctx.attrs}
                value={props.value}
                options={conditionOptions.value}
                onUpdateValue={onUpdateValue}
            >
                {{ ...ctx.slots }}
            </NSelect>
        )
    },
}) as DefineComponent<SelectProps & { oddType?: OddType }>
