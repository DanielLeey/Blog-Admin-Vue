import request from '@/utils/request'

export function getTagList(params) {
  return request({
    url: process.env.ARTICLE_API + '/tag/getList',
    method: 'post',
    data: params
  })
}

export function addTag(params) {
  return request({
    url: process.env.ARTICLE_API + '/tag/add',
    method: 'post',
    data: params
  })
}

export function editTag(params) {
  return request({
    url: process.env.ARTICLE_API + '/tag/edit',
    method: 'post',
    data: params
  })
}

export function deleteBatchTag(params) {
  return request({
    url: process.env.ARTICLE_API + '/tag/deleteBatch',
    method: 'post',
    data: params
  })
}

export function stickTag(params) {
  return request({
    url: process.env.ARTICLE_API + '/tag/stick',
    method: 'post',
    data: params
  })
}

export function tagSortByClickCount(params) {
  return request({
    url: process.env.ARTICLE_API + '/tag/tagSortByClickCount',
    method: 'post',
    params
  })
}

export function tagSortByCite(params) {
  return request({
    url: process.env.ARTICLE_API + '/tag/tagSortByCite',
    method: 'post',
    params
  })
}
