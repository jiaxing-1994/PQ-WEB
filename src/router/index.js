import Vue from 'vue'
import Router from 'vue-router'
import App from '@/app/index'
import Home from '@/app/home'
import Discover from '@/app/discover'
import My from '@/app/my'
import System from '@/app/discover/system'
import Information from '@/app/discover/information'
import Calendar from '@/app/discover/calendar'
import Share from '@/app/discover/share'
import Task from '@/app/discover/task'
import Login from '@/app/login'
import Other from '@/app/other'
import Guide from '@/app/other/guide'
import Agreement from '@/app/other/agreement'
import Bank from '@/app/my/bank'
import Detail from '@/app/my/detail'
import History from '@/app/my/history'
import Red from '@/app/my/red'
import Setting from '@/app/my/setting'
import Sign from '@/app/my/sign'
import Money from '@/app/my/money'
import Recharge from '@/app/my/recharge'
import Cash from '@/app/my/cash'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'App',
      component: App,
      children: [
        {
          path: '/',
          redirect: '/home',
        },
        {
          path: '/home',
          name: 'Home',
          component: Home
        },
        {
          path: '/discover',
          name: 'Discover',
          component: Discover,
          children: [
            {
              path: 'system',
              name: 'System',
              component: System
            },
            {
              path: 'information',
              name: 'Information',
              component: Information
            },
            {
              path: 'calendar',
              name: 'Calendar',
              component: Calendar
            },
            {
              path: 'task',
              name: 'Task',
              component: Task
            },
            {
              path: 'share',
              name: 'Share',
              component: Share
            }
          ]
        },
        {
          path: '/my',
          name: 'My',
          component: My,
          children: [
            {
              path: 'sign',
              name: 'Sign',
              component: Sign
            },
            {
              path: 'bank',
              name: 'Bank',
              component: Bank
            },
            {
              path: 'detail',
              name: 'Detail',
              component: Detail
            },
            {
              path: 'history',
              name: 'History',
              component: History
            },
            {
              path: 'red',
              name: 'Red',
              component: Red
            },
            {
              path: 'setting',
              name: 'Setting',
              component: Setting
            },
            {
              path: 'money',
              name: 'Money',
              component: Money
            },
            {
              path: 'recharge',
              name: 'Recharge',
              component: Recharge
            },
            {
              path: 'cash',
              name: 'Cash',
              component: Cash
            }
          ]
        },
        {
          path: '/login',
          name: 'Login',
          component: Login
        },
        {
          path: '/other',
          name:'Other',
          component:Other,
          children:[{
            path:'agreement',
            name:'Agreement',
            component:Agreement
          },{
            path:'guide',
            name:'Guide',
            component:Guide
          }]
        }
      ]
    }
  ]
})
