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
    is_open: number
    label_id: number
    label_title: string
    is_updating?: boolean
}

/**
 * 联赛标签
 */
declare interface TournamentLabel {
    id: number
    luffa_uid: string
    luffa_type: number
    title: string
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
declare type PromotedFinalRule =
    | ''
    | 'crown'
    | 'crown_special'
    | 'titan007'
    | 'special_config'
    | 'direct'

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
    titan007_promote_enable: number

    filter_rate: number
    min_surebet_value: string
    max_surebet_value: string

    promote_condition: string
    promote_symbol: '>=' | '<='

    ready_condition: string

    special_reverse: SpecialReverse[]

    special_enable: SpecialEnable[]

    adjust_condition: AdjustCondition[]

    special_config: SpecialConfig[]

    direct_config: DirectConfig[]

    allow_corner_preparing: boolean

    v3_check_max_duration: number
    v3_check_max_value: string
    v3_check_min_duration: number
    v3_check_min_value: string
    v3_check_min_promote_value: string

    /**
     * 滚球采集规则
     */
    rockball_config: RockballConfig[]

    surebet_v2_to_v3_back: number
    surebet_v2_to_v3_min_value: string
}

declare interface SpecialConfig {
    delta: number
    back: number
    auto_adjust: number
    enable: boolean
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

/**
 * 直通推荐配置
 */
declare interface DirectConfig extends SpecialEnable {
    /**
     * 是否需要一次比对，默认为true
     */
    first_check: boolean
    back: boolean
    adjust: string
    value_symbol?: '>=' | '>' | '<=' | '<' | '='
    value: string
    publish_channels: string[]
}

declare interface AddPromotedOddInfo extends OddInfo {
    odd_id: number
    back: number
}

declare interface UserConnect {
    account: string
}

/**
 * 用户信息
 */
declare interface User {
    id: number
    nickname: string
    avatar: string
    expire_time: string
    is_expired: number
    created_at: string
    reg_source: string
    luffa: UserConnect | null
    status: number
}

declare interface Order<T = any> {
    id: number
    order_number: string
    user_id: number
    type: string
    amount: string
    currency: string
    extra: T
    channel_type: string
    paid_at: string
}

interface VipOrderData {
    type: 'day' | 'week' | 'month' | 'quarter'
}

/**
 * 手动推荐记录
 */
interface ManualPromoteRecord {
    id: number
    type: 'single' | 'chain'
    odds: []
}

/**
 * 手动推荐的盘口
 */
interface ManualPromoteOdd extends OddInfo {
    id: number
    record_id: number
    match_id: number
    match_time: string
    tournament: Tournament
    team1: Team
    team2: Team
    promoted?: {
        id: number
        result: {
            result: number
            score: string
        } | null
        back: number
        score: string
    } & OddInfo
    has_score: number
    has_period1_score: number
    type2?: string | null
    condition2?: string | null
    promoted_odd_id: number
}

interface EditingManualPromoteOdd extends OddInfo {
    match_id: number
    type2?: string | null
    condition2?: string | null
}

declare interface CrownOdd {
    id: number
    variety: Variety
    period: Period
    type: 'ah' | 'sum'
    condition: string
    value1: string
    value2: string
    created_at: string
    is_ignored: number
    promote_flag: number
}

/**
 * 滚球采集规则
 */
declare interface RockballConfig extends SpecialEnable {
    /**
     * 水位条件
     */
    value: string
}
