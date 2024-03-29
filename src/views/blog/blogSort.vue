<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div v-permission="'/blogSort/getList'" class="filter-container" style="margin: 10px 0 10px 0;">
      <el-input
        v-model="keyword"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入分类名"
        @keyup.enter.native="handleFind"
      />
      <el-button v-permission="'/blogSort/getList'" class="filter-item" type="primary" icon="el-icon-search" @click="handleFind">查找</el-button>
      <el-button v-permission="'/blogSort/add'" class="filter-item" type="primary" icon="el-icon-edit" @click="handleAdd">添加分类</el-button>
      <el-button v-permission="'/blogSort/deleteBatch'" class="filter-item" type="danger" icon="el-icon-delete" @click="handleDeleteBatch">删除选中</el-button>
      <el-button
        v-permission="'/blogSort/blogSortByClickCount'"
        class="filter-item"
        type="info"
        icon="el-icon-document"
        @click="handleBlogSortByClickCount"
      >点击量排序</el-button>

      <el-button
        v-permission="'/blogSort/blogSortByCite'"
        class="filter-item"
        type="info"
        icon="el-icon-document"
        @click="handleBlogSortByCite"
      >引用量排序</el-button>
    </div>

    <el-table
      :data="tableData"
      :default-sort="{prop: 'createTime', order: 'ascending'}"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @sort-change="changeSort">
      <el-table-column type="selection"/>
      <el-table-column label="序号" width="60" align="center">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column label="分类名" width="100" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.sortName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="分类介绍" width="250" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.content }}</span>
        </template>
      </el-table-column>

      <el-table-column :sort-by="['clickCount']" label="点击数" width="100" align="center" prop="clickCount" sortable="custom">
        <template slot-scope="scope">
          <span>{{ scope.row.clickCount }}</span>
        </template>
      </el-table-column>

      <el-table-column :sort-by="['sort']" label="排序" width="100" align="center" prop="sort" sortable="custom">
        <template slot-scope="scope">
          <el-tag type="warning">{{ scope.row.sort }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column :sort-orders="['ascending', 'descending']" label="创建时间" width="160" align="center" prop="createTime" sortable="custom">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
          <template v-if="scope.row.status == 1">
            <span>正常</span>
          </template>
          <template v-if="scope.row.status == 2">
            <span>推荐</span>
          </template>
          <template v-if="scope.row.status == 0">
            <span>已删除</span>
          </template>
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" min-width="230">
        <template slot-scope="scope">
          <el-button v-permission="'/blogSort/stick'" type="warning" size="small" @click="handleStick(scope.row)">置顶</el-button>
          <el-button v-permission="'/blogSort/edit'" type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-permission="'/blogSort/delete'" type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
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
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="dialogFormVisible">
      <el-form ref="form" :model="form" :rules="rules">
        <el-form-item :label-width="formLabelWidth" label="分类名" prop="sortName">
          <el-input v-model="form.sortName" auto-complete="off"/>
        </el-form-item>

        <el-form-item :label-width="formLabelWidth" label="分类介绍" prop="content">
          <el-input v-model="form.content" auto-complete="off"/>
        </el-form-item>

        <el-form-item :label-width="formLabelWidth" label="排序" prop="sort">
          <el-input v-model="form.sort" auto-complete="off"/>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getBlogSortList,
  addBlogSort,
  editBlogSort,
  deleteBatchBlogSort,
  stickBlogSort,
  blogSortByClickCount,
  blogSortByCite
} from '@/api/blogSort'
import { formatData } from '@/utils/webUtils'
export default {
  data() {
    return {
      multipleSelection: [], // 多选，用于批量删除
      tableData: [],
      keyword: '',
      currentPage: 1,
      pageSize: 10,
      total: 0, // 总数量
      title: '增加分类',
      dialogFormVisible: false, // 控制弹出框
      formLabelWidth: '120px',
      isEditForm: false,
      orderByDescColumn: '',
      orderByAscColumn: '',
      form: {
        uid: null,
        content: '',
        sortName: ''
      },
      rules: {
        sortName: [
          { required: true, message: '分类名称不能为空', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在1到10个字符' }
        ],
        sort: [
          { required: true, message: '排序字段不能为空', trigger: 'blur' },
          { pattern: /^[0-9]\d*$/, message: '排序字段只能为自然数' }
        ]
      }
    }
  },
  created() {
    this.blogSortList()
  },
  methods: {
    // 从后台获取数据,重新排序
    changeSort(val) {
      // 根据当前排序重新获取后台数据,一般后台会需要一个排序的参数
      if (val.order == 'ascending') {
        this.orderByAscColumn = val.prop
        this.orderByDescColumn = ''
      } else {
        this.orderByAscColumn = ''
        this.orderByDescColumn = val.prop
      }
      this.blogSortList()
    },
    blogSortList: function() {
      var params = {}
      params.keyword = this.keyword
      params.currentPage = this.currentPage
      params.pageSize = this.pageSize
      params.orderByDescColumn = this.orderByDescColumn
      params.orderByAscColumn = this.orderByAscColumn
      getBlogSortList(params).then(response => {
        this.tableData = response.data.records
        this.currentPage = response.data.current
        this.pageSize = response.data.size
        this.total = response.data.total
      })
    },
    getFormObject: function() {
      var formObject = {
        uid: null,
        content: null,
        sortName: null,
        sort: 0
      }
      return formObject
    },
    handleFind: function() {
      this.currentPage = 1
      this.blogSortList()
    },
    handleAdd: function() {
      this.title = '增加分类'
      this.dialogFormVisible = true
      this.form = this.getFormObject()
      this.isEditForm = false
    },
    // 通过点击量排序
    handleBlogSortByClickCount: function() {
      this.$confirm(
        '此操作将根据点击量对所有的标签进行降序排序, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          blogSortByClickCount().then(response => {
            if (response.code === 200) {
              this.$commonUtil.message.success(response.message)
              this.blogSortList()
            } else {
              this.$commonUtil.message.error(response.message)
            }
          })
        })
        .catch(() => {
          this.$commonUtil.message.info('已取消批量排序')
        })
    },
    // 通过点击量排序
    handleBlogSortByCite: function() {
      this.$confirm(
        '此操作将根据博客引用量对所有的标签进行降序排序, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          blogSortByCite().then(response => {
            if (response.code === 200) {
              this.$commonUtil.message.success(response.message)
              this.blogSortList()
            } else {
              this.$commonUtil.message.error(response.message)
            }
          })
        })
        .catch(() => {
          this.$commonUtil.message.info('已取消批量排序')
        })
    },
    handleEdit: function(row) {
      this.title = '编辑分类'
      this.dialogFormVisible = true
      this.isEditForm = true
      this.form = row
    },
    handleStick: function(row) {
      this.$confirm('此操作将会把该标签放到首位, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          var params = {}
          params.uid = row.uid
          stickBlogSort(params).then(response => {
            if (response.code === 200) {
              this.$commonUtil.message.success(response.message)
              this.blogSortList()
            } else {
              this.$commonUtil.message.error(response.message)
            }
          })
        })
        .catch(() => {
          this.$commonUtil.message.info('已取消置顶')
        })
    },
    handleDelete: function(row) {
      var that = this
      this.$confirm('此操作将把分类删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          var params = []
          params.push(row)
          deleteBatchBlogSort(params).then(response => {
            if (response.code === 200) {
              this.$commonUtil.message.success(response.message)
            } else {
              this.$commonUtil.message.error(response.message)
            }
            that.blogSortList()
          })
        })
        .catch(() => {
          this.$commonUtil.message.info('已取消删除')
        })
    },
    handleDeleteBatch: function() {
      var that = this
      if (that.multipleSelection.length <= 0) {
        this.$commonUtil.message.error('请先选中需要删除的内容!')
        return
      }
      this.$confirm('此操作将把选中的分类删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteBatchBlogSort(that.multipleSelection).then(response => {
            if (response.code === 200) {
              this.$commonUtil.message.success(response.message)
            } else {
              this.$commonUtil.message.error(response.message)
            }
            that.blogSortList()
          })
        })
        .catch(() => {
          this.$commonUtil.message.info('已取消删除！')
        })
    },
    handleCurrentChange: function(val) {
      this.currentPage = val
      this.blogSortList()
    },
    submitForm: function() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          console.log('校验失败')
          return
        } else {
          if (this.isEditForm) {
            editBlogSort(this.form).then(response => {
              console.log(response)
              if (response.code === 200) {
                this.$commonUtil.message.success(response.message)
                this.dialogFormVisible = false
                this.blogSortList()
              } else {
                this.$commonUtil.message.error(response.message)
              }
            })
          } else {
            addBlogSort(this.form).then(response => {
              console.log(response)
              if (response.code === 200) {
                this.$commonUtil.message.success(response.message)
                this.dialogFormVisible = false
                this.blogSortList()
              } else {
                this.$commonUtil.message.error(response.message)
              }
            })
          }
        }
      })
    },
    // 改变多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    }
  }
}
</script>
