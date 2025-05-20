/// <reference types="vite/client" />

/**
 * 接口响应数据结构
 */
declare interface ApiResp<T> {
    code: number
    msg: string
    data: T
}

/**
 * 管理员信息实体
 */
declare interface Admin {
    id: number
    username: string
}

/**
 * 赛事
 */
declare interface Tournament {
    id: number
    name: string
}

declare interface Team {
    id: number
    name: string
}

declare interface ListData<T> {
    list: T[]
    count: number
}

declare interface PageParams {
    page: number
    page_size: number
}

/**
 * 比赛状态
 */
declare type MatchStatus = '' | 'final'

/**
 * 比赛异常状态
 */
declare type MatchErrorStatus = '' | 'delayed' | 'cancelled' | 'interrupted'

/**
 * 比赛时段
 */
declare type Period = 'regularTime' | 'period1'

/**
 * 投注目标
 */
declare type Variety = 'goal' | 'corner'

/**
 * 投注方向
 */
declare type OddType = 'ah1' | 'ah2' | 'over' | 'under' | 'draw'

/**
 * 盘口状态
 */
declare type OddStatus = '' | 'ready' | 'promoted' | 'ignored'

/**
 * 二次比对完成时的规则
 */
declare type PromotedFinalRule = '' | 'crown' | 'crown_special' | 'titan007'

/**
 * 二次推荐不推荐的原因
 */
declare type PromotedSkip = '' | 'setting' | 'same_type' | 'manual_promote'

/**
 * 盘口的基本信息
 */
declare interface OddInfo {
    condition: string
    variety: Variety
    period: Period
    type: OddType
}
