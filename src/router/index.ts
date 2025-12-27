import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('@/pages/LoginPage.vue') },

    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        { path: '', redirect: '/dashboard' },
        { path: '/dashboard', component: () => import('@/pages/dashboard/SportOverview.vue') },
        {
          path: '/group',
          redirect: '/group/setting',
          children: [
            { path: 'setting', component: () => import('@/pages/group/GroupSetting.vue') },
            { path: 'person', component: () => import('@/pages/group/PersonSetting.vue') },
          ],
        },
        {
          path: '/gift',
          redirect: '/gift/list',
          children: [
            { path: 'list', component: () => import('@/pages/gift/GiftList.vue') },
            { path: 'activity', component: () => import('@/pages/gift/GiftActivity.vue') },
            { path: 'quota', component: () => import('@/pages/gift/GiftQuota.vue') },
            { path: 'summary', component: () => import('@/pages/gift/GiftSummary.vue') },
          ],
        },
        {
          path: '/survey',
          redirect: '/survey/list',
          children: [
            { path: 'list', component: () => import('@/pages/survey/SurveyList.vue') },
            { path: 'launch', component: () => import('@/pages/survey/SurveyLaunch.vue') },
            { path: 'statistic', component: () => import('@/pages/survey/SurveyStatistic.vue') },
          ],
        },
        { path: '/setting', component: () => import('@/pages/setting/NoticePage.vue') },
      ],
    },
  ],
})

// 登录拦截
router.beforeEach((to, from, next) => {
  // 补充 next 参数
  const user = useUserStore()
  user.restoreState() // ⚠️ 关键：把本地 token 重新灌进 store，并校验过期
  if (!user.isLogin && to.path !== '/login') {
    next('/login') // 未登录跳登录页
  } else {
    next() // 已登录放行（关键！）
  }
})

export default router
