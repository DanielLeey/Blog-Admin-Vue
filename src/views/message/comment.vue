<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container" style="margin: 10px 0 10px 0;">
      <el-input v-model="queryParams.content" clearable class="filter-item" style="width: 200px;" placeholder="请输入评论内容"/>
      <el-input v-model="queryParams.userName" clearable class="filter-item" style="width: 150px;" placeholder="请输入评论人"/>

      <el-select v-model="queryParams.type" clearable placeholder="评论类型" style="margin-left:5px;width:110px">
        <el-option
          v-for="item in commentTypeDictList"
          :key="item.uid"
          :label="item.dictLabel"
          :value="item.dictValue"
        />
      </el-select>

      <el-select v-model="queryParams.source" clearable placeholder="评论来源" style="margin-left:5px;width:110px">
        <el-option
          v-for="item in commentSourceDictList"
          :key="item.uid"
          :label="item.dictLabel"
          :value="item.dictValue"
        />
      </el-select>

      <el-button v-permission="'/comment/getList'" class="filter-item" type="primary" icon="el-icon-search" @click="handleFind">查找</el-button>
      <el-button v-permission="'/comment/deleteBatch'" class="filter-item" type="danger" icon="el-icon-delete" @click="handleDeleteBatch">删除选中</el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">

      <el-table-column type="selection"/>

      <el-table-column label="序号" width="60" align="center">
        <template slot-scope="scope">
          <span >{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column label="头像" width="160" align="center">
        <template slot-scope="scope">
          <img
            v-if="scope.row.user"
            :src="scope.row.user.photoUrl"
            onerror="onerror=null;src=defaultAvatar"
            style="width: 100px;height: 100px;"
          >
          <img
            v-else
            :src="defaultAvatar"
            style="width: 100px;height: 100px;"
          >
        </template>
      </el-table-column>

      <el-table-column label="评论人" width="150" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.user" type="primary" style="cursor: pointer;" @click.native="goUser(scope.row.user)">{{ scope.row.user.nickName }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="被评论人" width="150" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.toUser" type="info" style="cursor: pointer;" @click.native="goUser(scope.row.toUser)">{{ scope.row.toUser.nickName }}</el-tag>
          <el-tag v-else type="info" style="cursor: pointer;">无</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="类型" width="80" align="center">
        <template slot-scope="scope">
          <template>
            <el-tag v-if="scope.row.type == 1" type="danger">点赞</el-tag>
            <el-tag v-if="scope.row.type == 0" type="success">评论</el-tag>
          </template>
        </template>
      </el-table-column>

      <el-table-column label="来源" width="80" align="center">
        <template slot-scope="scope">
          <template>
            <el-tag type="warning" style="cursor: pointer;" @click.native="goPage(scope.row.source, scope.row.blog)">{{ scope.row.sourceName }}</el-tag>
          </template>
        </template>
      </el-table-column>

      <!--        <el-table-column label="来源博客" width="160" align="center">-->
      <!--          <template slot-scope="scope">-->
      <!--            <template>-->
      <!--              <el-tag type="error" v-if="scope.row.source == 'BLOG_INFO'" @click.native="onClick(scope.row.blog)" style="cursor: pointer;">{{subStr(scope.row.blog.title, 8 )}}</el-tag>-->
      <!--            </template>-->
      <!--          </template>-->
      <!--        </el-table-column>-->

      <el-table-column label="内容" width="500" align="center">
        <template slot-scope="scope">
          <!--            <el-popover-->
          <!--              v-if="scope.row.content"-->
          <!--              placement="top-start"-->
          <!--              width="400"-->
          <!--              trigger="hover"-->
          <!--              :content="scope.row.content">-->
          <!--              <el-button slot="reference">{{subStr(scope.row.content, 10)}}</el-button>-->
          <!--            </el-popover>-->
          <span v-html="$xss(scope.row.content, options)"/>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="160" align="center">
        <template slot-scope="scope">
          <span >{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" min-width="150">
        <template slot-scope="scope" >
          <!--          <el-button @click="handleReply(scope.row)" type="success" size="small">回复</el-button>-->
          <el-button v-permission="'/comment/delete'" type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页-->
    <div class="block">
      <el-pagination
        :current-page.sync="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @current-change="handleCurrentChange"/>
    </div>
  </div>
</template>

<script>
import { getCommentList, addComment, editComment, deleteComment, deleteBatchComment } from '@/api/comment'
import { getListByDictTypeList } from '@/api/sysDictData'
export default {
  data() {
    return {
      // xss白名单配置
      options: {
        whiteList: {
          a: ['href', 'title', 'target'],
          span: ['class'],
          h1: ['class'],
          h2: ['class'],
          h3: ['class'],
          h4: ['class'],
          pre: [],
          code: ['class'],
          p: ['class']
        }
      },
      queryParams: {
        content: null, // 评论名
        userName: null, // 用户名
        type: null, // 类型
        source: null // 来源
      }, // 查询参数
      multipleSelection: [], // 多选，用于批量删除
      BLOG_WEB_URL: process.env.BLOG_WEB_URL,
      tableData: [],
      keyword: '',
      currentPage: 1,
      pageSize: 10,
      total: 0, // 总数量
      title: '增加友链',
      dialogFormVisible: false, // 控制弹出框
      formLabelWidth: '120px',
      isEditForm: false,
      commentTypeDictList: [], // 评论类型字典
      commentSourceDictList: [], // 评论来源字典
      commentTypeDefaultValue: null, // 评论类型默认值
      defaultAvatar: this.$SysConf.defaultAvatar // 默认头像
    }
  },
  created() {
    // 获取评论
    this.commentList()

    // 获取字典
    this.getDictList()
  },
  methods: {
    // 跳转到用户中心
    goUser: function(user) {
      console.log('go user', user)
      this.$router.push({ path: '/user/user', query: { nickName: user.nickName }})
    },
    // 跳转到该博客详情
    onClick: function(row) {
      console.log('点击跳转', row)
      window.open(this.BLOG_WEB_URL + '/#/info?blogUid=' + row.uid)
    },
    // 跳转到前端页面
    goPage: function(type, blog) {
      switch (type) {
        case 'MESSAGE_BOARD': { window.open(this.BLOG_WEB_URL + '/#/messageBoard') } break
        case 'ABOUT': { window.open(this.BLOG_WEB_URL + '/#/about') } break
        case 'BLOG_INFO': { window.open(this.BLOG_WEB_URL + '/#/info?blogUid=' + blog.uid) } break
      }
    },
    /**
     * 字典查询
     */
    getDictList: function() {
      var dictTypeList = ['sys_comment_type', 'sys_comment_source']
      getListByDictTypeList(dictTypeList).then(response => {
        if (response.code === 200) {
          var dictMap = response.data
          this.commentTypeDictList = dictMap.sys_comment_type.list
          this.commentSourceDictList = dictMap.sys_comment_source.list
          if (dictMap.sys_comment_type.defaultValue) {
            this.commentTypeDefaultValue = dictMap.sys_comment_type.defaultValue
            this.queryParams.type = this.commentTypeDefaultValue
            this.commentList()
          }
        }
      })
    },
    commentList: function() {
      const params = {}
      params.keyword = this.queryParams.content
      if (this.queryParams.source == null || this.queryParams.source == undefined || this.queryParams.source == '') {
        params.source = 'all'
      } else {
        params.source = this.queryParams.source
      }
      params.userName = this.queryParams.userName
      params.type = this.queryParams.type
      params.currentPage = this.currentPage
      params.pageSize = this.pageSize

      getCommentList(params).then(response => {
			  if (response.code === 200) {
          this.tableData = response.data.records
          this.currentPage = response.data.current
          this.pageSize = response.data.size
          this.total = response.data.total
        }
      })
    },
    subStr(str, index) {
      if (str == null || str === undefined) {
        return ''
      }
		  if (str.length < index) {
		    return str
      } else {
		    return str.substring(0, index) + '..'
      }
    },
    handleFind: function() {
      this.currentPage = 1
      this.commentList()
    },
    handleReply: function(row) {
      console.log('点击了回复')
    },
    handleDelete: function(row) {
      this.$confirm('此操作将把该评论删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = {}
          params.uid = row.uid
          deleteComment(params).then(response => {
            this.$commonUtil.message.success(response.message)
            this.commentList()
          })
        })
        .catch(() => {
          this.$commonUtil.info('已取消删除')
        })
    },
    handleDeleteBatch: function() {
      var that = this
      if (that.multipleSelection.length <= 0) {
        this.$message({
          type: 'error',
          message: '请先选中需要删除的内容！'
        })
        return
      }
      this.$confirm('此操作将把选中的评论删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteBatchComment(that.multipleSelection).then(response => {
            if (response.code == that.$ECode.SUCCESS) {
              that.$commonUtil.message.success(response.message)
            } else {
              that.$commonUtil.message.error(response.message)
            }
            that.commentList()
          })
        })
        .catch(() => {
          that.$commonUtil.info('已取消删除')
        })
    },
    handleCurrentChange: function(val) {
      this.currentPage = val
      this.commentList()
    },
    // 改变多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    }

  }
}
</script>
<style>
  @import "../../assets/css/emoji.css";
  .emoji-item-common {
    background: url("../../assets/img/emoji_sprite.png");
    display: inline-block;
  }
  .emoji-item-common:hover {
    cursor: pointer;
  }
  .emoji-size-small {
    zoom: 0.3;
    margin: 5px;
    vertical-align: middle;
  }
</style>

