import request from '@/utils/request'

export function getMenuList(params) {
  return request({
    url: process.env.ADMIN_API + '/resource/getList',
    method: 'get',
    params
  })
}

export function getAllMenu(params) {
  return request({
    url: process.env.ADMIN_API + '/resource/getAll',
    method: 'get',
    params
  })
}

export function getButtonAll(params) {
  return request({
    url: process.env.ADMIN_API + '/resource/getButtonAll',
    method: 'get',
    params
  })
}

export function addMenu(params) {
  return request({
    url: process.env.ADMIN_API + '/resource/add',
    method: 'post',
    data: params
  })
}

export function editMenu(params) {
  return request({
    url: process.env.ADMIN_API + '/resource/edit',
    method: 'post',
    data: params
  })
}

export function deleteMenu(params) {
  return request({
    url: process.env.ADMIN_API + '/resource/delete',
    method: 'post',
    data: params
  })
}

export function stickMenu(params) {
  return request({
    url: process.env.ADMIN_API + '/resource/stick',
    method: 'post',
    data: params
  })
}

