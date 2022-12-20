<!--
 * @Author: Chen
 * @Email: codeeetop@qq.com
 * @Date: 2021-12-21 13:55:23
 * @LastEditTime: 2022-02-28 10:35:56
 * @Description: ...每位新修改者自己的信息
-->

<script setup lang="ts">
import { defineComponent, onMounted, reactive, getCurrentInstance } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from 'element-plus'
import { ipcRenderer, config, __dirpath } from "@/global"
import { storeUsersList, deleteUsersPage, redactUsersPage } from '@/api/system/storeUser'
import { logout } from '@/api/login'
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
// 引入主题后还需要在 options 中指定主题才会生效
import 'codemirror/theme/juejin.css'
import 'codemirror/mode/markdown/markdown.js'




let router: any = useRouter()
let dataMain: any = reactive({
  fileName: "",
  tableData: [],
  search: "",
  drawer: false,
  dialogVisible: false,
  drawerObject: {},
  form: {},
  cm: null,
  rules: {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
  },
  adminclass: 3
})

const { proxy }: any = getCurrentInstance()
onMounted(() => {
  getList()
})


const getList = () => {
  storeUsersList({
    pageSize: 30
  }).then(res => {
    res.rows.forEach(item => {
      item.logo = item.icon ? config.targetFile + item.icon : __dirpath + "\\build\\icons\\icon.ico"
    })
    dataMain.tableData = res.rows
  })
  dataMain.adminclass = ipcRenderer.sendSync('handle-store-users').adminclass // 获取权限
}


const handleRouter = () => {
  router.push({ path: "/users/uploadApplet", query: { path: "/users" } })
}


const handleOut = async () => {
  await logout()
  ipcRenderer.sendSync('handle-store-users', 'set', '')
  router.push({ path: "/" })
}



const methodInitEditor: any = (markdown) => {
  let elDom = document.getElementById("markdown")
  dataMain.cm = CodeMirror.fromTextArea(elDom, {
    highlightFormatting: true,
    autofocus: true,
    mode: "markdown",
    tabSize: 2, // 缩进格式
    theme: 'juejin', // 主题，对应主题库 JS 需要提前引入
    lineNumbers: false, // 显示行号
    line: true,
    styleActiveLine: true, // 高亮选中行
    hintOptions: {
      completeSingle: true // 当匹配只有一项的时候是否自动补全
    }
  })

}


const methods: any = {

  handleDelete(row) {
    ElMessageBox.confirm(
      '此操作将永久删除该文件, 是否继续?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      deleteUsersPage(row.id).then(res => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          getList()
        }
      })
    }).catch(() => {
    })
  },


  handleDialogOpened() {
    methodInitEditor()
    // dataMain.cm.setValue(dataMain.form.readmeContent)
    // dataMain.cm.refresh()
  },

  handleRedact(row) {
    dataMain.dialogVisible = true
    dataMain.form = JSON.parse(JSON.stringify(row))
  },

  handleSubmit() {
    proxy.$refs['ruleForm'].validate((valid) => {
      if (valid) {
        dataMain.form.readmeContent = dataMain.cm.getValue()
        redactUsersPage({
          id: dataMain.form.id,
          name: dataMain.form.name,
          description: dataMain.form.description,
          readmeContent: dataMain.form.readmeContent,
          authority: dataMain.form.authority
        }).then(res => {
          if (res.code === 200) {
            dataMain.dialogVisible = false
            ElMessage.success(res.msg)
            getList()
          }
        }, err => {
          ElMessage.error(err)
        })
      }
    })
  }
}
</script>

<template>
  <return-page class="users">
    <template v-slot:center>
      <div class="system-user-box">
        <svg-icon v-if="dataMain.adminclass !== 3" icon-class="issue" @click="handleRouter()" title="发布小程序"></svg-icon>
        <svg-icon icon-class="close" @click="handleOut()" title="退出账号"></svg-icon>
      </div>
    </template>

    <!--小程序展示 -->
    <ul class="app-box">

      <li v-for="(item, index) in dataMain.tableData">
        <div class="item-img">
          <img :src="item.logo" alt="">
        </div>
        <div class="item-content">
          <h4>{{ item.name }}</h4>
          <p>版本: {{ item.version }}</p>
          <div class="item-button">
            <el-button type="primary" size="mini" @click.stop="methods.handleRedact(item)">编辑</el-button>
            <el-button type="danger" size="mini" @click="methods.handleDelete(item)">删除</el-button>
          </div>
        </div>
      </li>
    </ul>

    <!-- 弹框 -->

    <el-dialog v-model="dataMain.dialogVisible" title="修改" width="70%" :before-close="methods.handleClose"
      :destroy-on-close="true" @opened="methods.handleDialogOpened" @closed="dataMain.cm.toTextArea()"
      :fullscreen="true" :center="true">
      <el-form ref="ruleForm" :model="dataMain.form" :rules="dataMain.rules" label-width="70px" size="small">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="name" prop="name">
              <el-input v-model="dataMain.form.name"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="下载权限">
              <el-radio-group v-model="dataMain.form.authority">
                <el-radio :label="1">默认下载</el-radio>
                <el-radio :label="2">登录下载</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="简介" prop="description">
              <el-input v-model="dataMain.form.description" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"
                placeholder="输入简介...">
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <textarea id="markdown" class="markdown-body">{{ dataMain.form.readmeContent }}</textarea>
          </el-col>
        </el-row>

      </el-form>
      <template #footer>
        <el-button style="width:200px" size="medium" type="primary" @click="methods.handleSubmit()">确定</el-button>
      </template>
    </el-dialog>

  </return-page>
</template>

<style lang="scss">
.users {
  background: var(--page-background-color-user);

  .left {
    font-size: 22px;
  }

  #system {
    .el-icon-arrow-left {
      color: var(--color-text-white);
    }
  }

  .el-dialog__headerbtn {
    -webkit-app-region: no-drag;
  }

  .system-user-box {
    -webkit-app-region: no-drag;
    position: absolute;
    left: 50px;
    top: 3px;

    .search-button {
      width: 28px;
      height: 28px;
      position: absolute;
      right: 0;
      cursor: pointer;
    }

    .el-input__inner {
      border: none;
      background-color: #e2eceb;
      border-radius: 18px;
      padding-right: 30px;
    }

    .svg-icon {
      font-size: 22px;
      margin-right: 15px;
      cursor: pointer;
    }
  }

  .el-drawer__header {
    margin-bottom: 10px;
  }

  .markdown-body {
    display: none;
  }

  .CodeMirror {
    height: 300px;
    margin-left: 71px;
    border: 1px solid #dcdfe6;
    overflow: hidden;

    .CodeMirror {
      height: 100%;
    }
  }
}
</style>



<style lang="scss" scoped>
.app-box {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 10px;

  li {
    display: flex;
    width: 32.33333%;
    margin: 12px 0.5% 0;
    overflow: hidden;
    box-sizing: border-box;
    transition: all 0.3s;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    position: relative;
    background: var(--background-color-white);

    .item-img {
      margin-top: 10px;

      img {
        width: 48px;
        height: 48px;
      }
    }

    .item-content {
      width: calc(100% - 68px);
      margin-left: 20px;

      h4 {
        margin: 10px 0 0;
      }

      p {
        font-size: 12px;
        color: var(--color-text-regular);
        height: 12px;
        line-height: 12px;
        padding-top: 12px;
        padding-right: 105px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        position: relative;
      }
    }

    // 按钮
    .item-button {
      position: absolute;
      right: 10px;
      top: 50%;
      margin-top: -14px;
    }
  }

  li:hover {
    background: var(--background-color);
    box-shadow: 0 12px 30px 0 rgb(0 0 0 / 20%);
    transform: translateY(-4px);
  }
}
</style>