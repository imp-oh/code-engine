<!--
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-08-20 09:04:20
 * @LastEditTime: 2022-02-28 10:22:47
 * @Description: 系统设置
-->


<script setup lang="ts" >
import { defineComponent, reactive, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from "vue-router";
import JSEncrypt from 'jsencrypt'
import { login, retrieve, verify, register, getInfo } from '@/api/login'
const { ipcRenderer } = require('electron')

const { proxy }: any = getCurrentInstance()
let router = useRouter();
let route = useRoute();
let checkData = (rule, value, callback) => {
  if (value) {
    if (/[\u4E00-\u9FA5]/g.test(value)) {
      callback(new Error('只能输入英文和数字'))
    } else {
      callback()
    }
  }
  callback()
}
const formData: any = reactive({
  tableData: [
    {
      name: "系统环境",
      icon: "winPath",
      router: "/system/systemPath"
    },
    {
      name: "商城",
      icon: "plugin",
      router: "/system/appleStore"
    },
    {
      name: "用户",
      icon: "teddy",
      handle: () => {
        const userinfo = ipcRenderer.sendSync('handle-store-users')
        // 如果没有 cookie 着登录
        if (!userinfo || !userinfo.codeengine) {
          return formData.dialogVisible = true
        }
        // 如果存在则跳转路由
        router.push({ path: '/users' })
      }
    },
    {
      name: "关于CE",
      icon: "about",
      router: "/system/about"
    },
  ],
  form: null,
  dialogVisible: false,
  loginForm: {
    userName: '',
    password: '',
  },
  time: new Date().getTime(),
  isState: 1, // 1.登录 2.注册 3.找回密码
  isNumber: 60,
  rules: {
    userName: [
      {
        required: true,
        message: '请输入账号',
        trigger: 'blur',
      },
      {
        min: 4,
        max: 30,
        message: '账号长度最小为4，最长为30',
        trigger: 'blur',
      },
      { validator: checkData, trigger: 'blur' }
    ],
    password: [
      {
        required: true,
        message: '请输入密码',
        trigger: 'blur',
      },
      {
        min: 4,
        max: 60,
        message: '密码长度最小为4，最长为60',
        trigger: 'blur',
      }
    ],
    email: [
      {
        required: true,
        message: '请输入电子邮箱',
        trigger: 'blur',
      },
      {
        type: 'email',
        message: '邮箱格式错误',
        trigger: ['blur', 'change'],
      },
    ]
  },
  code: [
    {
      required: true,
      message: '请输入验证码',
      trigger: 'blur',
    },
    {
      min: 6,
      max: 10,
      message: '验证码错误',
    }
  ]
})


const handleTableItemClick = (item) => {
  if (!item.router) {
    return item.handle()
  }
  router.push({
    path: item.router,
    query: {
      path: router.currentRoute.value.path
    }
    // query: route.query
  })
}


const methods = {
  handleClose() {
    formData.dialogVisible = false
  },

  handleGetCode() {
    if (formData.isNumber !== 60) return
    if (!formData.loginForm.email) return proxy.$message.error('请输入电子邮箱');
    let reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
    if (!reg.test(formData.loginForm.email)) proxy.$message.error('电子邮箱格式错误');
    verify({
      email: formData.loginForm.email,
      type: "codeengine"
    }).then(res => {
      proxy.$message[res.code === 200 ? 'success' : 'error'](res.msg)
      if (res.code !== 200) return
      let val = setInterval(() => {
        if (formData.isNumber <= 0) {
          clearInterval(val)
          return formData.isNumber = 60
        }
        formData.isNumber--
      }, 1000)
    })
  },
  loginFormClick() {
    proxy.$refs['ruleFormLogin'].validate((valid) => {
      if (!valid) return

      const publicKey = '' // 密钥
      const jsencrypt = new JSEncrypt()
      jsencrypt.setPublicKey(publicKey)

      if (formData.isState === 1) {
        login(
          formData.loginForm.userName,
          jsencrypt.encrypt(formData.loginForm.password),
          "",
          ""
        ).then(res => {
          if (res.code === 200) {
            proxy.$message.success(res.msg);
            ipcRenderer.sendSync('handle-store-users', 'set', {
              codeengine: res.token,
              userName: formData.loginForm.userName,
              adminclass: 1
            })
            formData.dialogVisible = false
            console.log('login ok')
          } else {
            proxy.$message.error(res.msg);
            formData.time = new Date().getTime()
          }
        })
        return
      }
      let loginForm: any = {}

      // 注册 和 找回密码
      loginForm.email = formData.loginForm.email
      loginForm.code = formData.loginForm.code
      loginForm.password = jsencrypt.encrypt(formData.loginForm.password)
      loginForm.userName = formData.loginForm.userName

      let api = formData.isState === 2 ? register : retrieve
      api(loginForm).then(res => {
        if (res.code === 200) {
          proxy.$message.success(res.msg);
          formData.isState = 1
        } else {
          proxy.$message.error(res.msg);
        }
      })


    })

  },
}
</script>

<template>
  <div class="cap-system no-user-select">
    <div class="message-box">
      <div class="left">
        <svg-icon icon-class="system"></svg-icon>
        <span>系统设置</span>
      </div>

    </div>
    <div class="content-box">
      <ul>
        <li v-for="(item, index) in formData.tableData" :title="item.name" @click="handleTableItemClick(item)">
          <svg-icon :icon-class="item.icon"></svg-icon>
          <p>{{ item.name }}</p>
        </li>
      </ul>
    </div>
  </div>

  <!-- 登录提示框 -->
  <el-dialog :title="formData.isState === 1 ? '登录' : formData.isState === 2 ? '注册' : ' 密码找回'"
    v-model="formData.dialogVisible" width="500px" :before-close="methods.handleClose" :destroy-on-close="true"
    :close-on-click-modal="false" custom-class="login_from" center>

    <div>
      <el-form v-if="formData.isState === 1" :model="formData.loginForm" :rules="formData.rules" ref="ruleFormLogin">
        <el-form-item prop="userName">
          <el-input v-model="formData.loginForm.userName" placeholder="请输入账号" maxlength="30"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input type="password" v-model="formData.loginForm.password" placeholder="请输入密码" maxlength="60"></el-input>
        </el-form-item>
        <el-form-item class="code">
          <div class="forget_reg">
            <span class="forget" @click="formData.isState = 3">忘记密码?</span>
            <span class="register" @click="formData.isState = 2">注册</span>
          </div>
        </el-form-item>
      </el-form>

      <el-form v-else-if="formData.isState === 2" :model="formData.loginForm" :rules="formData.rules"
        ref="ruleFormLogin">
        <el-form-item prop="userName">
          <el-input v-model="formData.loginForm.userName" placeholder="请输入账号" maxlength="30"></el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="formData.loginForm.email" maxlength="40" placeholder="请输入电子邮箱,方便账号找回"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="formData.loginForm.password" maxlength="60" placeholder="请输入密码"></el-input>
        </el-form-item>

        <el-form-item class="code">
          <div class="forget_reg">
            <span class="forget" @click="formData.isState = 3">忘记密码?</span>
            <span class="register" @click="formData.isState = 1">去登录</span>
          </div>
        </el-form-item>
      </el-form>

      <el-form v-else :model="formData.loginForm" :rules="formData.rules" ref="ruleFormLogin">
        <el-form-item prop="email">
          <el-input v-model="formData.loginForm.email" maxlength="40" placeholder="请输入电子邮箱"></el-input>
        </el-form-item>

        <el-form-item prop="code">
          <el-input v-model="formData.loginForm.code" maxlength="10" placeholder="输入验证码">
            <template #append>
              <div style="cursor: pointer;padding:7px 0" @click="methods.handleGetCode()">
                {{ formData.isNumber === 60 ? '获取验证码' : formData.isNumber }}</div>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input type="password" v-model="formData.loginForm.password" maxlength="60"
            placeholder="请输入新密码"></el-input>
        </el-form-item>

        <el-form-item class="code">
          <div class="forget_reg">
            <span class="forget" @click="formData.isState = 1">去登录</span>
            <span class="register" @click="formData.isState = 2">去注册</span>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="methods.loginFormClick()">确 定</el-button>
    </div>
  </el-dialog>

</template>




<style lang="scss" scoped>
.cap-system {
  min-width: 214px;
  max-width: 214px;
  background: var(--background-color-white);
  border-radius: 10px;
  position: relative;
  margin-bottom: 15px;
  margin-right: 20px;

  // .message-box
  .message-box {
    .el-icon-arrow-left {
      cursor: pointer;
      margin-right: 5px;
      font-size: $--font-size-medium;
    }

    .el-icon-more {
      transform: rotate(90deg);
      cursor: pointer;
      margin-right: 15px;
    }

    .right {
      i {
        font-size: 14px;
        cursor: pointer;
      }
    }
  }

  // .message-box --end
  .content-box {
    padding: 10px 10px 0;

    ul {
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
      align-items: flex-start;
      justify-content: flex-start;

      li {
        text-align: center;
        width: 64.66px;
        padding: 5px 0;
        cursor: pointer;
        transition: all 0.3s;
        border-radius: 8px;

        svg {
          font-size: 20px;
        }

        p {
          margin-top: 5px;
          display: block;
          font-size: $--font-size-extra-small;
          color: $color-text-primary;
        }
      }

      li:hover {
        background: var(--background-color);
        box-shadow: 0 12px 30px 0 rgb(0 0 0 / 20%);
        transform: translateY(-4px);
      }
    }
  }
}
</style>

<style lang="scss">
.login_from {
  border-radius: 12px;

  .el-dialog__body {
    padding: 30px 40px 5px !important;
  }
  .code .forget_reg{
    width: 100%;
  }
  .code .el-input {
    float: left;
    width: 75%;
  }

  .forget_reg {
    margin-bottom: 0;
    overflow: hidden;
  }

  .forget_reg span {
    cursor: pointer;
  }

  .forget_reg span:hover {
    color: #3d4bf9;
  }

  .forget {
    float: left;
  }

  .register {
    float: right;
  }

  .dialog-footer {
    text-align: center;
    margin-bottom: 20px;
  }

  .dialog-footer button {
    width: 60%;
  }

  .cursor-pointer {
    margin: 4px 0px 4px 4px;
  }
}
</style>