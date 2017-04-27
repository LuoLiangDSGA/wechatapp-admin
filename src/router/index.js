import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/readme',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            children: [
                {
                    path: '/',
                    component: resolve => require(['../components/page/Readme.vue'], resolve)
                },
                {
                    path: '/userlist',
                    component: resolve => require(['../components/page/UserList.vue'], resolve)
                },
                {
                    path: '/blacklist',
                    component: resolve => require(['../components/page/BlackList.vue'], resolve)
                },
                {
                    path: '/activitylist',
                    component: resolve => require(['../components/page/ActivityList.vue'], resolve)
                },
                {
                    path: '/auditlist',
                    component: resolve => require(['../components/page/auditlist.vue'], resolve)
                }
            ]
        },
        {
            path: '/login',
            component: resolve => require(['../components/page/Login.vue'], resolve)
        },
    ]
})
