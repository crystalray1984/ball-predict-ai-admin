import { api, success } from '@/libs/api'
import { useApiQuery, type InternalUseApiQueryOptions } from './helpers'

/**
 * 获取赛事列表
 */
export function useTournaments(options: InternalUseApiQueryOptions<Tournament[]> = {}) {
    return useApiQuery<Tournament[]>({
        ...options,
        queryKey: [],
        queryFn: () =>
            api<Tournament[]>({
                url: '/admin/match/tournament_list',
            }),
        placeholderData: (prev) => prev ?? success([]),
    })
}
