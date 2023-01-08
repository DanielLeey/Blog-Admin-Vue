<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container" style="margin: 10px 0 10px 0;">
      <el-button v-permission="'/categoryMenu/add'" class="filter-item" type="primary" icon="el-icon-edit" @click="handleAdd">添加菜单</el-button>
    </div>

    <el-table :data="tableData" style="width: 100%">

      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form label-position="left" inline class="demo-table-expand">

            <el-table :data="scope.row.childCategoryMenu" :show-header="showHeader" style="width: 100%">
              <el-table-column label width="60" align="center">
                <template slot-scope="scope_child">
                  <span>{{ scope_child.$index + 1 }}</span>
                </template>
              </el-table-column>

              <el-table-column label width="150" align="center">
                <template slot-scope="scope_child">
                  <span>{{ scope_child.row.name }}</span>
                </template>
              </el-table-column>

              <el-table-column label width="100" align="center">
                <template slot-scope="scope_child">
                  <el-tag v-for="item in menuLevelDictList" v-if="scope_child.row.menuLevel == item.dictValue" :key="item.uid" :type="item.listClass">{{ item.dictLabel }}</el-tag>
                </template>
              </el-table-column>

              <el-table-column label width="200" align="center">
                <template slot-scope="scope_child">
                  <span>{{ scope_child.row.summary }}</span>
                </template>
              </el-table-column>

              <el-table-column label width="50" align="center">
                <template slot-scope="scope_child">
                  <i :class="scope_child.row.icon" />
                </template>
              </el-table-column>

              <el-table-column label width="250" align="center">
                <template slot-scope="scope_child">
                  <span>{{ scope_child.row.url }}</span>
                </template>
              </el-table-column>

              <el-table-column width="100" align="center">
                <template slot-scope="scope">
                  <el-tag v-for="item in yesNoDictList" v-if="scope.row.isShow == item.dictValue" :key="item.uid" :type="item.listClass">{{ item.dictLabel }}</el-tag>
                </template>
              </el-table-column>

              <el-table-column width="120" align="center">
                <template slot-scope="scope">
                  <el-tag v-for="item in jumpExternalDictList" v-if="scope.row.isJumpExternalUrl == item.dictValue" :key="item.uid" :type="item.listClass">{{ item.dictLabel }}</el-tag>
                </template>
              </el-table-column>

              <el-table-column width="100" align="center">
                <template slot-scope="scope">
                  <el-tag type="warning">{{ scope.row.sort }}</el-tag>
                </template>
              </el-table-column>

              <el-table-column fixed="right" min-width="230">
                <template slot-scope="scope_child">
                  <el-button v-permission="'/categoryMenu/stick'" type="warning" size="small" @click="handleStick(scope_child.row)">置顶</el-button>
                  <el-button v-permission="'/categoryMenu/edit'" type="primary" size="small" @click="handleEdit(scope_child.row)">编辑</el-button>
                  <el-button v-permission="'/categoryMenu/delete'" type="danger" size="small" @click="handleDelete(scope_child.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form>
        </template>
      </el-table-column>

      <el-table-column label="序号" width="60" align="center">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column label="菜单名称" width="150" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="菜单级别" width="100" align="center">
        <template slot-scope="scope">
          <el-tag v-for="item in menuLevelDictList" v-if="scope.row.menuLevel == item.dictValue" :key="item.uid" :type="item.listClass">{{ item.dictLabel }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="菜单简介" width="200" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.summary }}</span>
        </template>
      </el-table-column>

      <el-table-column label="图标" width="50" align="center">
        <template slot-scope="scope">
          <i :class="scope.row.icon" />
        </template>
      </el-table-column>

      <el-table-column label="路由" width="250" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
        </template>
      </el-table-column>

      <el-table-column label="是否显示" width="100" align="center">
        <template slot-scope="scope">
          <el-tag v-for="item in yesNoDictList" v-if="scope.row.isShow == item.dictValue" :key="item.uid" :type="item.listClass">{{ item.dictLabel }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="是否跳转外链" width="120" align="center">
        <template slot-scope="scope">
          <el-tag v-for="item in jumpExternalDictList" v-if="scope.row.isJumpExternalUrl == item.dictValue" :key="item.uid" :type="item.listClass">{{ item.dictLabel }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="排序" width="100" align="center">
        <template slot-scope="scope">
          <el-tag type="warning">{{ scope.row.sort }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" min-width="270">
        <template slot-scope="scope">
          <el-button v-permission="'/categoryMenu/stick'" type="warning" size="small" @click="handleStick(scope.row)">置顶</el-button>
          <el-button v-permission="'/categoryMenu/edit'" type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-permission="'/categoryMenu/delete'" type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="dialogFormVisible">
      <el-form ref="form" :model="form" :rules="rules">
        <el-form-item :label-width="formLabelWidth" label="菜单名称" prop="name">
          <el-input v-model="form.name" auto-complete="off"/>
        </el-form-item>

        <el-form-item :label-width="formLabelWidth" label="菜单等级" prop="menuLevel">
          <el-select v-model="form.menuLevel" placeholder="请选择">
            <el-option
              v-for="item in menuLevelDictList"
              v-if="item.dictValue != 3"
              :key="item.uid"
              :label="item.dictLabel"
              :value="parseInt(item.dictValue)"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="form.menuLevel == 2"
          :label-width="formLabelWidth"
          label="父菜单名"
          prop="parentUid"
        >
          <el-select
            v-model="form.parentUid"
            :remote-method="remoteMethod"
            :loading="loading"
            filterable
            clearable
            remote
            reserve-keyword
            placeholder="请输入父菜单名"
          >
            <el-option
              v-for="item in menuOptions"
              :key="item.uid"
              :label="item.name"
              :value="item.uid"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label-width="formLabelWidth" label="菜单介绍" prop="summary">
          <el-input v-model="form.summary" auto-complete="off"/>
        </el-form-item>

        <el-form-item :label-width="formLabelWidth" label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入前图标名称">
            <el-button slot="append" icon="el-icon-setting" @click="openIconsDialog('prefix-icon')">
              选择
            </el-button>
          </el-input>
        </el-form-item>

        <el-form-item :label-width="formLabelWidth" label="是否跳转外链" prop="isShow">
          <el-radio-group v-model="form.isJumpExternalUrl" size="small">
            <el-radio v-for="item in jumpExternalDictList" :key="item.uid" :label="parseInt(item.dictValue)" border>{{ item.dictLabel }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label-width="formLabelWidth" label="路由" prop="url">
          <el-input v-model="form.url" placeholder="跳转外链时，路由为外部URL" auto-complete="off"/>
        </el-form-item>

        <el-form-item :label-width="formLabelWidth" label="是否显示" prop="isShow">
          <el-radio-group v-model="form.isShow" size="small">
            <el-radio v-for="item in yesNoDictList" :key="item.uid" :label="parseInt(item.dictValue)" border>{{ item.dictLabel }}</el-radio>
          </el-radio-group>
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

    <icons-dialog :visible.sync="iconsVisible" :current="form.icon" @select="setIcon" />
  </div>
</template>

<script>
import {
  getMenuList,
  getAllMenu,
  addMenu,
  editMenu,
  deleteMenu,
  stickMenu
} from '@/api/categoryMenu'
import { getListByDictTypeList } from '@/api/sysDictData'
import { formatData } from '@/utils/webUtils'
import IconsDialog from '../../components/IconsDialog'
export default {
  components: {
    IconsDialog
  },
  data() {
    return {
      iconsVisible: false, // 是否显示icon选择器
      activeData: '', // 激活的图标
      showHeader: false, // 是否显示表头
      tableData: [],
      keyword: '',
      menuLevel: '',
      currentPage: 1,
      pageSize: 10,
      total: 0, // 总数量
      title: '增加菜单',
      dialogFormVisible: false, // 控制弹出框
      formLabelWidth: '120px',
      isEditForm: false,
      menuLevelDictList: [], // 菜单等级字典
      yesNoDictList: [], // 是否字典
      jumpExternalDictList: [], // 是否字典
      yesNoDefault: null,
      jumpExternalDefault: null,
      form: {
        uid: null,
        name: '',
        summary: '',
        icon: '',
        url: '',
        sort: ''
      },
      loading: false,
      menuOptions: [], // 一级菜单候选项
      rules: {
        name: [
          { required: true, message: '菜单名称不能为空', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在1到20个字符' }
        ],
        menuLevel: [
          { required: true, message: '菜单等级不能为空', trigger: 'blur' }
        ],
        parentUid: [
          { required: true, message: '父菜单名不能为空', trigger: 'blur' }
        ],
        summary: [
          { required: true, message: '菜单简介不能为空', trigger: 'blur' }
        ],
        icon: [
          { required: true, message: '图标不能为空', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '路由不能为空', trigger: 'blur' }
        ],
        isShow: [
          { required: true, message: '显示字段不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '排序字段不能为空', trigger: 'blur' },
          { pattern: /^[0-9]\d*$/, message: '排序字段只能为自然数' }
        ]
      }
    }
  },
  created() {
    this.getDictList()
    this.menuList()
  },
  methods: {
    menuList: function() {
      getAllMenu().then(response => {
        if (response.code === 200) {
          this.tableData = response.data
          this.menuOptions = response.data
        }
      })
    },
    // 选择图标
    setIcon(val) {
      this.form.icon = val
    },
    openIconsDialog(model) {
      this.iconsVisible = true
      this.currentIconModel = model
    },
    /**
     * 字典查询
     */
    getDictList: function() {
      var dictTypeList = ['sys_menu_level', 'sys_yes_no', 'sys_jump_external']
      getListByDictTypeList(dictTypeList).then(response => {
        if (response.code === 200) {
          var dictMap = response.data
          this.menuLevelDictList = dictMap.sys_menu_level.list
          this.yesNoDictList = dictMap.sys_yes_no.list
          this.jumpExternalDictList = dictMap.sys_jump_external.list
          if (dictMap.sys_yes_no.defaultValue) {
            this.yesNoDefault = parseInt(dictMap.sys_yes_no.defaultValue)
          }
          if (dictMap.sys_jump_external.defaultValue) {
            this.jumpExternalDefault = parseInt(dictMap.sys_jump_external.defaultValue)
          }
        }
      })
    },
    getFormObject: function() {
      var formObject = {
        uid: null,
        name: '',
        summary: '',
        icon: '',
        url: '',
        sort: 0,
        menuType: 0, // 菜单类型  菜单
        isShow: this.yesNoDefault,
        isJumpExternalUrl: this.jumpExternalDefault
      }
      return formObject
    },
    handleFind: function() {
      this.menuList()
    },
    handleAdd: function() {
      this.title = '增加菜单'
      this.dialogFormVisible = true
      this.form = this.getFormObject()
      this.isEditForm = false
    },
    handleEdit: function(row) {
      this.dialogFormVisible = true
      this.isEditForm = true
      this.title = '编辑菜单'
      this.form = row
    },
    handleStick: function(row) {
      this.$confirm('此操作将会把该标签放到首位, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = {}
          params.uid = row.uid
          stickMenu(params).then(response => {
            if (response.code === 200) {
              this.menuList()
              this.$commonUtil.message.success(response.message)
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
      this.$confirm('此操作将把菜单删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = {}
          params.uid = row.uid
          deleteMenu(params).then(response => {
            if (response.code === 200) {
              this.$commonUtil.message.success(response.message)
            } else {
              this.$commonUtil.message.error(response.message)
            }
            this.menuList()
          })
        })
        .catch(() => {
          this.$commonUtil.message.info('已取消删除')
        })
    },
    // 菜单远程搜索函数
    remoteMethod: function(query) {
      if (query !== '') {
        // 这里只搜索一级菜单出来
        var params = new URLSearchParams()
        params.append('keyword', query)
        params.append('menuLevel', 1)
        params.append('pageSize', 100)
        getMenuList(params).then(response => {
          console.log(response)
          if (response.code === 200) {
            this.menuOptions = response.data.data.records
          }
        })
      } else {
        this.menuOptions = []
      }
    },

    submitForm: function() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          console.log('校验失败')
        } else {
          if (this.isEditForm) {
            editMenu(this.form).then(response => {
              if (response.code === 200) {
                this.$commonUtil.message.success(response.message)
                this.dialogFormVisible = false
              } else {
                this.$commonUtil.message.error(response.message)
              }
            })
          } else {
            addMenu(this.form).then(response => {
              if (response.code === 200) {
                this.$commonUtil.message.success(response.message)
                this.dialogFormVisible = false
                this.menuList()
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
