import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/services/authService'

// Auth Views
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'

// App Views
import DashboardView from '@/views/DashboardView.vue'
import ProjectsView from '@/views/projects/ProjectsView.vue'
import KanbanView from '@/views/KanbanView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/projects',
      name: 'projects',
      component: ProjectsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/kanban',
      name: 'kanban',
      component: KanbanView,
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !isAuthenticated()) {
    next('/login')
  } else if (
    !requiresAuth &&
    isAuthenticated() &&
    (to.path === '/login' || to.path === '/register')
  ) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
