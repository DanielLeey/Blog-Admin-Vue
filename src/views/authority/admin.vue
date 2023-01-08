<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container" style="margin: 10px 0 10px 0;">
      <el-input
        v-model="keyword"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入管理员名"
      />
      <el-button v-permission="'/admin/getList'" class="filter-item" type="primary" icon="el-icon-search" @click="handleFind">查找</el-button>
      <el-button v-permission="'/admin/add'" class="filter-item" type="primary" icon="el-icon-edit" @click="handleAdd">添加</el-button>
    </div>

    <el-table :data="tableData" style="width: 100%">
      <el-table-column type="selection"/>

      <el-table-column label="序号" width="60" align="center">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column label="头像" width="120" align="center">
        <template slot-scope="scope">
          <img
            v-if="scope.row.photoList"
            :src="scope.row.photoList[0]"
            style="width: 100px;height: 100px;"
          >
        </template>
      </el-table-column>

      <el-table-column label="用户名" width="100" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.userName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="拥有角色" width="150" align="center">
        <template slot-scope="scope">
          <!-- TODO:用户拥有多个角色 -->
          <el-tag v-if="scope.row.roles" type="danger">
            <div v-for="item in scope.row.roles" :key="item.uid" :value="item.uid">
              {{ item.roleName }}
            </div>
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="性别" width="60" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.gender==1" type="success">男</el-tag>
          <el-tag v-if="scope.row.gender==2" type="danger">女</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="登录次数" width="100" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.loginCount }}</span>
        </template>
      </el-table-column>

      <el-table-column label="已用空间" width="100" align="center">
        <template slot-scope="scope">
          <el-tag type="warning">{{ calculateFileSize(scope.row.storageSize) }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="网盘大小" width="100" align="center">
        <template slot-scope="scope">
          <el-tag type="warning">{{ calculateFileSize(scope.row.maxStorageSize * 1024 * 1024) }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="登录IP" width="160" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.lastLoginIp }}</span>
        </template>
      </el-table-column>

      <el-table-column label="最后登录时间" width="160" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.lastLoginTime }}</span>
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

      <el-table-column label="操作" fixed="right" min-width="250" >
        <template slot-scope="scope">
          <el-button v-permission="'/admin/restPwd'" type="warning" size="small" @click="handRest(scope.row)">重置密码</el-button>
          <el-button v-permission="'/admin/edit'" type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-permission="'/admin/delete'" type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
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

        <el-form-item :label-width="formLabelWidth" label="用户头像">
          <div v-if="form.photoList" class="imgBody">
            <i v-show="icon" class="el-icon-error inputClass" @click="deletePhoto()" @mouseover="icon = true"/>
            <img :src="form.photoList[0]" @mouseover="icon = true" @mouseout="icon = false" >
          </div>

          <div v-else class="uploadImgBody" @click="checkPhoto">
            <i class="el-icon-plus avatar-uploader-icon"/>
          </div>
        </el-form-item>

        <el-row :gutter="24">
          <el-col :span="10">
            <el-form-item :label-width="formLabelWidth" label="用户名" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户名"/>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item :label-width="formLabelWidth" label="昵称">
              <el-input v-model="form.nickName" placeholder="请输入昵称"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="10">
            <el-form-item :label-width="formLabelWidth" label="角色名">
              <el-select v-model="form.roleUids" placeholder="请选择角色名">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.uid"
                  :label="item.roleName"
                  :value="item.uid"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item :label-width="formLabelWidth" label="性别" prop="gender">
              <el-radio v-for="gender in genderDictList" :key="gender.uid" v-model="form.gender" :label="gender.dictValue" border size="medium">{{ gender.dictLabel }}</el-radio>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="10">
            <el-form-item :label-width="formLabelWidth" label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱"/>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item :label-width="formLabelWidth" label="手机号" prop="mobile">
              <el-input v-model="form.mobile" placeholder="请输入手机号"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="10">
            <el-form-item :label-width="formLabelWidth" label="QQ号码" prop="qqNumber">
              <el-input v-model="form.qqNumber" placeholder="请输入QQ号码"/>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item :label-width="formLabelWidth" label="职业">
              <el-input v-model="form.occupation" placeholder="请输入职业"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="10">
            <el-form-item :label-width="formLabelWidth" label="网盘容量(MB)" prop="maxStorageSize">
              <el-input-number v-model="form.maxStorageSize" :min="0" label="用户最大网盘容量"/>
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>

    <avatar-cropper
      v-show="imagecropperShow"
      :key="imagecropperKey"
      :width="300"
      :height="300"
      :url="url"
      lang-type="zh"
      @close="close"
      @crop-upload-success="cropSuccess"
    />

  </div>
</template>

<script>
import {
  getAdminList,
  addAdmin,
  editAdmin,
  deleteAdmin,
  restPwdAdmin,
  registerAdmin
} from '@/api/admin'

import { getRoleList } from '@/api/role'
import { getListByDictType } from '@/api/sysDictData'
import AvatarCropper from '@/components/AvatarCropper'

import { formatData } from '@/utils/webUtils'
export default {
  components: {
    AvatarCropper
  },
  data() {
    return {
      // 图片上传路径
      url: process.env.PICTURE_API + '/file/cropperPicture',
      tableData: [],
      roleOptions: [], // 角色候选框
      loading: false, // 搜索框加载状态
      roleData: [], // 角色列表
      roleValue: [], // 选择的角色列表
      keyword: '',
      currentPage: 1,
      pageSize: 10,
      total: 0, // 总数量
      title: '增加管理员',
      dialogFormVisible: false, // 控制弹出框
      formLabelWidth: '120px',
      isEditForm: false,
      form: {},
      imagecropperKey: 0,
      imagecropperShow: false, // 控制图片选择器的显示
      photoList: [],
      icon: false, // 控制删除图标的显示
      genderDictList: [], // 字典列表
      rules: {
        userName: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在1到20个字符' }
        ],
        dictValue: [
          { required: true, message: '字典键值不能为空', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在1到20个字符' }
        ],
        gender: [
          { required: true, message: '性别不能为空', trigger: 'blur' }
        ],
        email: [
          { pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/, message: '请输入正确的邮箱' }
        ],
        mobile: [
          { required: false, pattern: /0?(13|14|15|17|18)[0-9]{9}/, message: '请输入正确的手机号码' }
        ],
        qqNumber: [
          { pattern: /[1-9]([0-9]{5,11})/, message: '请输入正确的QQ号码' }
        ]
      }
    }
  },
  created() {
    this.getDictList()
    this.adminList()
    this.roleList()
  },
  methods: {
    adminList: function() {
      var params = {}
      params.keyword = this.keyword
      params.currentPage = this.currentPage
      params.pageSize = this.pageSize
      getAdminList(params).then(response => {
        if (response.code === 200) {
          const tableData = response.data.records
          for (let a = 0; a < tableData.length; a++) {
            tableData[a].maxStorageSize = tableData[a].maxStorageSize / 1024 / 1024
          }
          this.tableData = tableData
          this.currentPage = response.data.current
          this.pageSize = response.data.size
          this.total = response.data.total
        }
      })
    },
    /**
     * 字典查询
     */
    getDictList: function() {
      var params = {}
      params.dictType = 'sys_user_sex'
      getListByDictType(params).then(response => {
        if (response.code === 200) {
          this.genderDictList = response.data.list
          // 设置默认值
          if (response.data.defaultValue) {
            this.genderDefaultValue = response.data.defaultValue
          }
        }
      })
    },
    // 角色远程搜索函数
    roleList: function() {
      var params = {}
      params.currentPage = 1
      params.pageSize = 10
      getRoleList(params).then(response => {
        this.roleOptions = response.data.records
      })
    },
    cropSuccess(resData) {
      this.imagecropperShow = false
      this.imagecropperKey = this.imagecropperKey + 1
      const photoList = []
      photoList.push(resData[0].url)
      this.form.photoList = photoList
      this.form.avatar = resData[0].uid
    },
    close() {
      this.imagecropperShow = false
    },
    deletePhoto: function() {
      this.form.photoList = null
      this.form.ava = ''
      this.icon = false
    },
    checkPhoto() {
      this.photoList = []
      this.avatar = ''
      this.imagecropperShow = true
    },
    getFormObject: function() {
      var formObject = {
        uid: null,
        gender: this.genderDefaultValue
      }
      return formObject
    },
    handleFind: function() {
      this.adminList()
    },
    handleAdd: function() {
      this.title = '增加管理员'
      this.dialogFormVisible = true
      this.form = this.getFormObject()
      this.isEditForm = false
    },
    handleEdit: function(row) {
      this.title = '编辑管理员'
      this.dialogFormVisible = true
      this.isEditForm = true
      this.form = row
      this.roleValue = []
      var roleList = []
      // 设置选择的角色列表
      if (row.roleList) {
        row.roleList.forEach(element => {
          roleList.push(element.uid)
        })
        this.roleValue = roleList
      }
    },
    handRest: function(row) {
      var that = this
      this.$confirm('此操作将会将该用户密码重置为默认密码, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = {}
          params.uid = row.uid
          restPwdAdmin(params).then(response => {
            if (response.code === 200) {
              this.$commonUtil.message.success(response.message)
            } else {
              this.$commonUtil.message.error(response.message)
            }
          })
        })
        .catch(() => {
          this.$commonUtil.message.info('已取消重置')
        })
    },
    //  计算文件大小
    calculateFileSize(size) {
      const B = 1024
      const KB = Math.pow(1024, 2)
      const MB = Math.pow(1024, 3)
      const GB = Math.pow(1024, 4)
      if (!size) {
        return '_'
      } else if (size < KB) {
        return (size / B).toFixed(0) + 'KB'
      } else if (size < MB) {
        return (size / KB).toFixed(1) + 'MB'
      } else if (size < GB) {
        return (size / MB).toFixed(2) + 'GB'
      } else {
        return (size / GB).toFixed(3) + 'TB'
      }
    },
    handleDelete: function(row) {
      this.$confirm('此操作将该管理员删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = new URLSearchParams()
          var adminUids = []
          adminUids.push(row.uid)
          params.append('adminUids', adminUids)
          deleteAdmin(params).then(response => {
            if (response.code === 200) {
              this.$commonUtil.message.success(response.message)
            } else {
              this.$commonUtil.message.error(response.message)
            }
            this.adminList()
          })
        })
        .catch(() => {
          this.$commonUtil.message.info('已取消删除')
        })
    },
    handleCurrentChange: function(val) {
      this.currentPage = val
      this.adminList()
    },
    submitForm: function() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          console.log('校验出错')
        } else {
          if (this.isEditForm) {
            editAdmin(this.form).then(response => {
              if (response.code === 200) {
                this.$commonUtil.message.success(response.message)
                this.dialogFormVisible = false
                this.adminList()
              } else {
                this.$commonUtil.message.error(response.message)
              }
            })
          } else {
            addAdmin(this.form).then(response => {
              if (response.code === 200) {
                this.$commonUtil.message.success(response.message)
                this.dialogFormVisible = false
                this.adminList()
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
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.imgBody {
  width: 100px;
  height: 100px;
  border: solid 2px #ffffff;
  float: left;
  position: relative;
}
.uploadImgBody {
  margin-left: 5px;
  width: 100px;
  height: 100px;
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
img {
  width: 100px;
  height: 100px;
}
</style>
