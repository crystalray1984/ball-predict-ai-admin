import {
    useQuery,
    type QueryFunction,
    type QueryKey,
    type QueryObserverOptions,
    type UseQueryDefinedReturnType,
    type UseQueryReturnType,
} from '@tanstack/vue-query'

type UseApiQueryOptionsWithoutSelect<TData, TQueryFnData = ApiResp<TData>> = Omit<
    QueryObserverOptions<TQueryFnData, Error, TData, TQueryFnData, QueryKey>,
    'select' | 'initialData' | 'placeholderData'
> & {
    queryKey: QueryKey
    queryFn: QueryFunction<TQueryFnData, QueryKey>
}

type UseApiQueryOptionsWithSelect<TData, TQueryFnData = ApiResp<TData>> = Omit<
    QueryObserverOptions<TQueryFnData, Error, TData, TQueryFnData, QueryKey>,
    'initialData' | 'placeholderData'
> & {
    queryKey: QueryKey
    queryFn: QueryFunction<TQueryFnData, QueryKey>
    select: (data: TQueryFnData) => TData
}

type WithPlaceholderData<TQueryFnData> = {
    placeholderData: TQueryFnData | ((prev?: TQueryFnData) => TQueryFnData)
}
type WithInitialData<TQueryFnData> = {
    initialData: TQueryFnData | (() => TQueryFnData)
}
type WithDefinedData<TQueryFnData> =
    | WithPlaceholderData<TQueryFnData>
    | WithInitialData<TQueryFnData>
    | (WithPlaceholderData<TQueryFnData> & WithInitialData<TQueryFnData>)

export function useApiQuery<TData>(
    options: UseApiQueryOptionsWithoutSelect<TData, ApiResp<TData>> &
        WithDefinedData<ApiResp<TData>>,
): UseQueryDefinedReturnType<TData, Error>
export function useApiQuery<TData, TQueryFnData = ApiResp<TData>>(
    options: UseApiQueryOptionsWithSelect<TData, TQueryFnData> & WithDefinedData<TQueryFnData>,
): UseQueryDefinedReturnType<TData, Error>
export function useApiQuery<TData>(
    options: UseApiQueryOptionsWithoutSelect<TData, ApiResp<TData>>,
): UseQueryReturnType<TData, Error>
export function useApiQuery<TData, TQueryFnData = ApiResp<TData>>(
    options: UseApiQueryOptionsWithSelect<TData, TQueryFnData>,
): UseQueryReturnType<TData, Error>

export function useApiQuery(options: UseApiQueryOptionsWithoutSelect<any>) {
    return useQuery({
        select: (ret: ApiResp<any>) => ret.data,
        ...options,
    } as any) as any
}

export type InternalUseApiQueryOptions<TData> = Omit<
    Parameters<typeof useApiQuery<TData>>[0],
    'queryKey' | 'queryFn' | 'select'
>
