'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',

  //开发环境
  GATEWAY_API: '"http://localhost:8000/gateway"',
  ADMIN_API: '"http://localhost:8000/admin"',
  ARTICLE_API: '"http://localhost:8000/article"',
  PICTURE_API: '"http://localhost:8607/mogu-picture"',
  WEB_API: '"http://localhost:8607/mogu-web"',
  Search_API: '"http://localhost:8607/mogu-search"',
  Spider_API: '"http://localhost:8607/mogu-spider"',
  FILE_API: '"http://localhost:8600/"',
  BLOG_WEB_URL: '"http://localhost:9527"',
  SOLR_API: '"http://localhost:8080/solr"',
  ELASTIC_SEARCH: '"http://localhost:5601"',
})
