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
    titan007: '球探网趋势',
    crown: '皇冠水位',
    crown_special: '皇冠变盘',
}
