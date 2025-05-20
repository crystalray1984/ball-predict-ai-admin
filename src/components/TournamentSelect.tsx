import { useTournaments } from '@/libs/query'
import { NSelect, type SelectOption, type SelectProps } from 'naive-ui'
import { computed, type DefineComponent, defineComponent } from 'vue'

export default defineComponent({
    name: 'TournamentSelect',
    setup(props, ctx) {
        const { data, isFetching } = useTournaments({
            staleTime: 30000,
        })

        const options = computed(() => {
            const sorted = [...data.value].sort((t1, t2) => t1.name.localeCompare(t2.name))
            return sorted.map<SelectOption>((item) => ({
                value: item.id,
                label: item.name,
            }))
        })

        return () => (
            <NSelect
                {...props}
                options={options.value}
                loading={isFetching.value ?? props.loading}
                filterable={props.filterable ?? true}
            >
                {{ ...ctx.slots }}
            </NSelect>
        )
    },
}) as DefineComponent<SelectProps>
