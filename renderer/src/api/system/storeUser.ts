/*
 * @Author: Chen
 * @Email: codeeetop@qq.com
 * @Date: 2021-11-17 14:13:32
 * @LastEditTime: 2022-01-27 13:12:33
 * @Description: ...每位新修改者自己的信息
 */

import request from '@/utils/request'


export const storePage = (search) => request({
  url: '/store/applet/page',
  method: 'get',
  params: {
    search
  }
})



export const storeUsersList = (params) => request({
  url: '/store/applet/list',
  method: 'get',
  params
})





export const deleteUsersPage = (id) => request({
  url: `/store/applet/${id}`,
  method: 'delete'
})



export const redactUsersPage = (data) => request({
  url: '/store/applet',
  method: 'put',
  data
})
