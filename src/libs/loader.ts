import { type PaginationProps } from 'naive-ui'
import { computed, onMounted, ref, type Ref } from 'vue'

export function useLoader() {
    const loading = ref(false)
    let loadId = 0
    const load = <T>(loader: () => Promise<T>) =>
        new Promise<T>((resolve, reject) => {
            const id = ++loadId
            loading.value = true
            loader()
                .then((data) => {
                    if (id !== loadId) return
                    loading.value = false
                    resolve(data)
                })
                .catch((err) => {
                    if (id !== loadId) return
                    loading.value = false
                    reject(err)
                })
        })

    const reset = () => {
        loading.value = false
        loadId = 0
    }

    return {
        loading,
        load,
        reset,
    }
}

export interface UseListLoaderOptions<T> {
    loader: (params: PageParams) => Promise<ApiResp<ListData<T>>>
    autoLoad?: boolean
    pageSize?: number
}

export function useListLoader<T>(options: UseListLoaderOptions<T>) {
    const currentPage = ref(1)
    const pageSize = ref(options.pageSize ?? 20)
    const count = ref(0)
    const list = ref([]) as Ref<T[]>

    const { loading, load: _load } = useLoader()

    const load = async (page: number, page_size?: number) => {
        page_size = page_size ?? pageSize.value
        currentPage.value = page
        pageSize.value = page_size

        const ret = await _load(() =>
            options.loader({
                page,
                page_size,
            }),
        )
        if (ret.code) {
            list.value = []
            count.value = 0
        } else {
            list.value = ret.data.list
            count.value = ret.data.count
        }
    }

    const pagination = computed<PaginationProps>(() => ({
        page: currentPage.value,
        itemCount: count.value,
        disabled: loading.value,
        onUpdatePage: (page) => load(page),
        onUpdatePageSize: (pageSize) => load(1, pageSize),
        prefix: ({ itemCount }) => `共${itemCount}条数据`,
        showSizePicker: true,
        pageSize: pageSize.value,
        pageSizes: [20, 50, 100],
    }))

    onMounted(() => {
        if (options.autoLoad !== false) {
            load(1)
        }
    })

    return {
        loading,
        load,
        page: currentPage,
        pageSize,
        list,
        count,
        pagination,
    }
}
