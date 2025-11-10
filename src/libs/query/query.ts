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

/**
 * 获取联赛标签列表
 * @param options
 * @returns
 */
export function useTournamentLabels(options: InternalUseApiQueryOptions<TournamentLabel[]> = {}) {
    return useApiQuery<TournamentLabel[]>({
        ...options,
        queryKey: [],
        queryFn: () =>
            api<TournamentLabel[]>({
                url: '/admin/match/label/list',
            }),
        placeholderData: (prev) => prev ?? success([]),
    })
}
