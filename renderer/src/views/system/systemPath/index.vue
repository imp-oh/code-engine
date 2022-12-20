<!--
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-08-30 11:11:07
 * @LastEditTime: 2022-02-14 16:20:52
 * @Description: 系统环境配置
-->


<script setup lang="ts">

import { defineComponent, onMounted, reactive } from 'vue'
import { __system, ipcRenderer, path } from '@/global'
// const { ipcRenderer } = require('electron')
const { env } = process

// const system: any = __system()
const formData: any = reactive({
  systemPath: false,
  appletDir: path.join(env.CE_MODULES, 'CodeEngineModules', 'applet'),
  modulesDir: path.join(env.CE_MODULES, 'CodeEngineModules', 'node_modules'),
  downloadDir: path.join(env.CE_MODULES, 'CodeEngineModules', 'download')
})



onMounted(async () => {
  formData.systemPath = await ipcRenderer.invoke("handle-system-path", 'get');
})

const handleChange = async (value) => {
  await ipcRenderer.invoke("handle-system-path", value)
}


// 文件选择
const handleSelect = (val) => {
  let name = val === 1 ? 'appletDir' : 'modulesDir'
  ipcRenderer.invoke("handle-open-dialog-dir", name).then(res => {
    formData[name] = res[name]
  })
}
</script>

<template>
  <return-page>
    <div class="system-config">
      <el-row>
        <el-col :span="4" class="title">
          系统环境配置
        </el-col>
        <el-col :span="20">
          <el-switch v-model="formData.systemPath" @change="handleChange"> </el-switch>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="4" class="title">
          小程序应用路径安装
        </el-col>
        <el-col :span="16">
          <div class="el-input--mini_diy">
            <span class="el-input__inner">{{ formData.appletDir }}</span>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button size="mini" type="primary" class="margin-left-10" @click="handleSelect(1)">选择</el-button>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="4" class="title">
          公共依赖库
        </el-col>
        <el-col :span="16">
          <div class="el-input--mini_diy">
            <span class="el-input__inner">{{ formData.modulesDir }}</span>
          </div>

        </el-col>
        <el-col :span="4">
          <el-button size="mini" type="primary" class="margin-left-10" @click="handleSelect(2)">选择</el-button>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="4" class="title">
          便器保存时间设置
        </el-col>
        <el-col :span="20">
          <el-input size="mini" style="width:130px"></el-input>
        </el-col>
      </el-row>

    </div>

  </return-page>
</template>



<style lang="scss" scoped>
.system-config {
  padding: 20px;

  .el-row {
    margin-bottom: 10px;
  }

  .margin-left-10 {
    margin-left: 10px;
  }

  .title {
    font-size: 14px;
    color: #444;
  }

  .el-input--mini_diy {
    box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
    padding: 1px 11px;
  }
}
</style>