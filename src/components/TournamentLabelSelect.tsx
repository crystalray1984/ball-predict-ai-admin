import { useTournamentLabels } from '@/libs/query'
import { NSelect, type SelectProps } from 'naive-ui'
import { computed, type DefineComponent, defineComponent } from 'vue'

export interface TournamentLabelSelectProps extends SelectProps {
    allowEmpty?: boolean
}

export default defineComponent({
    name: 'TournamentLabelSelect',
    props: {
        allowEmpty: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, ctx) {
        const { data, isFetching } = useTournamentLabels({
            staleTime: Infinity,
        })

        const options = computed(() => {
            const options = data.value.map((label) => ({
                value: label.id,
                label: label.title,
            }))
            if (props.allowEmpty) {
                options.unshift({ value: 0, label: '无标签' })
            }
            return options
        })

        return () => (
            <NSelect
                {...ctx.attrs}
                options={options.value}
                loading={isFetching.value ?? props.loading}
            >
                {{ ...ctx.slots }}
            </NSelect>
        )
    },
}) as DefineComponent<TournamentLabelSelectProps>
