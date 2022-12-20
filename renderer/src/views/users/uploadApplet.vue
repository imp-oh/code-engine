<!--
 * @Author: Chen
 * @Email: codeeetop@qq.com
 * @Date: 2021-12-22 14:21:03
 * @LastEditTime: 2022-02-14 16:26:52
 * @Description: 上传小程序
-->
<template>
  <return-page class="upload-applet" v-loading="formData.loading" element-loading-background="rgba(0, 0, 0, 0.8)"
    element-loading-text="加载中..." @dragenter="handleDragenter" @dragover="handleDragover" @dragleave="handleDragleave"
    @drop="handleDrop">
    <el-form ref="ruleForm" label-width="90px" class="upload-form no-user-select" :model="formData.appletData"
      :rules="formData.rules">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="name" prop="name">
            <el-input v-model="formData.appletData.name" placeholder="" size="mini"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="appid" prop="appid" title="appid是唯一的，每个项目请使用不同的">
            <el-input v-model="formData.appletData.appid" placeholder="" size="mini" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="version" prop="version">
            <el-input v-model="formData.appletData.version" placeholder="" size="mini"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="icon">
            <img :src="formData.appletData.iconPath ? formData.appletData.iconPath + '?t=' + new Date().getTime() : ''"
              alt="" class="icon">
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="简介" prop="description">
            <el-input v-model="formData.appletData.description" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"
              placeholder="输入简介...">
            </el-input>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <textarea id="editormd" class="markdown-body">{{ formData.appletData.readmeContent }}</textarea>
        </el-col>

        <el-col style="text-align: center;margin-top:10px;">
          <el-button type="primary" size="medium" style="width:160px" @click="handleSubmit">提交</el-button>
        </el-col>

      </el-row>
    </el-form>
  </return-page>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, reactive, ref, getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import { path, ipcRenderer } from '@/global'
import codemirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
// 引入主题后还需要在 options 中指定主题才会生效
import 'codemirror/theme/juejin.css'
import 'codemirror/mode/markdown/markdown.js'

let router = useRouter();
const { proxy }: any = getCurrentInstance()

const formData: any = reactive({
  loading: false,
  appletData: {
    readmeContent: ""
  },
  cm: null,
  rules: {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    appid: [{ required: true, message: '请输入小程序id', trigger: 'blur' }],
    version: [{ required: true, message: '请输入版本号', trigger: 'blur' }]
  }
})
onMounted(() => {
  methodInitEditor()
})

const handleDragenter = (e) => {
  e.preventDefault();
  if (formData.loading || e.dataTransfer.items && e.dataTransfer.items[0].kind === 'string') return
  formData.loading = true
}
const handleDragover = (e) => {
  e.preventDefault();
  if (formData.loading) return
}

//拖放文件离开拖放区域。
const handleDragleave = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.clientX !== 0) return
  formData.loading = false
}

const handleDrop = async (e) => {
  e.preventDefault();
  try {
    if (!formData.loading) return
    formData.loading = false
    if (e.dataTransfer.files.length === 0) return
    let files = e.dataTransfer.files[0]
    let extname = path.extname(files.path)
    let ext = ['.CodeEngine', '.codeengine', '.CODEENGINE']
    if (!ext.includes(extname)) return proxy.$message.error('只支持后缀.codeengine')
    console.log(files)
    let fileInfo = await ipcRenderer.invoke('handle-upload-applet', files.path)
    if (fileInfo && fileInfo.code === 400) return proxy.$message.error(fileInfo.msg);
    fileInfo.codeenginePath = files.path
    fileInfo.size = files.size
    fileInfo.description = fileInfo.description || ''
    formData.appletData = fileInfo

  } catch (error) {
    console.log(error)
  }
}



const methodInitEditor: any = (markdown) => {
  let elDom = document.getElementById("editormd");
  formData.cm = codemirror.fromTextArea(elDom, {
    highlightFormatting: true,
    // mode: "text/x-markdown",
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


const handleSubmit = () => {
  proxy.$refs['ruleForm'].validate((valid) => {
    if (valid) {
      formData.loading = true
      try {
        formData.appletData.readmeContent = formData.cm.getValue()
        ipcRenderer.invoke('handle-upload-applet-file', { ...formData.appletData }).then(res => {
          if (!res) proxy.$message.error(res);
          if (res && res.code !== 200) {
            formData.loading = false
            return proxy.$message.error(res.msg);
          }
          proxy.$message.success(res.msg);
          setTimeout(() => {
            formData.loading = false
            router.push({ path: "/users" });
          }, 300)

        }, err => {
          proxy.$message.error(err?.msg);
          formData.loading = false
        })
      } catch (error) {
        console.log(error)
        formData.loading = false
      }
    }
  })


}

onBeforeUnmount(() => {
  formData.cm.toTextArea()
})
</script>


<style  lang="scss">
.upload-applet {
  .CodeMirror {
    height: 100%;
    background: none;
  }

  .CodeMirror {
    height: 300px;
    margin-left: 92px;
    border: 1px solid #dcdfe6;
    overflow: hidden;

    .CodeMirror {
      height: 100%;
    }
  }
}
</style>
<style lang="scss" scoped>
.upload-applet {
  -webkit-app-region: no-drag;
}

.upload-form {
  padding: 0 40px;

  .icon {
    width: 40px;
  }
}
</style>