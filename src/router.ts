import MainLayout from '@/layout/MainLayout.vue'
import { api } from '@/libs/api'
import { useAdmin } from '@/libs/store'
import { token } from '@/libs/token'
import { createMemoryHistory, createRouter } from 'vue-router'
import CompareOdds from './pages/CompareOdds.vue'
import Dashboard from './pages/Dashboard.vue'
import Login from './pages/Login.vue'
import ManualPromote from './pages/ManualPromote.vue'
import Matches from './pages/Matches.vue'
import Odds from './pages/Odds.vue'
import Rockball from './pages/Rockball.vue'
import Rockball2 from './pages/Rockball2.vue'
import Rockball3 from './pages/Rockball3.vue'
import ScoreMissMatches from './pages/ScoreMissMatches.vue'
import Settings from './pages/Settings.vue'
import SurebetRecords from './pages/SurebetRecords.vue'
import SurebetV2ToV3 from './pages/SurebetV2ToV3.vue'
import TournamentLabels from './pages/TournamentLabels.vue'
import Tournaments from './pages/Tournaments.vue'
import Users from './pages/Users.vue'
import Versions from './pages/Versions.vue'
import VipRecords from './pages/VipRecords.vue'
import Model3 from './pages/Model3.vue'

export const router = createRouter({
    history: createMemoryHistory(),
    routes: [
        {
            path: '/',
            component: MainLayout,
            meta: {
                requireLogin: true,
            },
            children: [
                {
                    path: '',
                    redirect: '/dashboard',
                },
                {
                    path: '/dashboard',
                    component: Dashboard,
                },
                {
                    path: '/odds',
                    component: Odds,
                },
                {
                    path: '/compare_odds',
                    component: CompareOdds,
                },
                {
                    path: '/matches',
                    component: Matches,
                },
                {
                    path: '/score_miss_matches',
                    component: ScoreMissMatches,
                },
                {
                    path: '/settings',
                    component: Settings,
                },
                {
                    path: '/users',
                    component: Users,
                },
                {
                    path: '/vip_records',
                    component: VipRecords,
                },
                {
                    path: '/manual_promote',
                    component: ManualPromote,
                },
                {
                    path: '/surebet_records',
                    component: SurebetRecords,
                },
                {
                    path: '/tournaments',
                    component: Tournaments,
                },
                {
                    path: '/v2_to_v3',
                    component: SurebetV2ToV3,
                },
                {
                    path: '/tournament_labels',
                    component: TournamentLabels,
                },
                {
                    path: '/rockball',
                    component: Rockball,
                },
                {
                    path: '/rockball2',
                    component: Rockball2,
                },
                {
                    path: '/rockball3',
                    component: Rockball3,
                },
                {
                    path: '/versions',
                    component: Versions,
                },
                {
                    path: '/model3',
                    component: Model3,
                },
            ],
        },
        {
            path: '/login',
            component: Login,
        },
    ],
})

/**
 * 登录判断
 */
router.beforeEach(async (to, _from, next) => {
    if (!to.matched.some((t) => t.meta && t.meta.requireLogin)) {
        return next()
    }

    //判断是否有用户信息
    const adminStore = useAdmin()
    if (adminStore.admin) {
        return next()
    }

    //没有用户信息的时候判断是否有token
    if (!token.value) {
        return next('/login')
    }

    //尝试自动登录
    const ret = await api<Admin>({
        url: '/admin/admin/info',
        token: token.value,
        onAuthorizationFail: false,
    })
    if (ret.code) {
        //登录失败
        token.value = null as unknown as string
        return next('/login')
    }

    //登录成功
    adminStore.admin = ret.data
    next()
})
