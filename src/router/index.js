import Vue from 'vue'
import VueRouter from 'vue-router'
import Computer from '../views/computer.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/computer'
  },
  {
    path: '/computer',
    name: 'Computer',
    component: Computer
  },
  {
    path: '/manual',
    name: 'Manual',
    component: () => import(/* webpackChunkName: "pages" */ '../views/manual.vue')
  },
  {
    path: '/terminal-help',
    name: 'TerminalHelp',
    component: () => import(/* webpackChunkName: "pages" */ '../views/terminalHelp.vue')
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (pages.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "pages" */ '../views/about.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
