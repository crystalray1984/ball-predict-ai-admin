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

/**
 * 比赛的赛果数据
 */
declare interface MatchScore {
    score1: number
    score2: number
    corner1: number
    corner2: number
    score1_period1: number
    score2_period1: number
    corner1_period1: number
    corner2_period1: number
}

/**
 * 比赛数据
 */
declare interface Match extends MatchScore {
    id: number
    match_time: string
    tournament: Tournament
    team1: Team
    team2: Team
    has_score: number
    has_period1_score: number
}

/**
 * 所有的系统设置
 */
declare interface Setting {
    surebet_end_of: string
    surebet_start_of: string
    surebet_outcomes: string
    surebet_min_profit: string
    surebet_max_profit: string

    final_check_time: number

    allow_promote_1: boolean
    corner_enable: boolean
    corner_period1_enable: boolean
    corner_reverse: boolean
    period1_enable: boolean
    promote_reverse: boolean
    titan007_reverse: boolean

    filter_rate: number
    min_surebet_value: string
    max_surebet_value: string

    promote_condition: string
    promote_symbol: '>=' | '<='

    ready_condition: string

    special_reverse: SpecialReverse[]

    special_enable: SpecialEnable[]

    adjust_condition: AdjustCondition[]
}

/**
 * 特殊推荐过滤条件
 */
declare interface SpecialEnable extends Partial<OddInfo> {
    id: string | number
    condition_symbol?: '>=' | '>' | '<=' | '<' | '='
    condition: string
}

/**
 * 特殊推荐方向设置
 */
declare interface SpecialReverse extends SpecialEnable {
    back: boolean
}

declare interface AdjustCondition extends SpecialEnable {
    adjust: string
}

declare interface AddPromotedOddInfo extends OddInfo {
    odd_id: number
    back: number
}
