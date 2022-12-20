/*
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-06-08 16:01:18
 * @LastEditTime: 2022-01-19 16:47:12
 * @Description: ...每位新修改者自己的信息
 */
import { createRouter, createWebHashHistory } from "vue-router";



// 路由信息
const routes = [
  {
    path: "/",
    name: "Wel",
    component: () => import('@/views/wel.vue'),
  },
  {
    name: 'systemPath',
    path: '/system/systemPath',
    component: () => import('@/views/system/systemPath/index.vue'),
  },
  {
    name: 'appleStore',
    path: '/system/appleStore',
    component: () => import('@/views/system/appleStore/index.vue'),
  },
  {
    name: 'about',
    path: '/system/about',
    component: () => import('@/views/system/about/index.vue'),
  },
  {
    name: 'users',
    path: '/users',
    component: () => import('@/views/users/index.vue'),
  },
  {
    name: 'uploadApplet',
    path: '/users/uploadApplet',
    component: () => import('@/views/users/uploadApplet.vue'),
  },


];

// 导出路由
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
