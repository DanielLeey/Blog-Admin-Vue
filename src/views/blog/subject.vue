<template>
  <div id="table" class="app-container calendar-list-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container" style="margin: 10px 0 10px 0;">
      <el-input v-model="keyword" clearable class="filter-item" style="width: 200px;" placeholder="请输入专题名称"/>
      <el-button v-permission="'/subject/getList'" class="filter-item" type="primary" icon="el-icon-search" @click="handleFind">查找</el-button>
      <el-button v-permission="'/subject/add'" class="filter-item" type="primary" icon="el-icon-edit" @click="handleAdd">添加</el-button>
      <el-button class= "button" type="primary" icon="el-icon-refresh" @click="checkAll()">{{ chooseTitle }}</el-button>
      <el-button v-permission="'/subject/deleteBatch'" class="filter-item" type="danger" icon="el-icon-delete" @click="handleDeleteBatch">删除选中</el-button>
    </div>

    <el-row>
      <el-col
        v-for="(item, index) in tableData"
        :key="item.uid"
        :xs="24"
        :sm="12"
        :md="12"
        :lg="6"
        :xl="4"
        style="padding: 6px"
      >

        <el-card
          :body-style="{ padding: '0px', textAlign: 'center' }"
          style="position: relative"
          shadow="always"
        >
          <div class="subjectName">{{ item.subjectName }}</div>
          <input :id="item.uid" :checked="selectUids.indexOf(item.uid)>=0" style="position: absolute;z-index: 100;" type="checkbox" @click="checked(item)">
          <el-image
            v-if="item.photoList"
            :src="item.photoList[0]"
            style="cursor:pointer"
            fit="scale-down"
            @click="goSubjectItem(item)"
          />
          <div>
            <span v-if="item.subjectName" class="media-title">{{ item.summary }}</span>
          </div>
          <div style="margin-bottom: 14px;">
            <el-button-group>

              <el-tooltip class="item" effect="dark" content="专题Item" placement="bottom-start" style="margin-right: 2px">
                <el-button
                  size="mini"
                  icon="el-icon-copy-document"
                  @click="goSubjectItem(item)"
                />
              </el-tooltip>

              <el-tooltip class="item" effect="dark" content="编辑专题" placement="bottom-start" style="margin-right: 2px">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-document-copy"
                  @click="handleEdit(item)"
                />
              </el-tooltip>

              <el-tooltip v-permission="'/subject/delete'" class="item" effect="dark" content="删除专题" placement="bottom-start" style="margin-right: 2px">
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="handleDelete(item)"
                />
              </el-tooltip>
            </el-button-group>
          </div>
        </el-card>

      </el-col>
    </el-row>

    <!--分页-->
    <div class="block">
      <el-pagination
        :current-page.sync="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @current-change="handleCurrentChange"/>
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="dialogFormVisible">
      <el-form ref="form" :model="form" :rules="rules">

        <el-form-item :label-width="formLabelWidth" label="封面图" prop="fileUid">
          <div v-if="form.photoList && form.photoList.length > 0" class="imgBody">
            <i v-show="icon" class="el-icon-error inputClass" @click="deletePhoto()" @mouseover="icon = true"/>
            <img :src="form.photoList[0]" style="display:inline; width: 195px;height: 105px;" @mouseover="icon = true" @mouseout="icon = false">
          </div>
          <div v-else class="uploadImgBody" @click="checkPhoto">
            <i class="el-icon-plus avatar-uploader-icon"/>
          </div>
        </el-form-item>

        <el-form-item :label-width="formLabelWidth" label="专题名" prop="subjectName">
          <el-input v-model="form.subjectName" auto-complete="off"/>
        </el-form-item>

        <el-form-item :label-width="formLabelWidth" label="专题简介">
          <el-input v-model="form.summary" type="textarea" auto-complete="off"/>
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

    <CheckPhoto v-if="!isFirstPhotoVisible" :photo-visible="photoVisible" :photos="photoList" :files="fileIds" :limit="1" @choose_data="getChooseData" @cancelModel="cancelModel"/>

  </div>
</template>

<script>
import {
  getSubjectList,
  addSubject,
  editSubject,
  deleteBatchSubject
} from '@/api/subject'

import CheckPhoto from '../../components/CheckPhoto'

export default {
  components: {
    CheckPhoto
  },
  data() {
    return {
      tableData: [],
      form: {},
      loading: true,
      dialogVisible: false, // 控制增加框和修改框的显示
      currentPage: 1,
      total: null,
      pageSize: 18,
      keyword: '',
      chooseTitle: '全选',
      isCheckedAll: false, // 是否全选
      selectUids: [], // 专题uid集合
      title: '增加专题',
      formLabelWidth: '120px', // 弹框的label边框
      dialogFormVisible: false,
      isEditForm: false,
      photoVisible: false, // 控制图片选择器的显示
      photoList: [],
      fileIds: '',
      icon: false, // 控制删除图标的显示
      isFirstPhotoVisible: true, // 图片选择器是否首次显示【用于懒加载】
      rules: {
        fileUid: [
          { required: true, message: '封面图片不能为空', trigger: 'blur' }
        ],
        subjectName: [
          { required: true, message: '专题名不能为空', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在1到20个字符' }
        ],
        sort: [
          { required: true, message: '排序字段不能为空', trigger: 'blur' },
          { pattern: /^[0-9]\d*$/, message: '排序字段只能为自然数' }
        ]
      }
    }
  },
  created() {
    this.subjectList()
  },
  methods: {
    subjectList: function() {
      var params = {}
      params.keyword = this.keyword
      params.currentPage = this.currentPage
      params.pageSize = this.pageSize
      getSubjectList(params).then(response => {
        this.tableData = response.data.records
        this.currentPage = response.data.current
        this.pageSize = response.data.size
        this.total = response.data.total
      })
    },
    handleFind: function() {
      this.currentPage = 1
      this.subjectList()
    },
    getFormObject: function() {
      var formObject = {
        uid: null,
        subjectName: null,
        summary: null,
        fileUid: null,
        sort: 0
      }
      return formObject
    },
    // 点击单选
    checked: function(data) {
      const idIndex = this.selectUids.indexOf(data.uid)
      if (idIndex >= 0) {
        // 选过了
        this.selectUids.splice(idIndex, 1)
      } else {
        this.selectUids.push(data.uid)
      }
    },
    checkAll: function() {
      // 如果是全选
      if (this.isCheckedAll) {
        this.selectUids = []
        this.isCheckedAll = false
        this.chooseTitle = '全选'
      } else {
        this.selectUids = []
        this.tableData.forEach(function(picture) {
          this.selectUids.push(picture.uid)
        }, this)
        this.isCheckedAll = true
        this.chooseTitle = '取消全选'
      }
    },
    // 弹出选择图片框
    checkPhoto: function() {
      this.photoList = []
      this.fileIds = ''
      this.photoVisible = true
      this.isFirstPhotoVisible = false
    },
    getChooseData(data) {
      var that = this
      this.photoVisible = false
      this.photoList = data.photoList
      this.fileIds = data.fileIds
      var fileId = this.fileIds.replace(',', '')
      if (this.photoList.length >= 1) {
        this.form.fileUid = fileId
        this.form.photoList = this.photoList
      }
    },
    // 关闭模态框
    cancelModel() {
      this.photoVisible = false
    },
    deletePhoto: function() {
      console.log('要删除的', this.form)
      this.form.photoList = []
      this.form.fileUid = ''
    },
    // 改变页码
    handleCurrentChange(val) {
      var that = this
      this.currentPage = val // 改变当前所指向的页数
      this.subjectList()
    },
    // 点击新增
    handleAdd: function() {
      this.title = '增加专题'
      this.dialogFormVisible = true
      this.form = this.getFormObject()
      this.isEditForm = false
    },
    // 点击编辑
    handleEdit: function(row) {
      this.title = '编辑专题'
      this.dialogFormVisible = true
      this.isEditForm = true
      console.log(row)
      this.form = row
    },
    handleDelete: function(row) {
      this.$confirm('此操作将会把该专题删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          var params = []
          params.push(row)
          deleteBatchSubject(params).then(response => {
            if (response.code === 200) {
              this.$commonUtil.message.success(response.message)
            } else {
              this.$commonUtil.message.error(response.message)
            }
            this.subjectList()
          })
        })
        .catch(() => {
          this.$commonUtil.message.info('已经取消删除')
        })
    },
    goSubjectItem: function(row) {
      var uid = row.uid
      this.$router.push({
        path: 'subjectItem',
        query: { subjectUid: uid }
      })
    },
    handleDeleteBatch: function() {
      var that = this
      if (that.selectUids.length <= 0) {
        this.$commonUtil.message.error('请先选中需要删除的内容！')
        return
      }
      this.$confirm('此操作将把选中的专题删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const deleteList = []
          for (let i = 0; i < this.selectUids.length; i++) {
            const params = {}
            params.uid = this.selectUids[i]
            deleteList.push(params)
          }
          deleteBatchSubject(deleteList).then(response => {
            if (response.code === 200) {
              this.$commonUtil.message.success(response.message)
            } else {
              this.$commonUtil.message.error(response.message)
            }
            that.subjectList()
          })
        })
        .catch(() => {
          this.$commonUtil.message.info('已取消删除')
        })
    },
    submitForm: function() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          console.log('校验出错')
        } else {
          if (this.isEditForm) {
            editSubject(this.form).then(response => {
              if (response.code === 200) {
                this.$commonUtil.message.success(response.message)
                this.dialogFormVisible = false
                this.subjectList()
              } else {
                this.$commonUtil.message.error(response.message)
              }
            })
          } else {
            addSubject(this.form).then(response => {
              if (response.code === 200) {
                this.$commonUtil.message.success(response.message)
                this.dialogFormVisible = false
                this.subjectList()
              } else {
                this.$commonUtil.message.error(response.message)
              }
            })
          }
        }
      })
    }
  }
}
</script>
<style scoped>

  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    margin: 0, 0, 0, 10px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409eff;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 195px;
    height: 105px;
    line-height: 105px;
    text-align: center;
  }
  .imgBody {
    width: 195px;
    height: 105px;
    border: solid 2px #ffffff;
    float: left;
    position: relative;
  }
  .uploadImgBody {
    margin-left: 5px;
    width: 195px;
    height: 105px;
    border: dashed 1px #c0c0c0;
    float: left;
    position: relative;
  }
  .uploadImgBody :hover {
    border: dashed 1px #00ccff;
  }
  .inputClass {
    position: absolute;
  }
  .img {
    width: 100%;
    height: 100%;
  }

  .media-title {
    color: #8492a6;
    font-size: 14px;
    padding: 14px;
    display: inline-block;
    white-space: nowrap;
    width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .el-image {
    width: 100%;
    height: 160px;
  }

  .subjectName {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 2;
    /*top: 15px;*/
    background: rgba(232, 40, 74, .8);
    color: #FFF;
    padding: 3px 8px;
    font-size: 12px;
    border-radius: 3px;
  }
</style>
