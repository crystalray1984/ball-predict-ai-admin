import type { ConfigType } from 'dayjs'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'

export const VARIETY_TEXT: Record<Variety, string> = {
    goal: '进球',
    corner: '角球',
}

export const ODD_TYPE_TEXT: Record<OddType, string> = {
    ah1: '主胜',
    ah2: '客胜',
    over: '大球',
    under: '小球',
    draw: '平局',
}

export const PERIOD_TEXT: Record<Period, string> = {
    period1: '半场',
    regularTime: '全场',
}

export const ERROR_STATUS_TEXT: Record<MatchErrorStatus, string> = {
    '': '',
    cancelled: '比赛取消',
    delayed: '比赛延期',
    interrupted: '比赛腰斩',
}

export const FINAL_RULE_TEXT: Record<PromotedFinalRule, string> = {
    '': '',
    titan007: '趋势',
    crown: '水位',
    crown_special: '变盘',
    special_config: '特殊',
}

export const PROMOTE_RULE_TEXT: Record<string, string> = {
    '': '',
    special: '特殊',
    special_config: '变盘',
    corner: '角球',
}

export function date(input: ConfigType, format = 'YYYY-MM-DD') {
    if (typeof input === 'undefined' || input === null) return ''
    return dayjs(input).format(format)
}

export function dateTime(input: ConfigType, format = 'YYYY-MM-DD HH:mm') {
    if (typeof input === 'undefined' || input === null) return ''
    return dayjs(input).format(format)
}

export function isNullOrUndefined(input: any): input is null | undefined {
    return input === null || typeof input === 'undefined'
}

/**
 * 计算盘口结果
 */
export function calcResult(
    condition: string,
    score1: number | string,
    score2: number | string,
): number {
    condition = Decimal(condition).toString()
    let parts: string[]
    if (condition.endsWith('.25') || condition.endsWith('.75')) {
        parts = [Decimal(condition).sub('.25').toString(), Decimal(condition).add('.25').toString()]
    } else {
        parts = [condition]
    }

    const result = parts.reduce<number>((prev, part) => {
        return prev + Decimal(score1).add(part).comparedTo(score2)
    }, 0)

    return result > 0 ? 1 : result < 0 ? -1 : 0
}

/**
 * 计算盘口的赛果
 */
export function getOddResult(odd: OddInfo, match: MatchScore) {
    let score1: number
    let score2: number
    let result: number
    let score: string

    //数据完整性检测
    if (odd.variety === 'corner') {
        if (odd.period === 'period1') {
            if (
                isNullOrUndefined(match.corner1_period1) ||
                isNullOrUndefined(match.corner2_period1)
            ) {
                return
            }
            score1 = match.corner1_period1
            score2 = match.corner2_period1
        } else {
            if (isNullOrUndefined(match.corner1) || isNullOrUndefined(match.corner2)) {
                return
            }
            score1 = match.corner1
            score2 = match.corner2
        }
    } else if (odd.variety === 'goal') {
        if (odd.period === 'period1') {
            score1 = match.score1_period1
            score2 = match.score2_period1
        } else {
            if (isNullOrUndefined(match.corner1) || isNullOrUndefined(match.corner2)) {
                return
            }
            score1 = match.score1
            score2 = match.score2
        }
    } else {
        return
    }

    //确认投注类型
    if (odd.type === 'ah1') {
        //让球，买主队
        result = calcResult(odd.condition, score1, score2)
        score = `${score1}:${score2}`
    } else if (odd.type === 'ah2') {
        //让球，买客队
        result = calcResult(odd.condition, score2, score1)
        score = `${score1}:${score2}`
    } else if (odd.type === 'over') {
        //大球
        result = calcResult(Decimal(0).sub(odd.condition).toString(), score1 + score2, 0)
        score = `${score1 + score2}`
    } else if (odd.type === 'under') {
        //小球
        result = 0 - calcResult(Decimal(0).sub(odd.condition).toString(), score1 + score2, 0)
        score = `${score1 + score2}`
    } else if (odd.type === 'draw') {
        result = score1 === score2 ? 1 : -1
        score = `${score1}:${score2}`
    } else {
        return
    }

    return {
        result,
        score,
        score1,
        score2,
    }
}

/**
 * 获取反向盘口
 */
export function getReverseOdd({
    type,
    condition,
}: Pick<OddInfo, 'type' | 'condition'>): Pick<OddInfo, 'type' | 'condition'> {
    switch (type) {
        case 'ah1':
            return { type: 'ah2', condition: Decimal(0).sub(condition).toString() }
        case 'ah2':
            return { type: 'ah1', condition: Decimal(0).sub(condition).toString() }
        case 'over':
            return { type: 'under', condition }
        case 'under':
            return { type: 'over', condition }
        default:
            return { type, condition }
    }
}

/**
 * 盘口显示
 * @param condition
 * @param type
 */
export function conditionText(condition: string, type: OddType) {
    switch (type) {
        case 'ah1':
        case 'ah2':
            return numberWithSymbol(condition)
        default:
            return Decimal(condition).toString()
    }
}

/**
 * 带有符号的数值
 * @param value
 * @returns
 */
export function numberWithSymbol(value: string) {
    const dec = Decimal(value)
    return (dec.gt(0) ? '+' : '') + dec.toString()
}

/**
 * 用户的注册源
 */
export const USER_REG_SOURCE_TEXT: Record<string, string> = {
    luffa: 'Luffa',
    '': '管理端添加',
}

export const VIP_TYPE_TEXT: Record<VipOrderData['type'], string> = {
    day: '日卡',
    week: '周卡',
    month: '月卡',
    quarter: '季卡',
}

export const PAY_CHANNEL_TYPE_TEXT: Record<string, string> = {
    endless: 'EDS正式链',
    eds: 'EDS测试链',
}
