import request from '@/utils/request'
import qs from 'qs'

export function login(param) {
  return request({
    url: process.env.GATEWAY_API + '/auth/login',
    method: 'post',
    data: param.toString()
  })
}

export function getInfo(token) {
  return request({
    url: process.env.ADMIN_API + '/auth/info',
    method: 'get',
    params: { token }
  })
}

export function getMenu(token) {
  return request({
    url: process.env.ADMIN_API + '/auth/getMenu',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: process.env.ADMIN_API + '/auth/logout',
    method: 'post'
  })
}

export function getWebSiteName() {
  return request({
    url: process.env.ADMIN_API + '/auth/getWebSiteName',
    method: 'get'
  })
}
