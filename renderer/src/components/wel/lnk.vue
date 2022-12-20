<!--
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-08-16 13:39:26
 * @LastEditTime: 2022-03-07 10:42:21
 * @Description: 已安装的小程序[快捷入口]
-->


<template>
  <div class="app-box no-user-select" ref="lnkItem">
    <div class="message-box">
      <div class="left">
        <svg-icon icon-class="applet"></svg-icon>
        <span>已安装的小程序</span>
      </div>
      <div class="right">
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            <!-- <i class="el-icon-more"></i> -->
            <el-icon class="el-icon-more">
              <More />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item class="clearfix" @click="handleSelectFile">
                添加 <i class="el-icon-plus"></i>
              </el-dropdown-item>
              <el-dropdown-item class="clearfix">
                编辑
              </el-dropdown-item>
              <el-dropdown-item class="clearfix">
                取消
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <ul class="applet-box">
      <li v-for="(item, index) in formData.appletData" :title="item.name"
        @contextmenu.native="handleContextmenu($event, item)" @dblclick="handleStart(item)">
        <img :src="item.icon">
        <p v-if="item.editType === 0">{{ item.name }}</p>
        <p v-if="item.editType === 1">
          <el-input ref="focusInput" type="text" size="mini" v-model="item.name" spellcheck="false" @click.stop
            @blur="handleInputBlur($event, item)" />
        </p>
      </li>

    </ul>

    <!-- tag盒子 -->
    <div v-if="formData.contextmenuFlag" class="tags"
      :style="{ left: formData.contentmenuX + 'px', top: formData.contentmenuY + 'px' }">
      <div class="item" @click.stop="handleAddDesktopIcon">添加到桌面</div>
      <div class="item">修改详情</div>
      <div class="item" @click.stop="handleRechristen">重命名</div>
      <div class="item" @click.stop="handleDelete">删除</div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, nextTick } from 'vue'
import { ElIcon } from 'element-plus'
import { More } from '@element-plus/icons-vue'
import { bigInOrderNo } from '@/utils/validate'
// import { dataBase } from "@/utils/database.js";
import DB from '@/utils/db'
// sqlite 接口
import { list as appletList, rechristen as appletRechristen, deleteItem as appletDeleteItem } from '@/sql/wel.js'

let { ipcRenderer } = require('electron')

let formData: any = reactive({
  appletData: [],
  contextmenuFlag: false,
  contentmenuX: 50,
  contentmenuY: 50,
  contextmenuItem: {}
})
const lnkItem: any = ref(null)
const focusInput: any = ref(null) //用于input聚焦
// let db = $ce.nedb({
//   appPath: "userData",
//   filename: "/saves/lnk.db"
// })

let systemDB: any = new DB('system/system.db').getDB()

// let systemDB = sqliteDBSyanc('system/system.db');
onMounted(async () => {
  // const res = db.paging()
  // formData.appletData = res;
  await getList()
  window.addEventListener('click', watchContextmenu, true)
})

const getList = async () => {
  const res = appletList(systemDB)
  if (res.length !== 0) {
    for (var i in res) {
      res[i].editType = 0 // 编辑状态
    }
    formData.appletData = res
  }
}

// 生命周期卸载前调用
onBeforeUnmount(() => {
  window.removeEventListener('click', watchContextmenu, false)
})

// window 点击事件
const watchContextmenu = (event) => {
  formData.contextmenuFlag = false
}

// 打开选择文件对话框
const handleSelectFile = () => {
  ipcRenderer.invoke('handle-open-dialog-lnk', { id: bigInOrderNo(), sqlite: 'system/system.db' }).then(
    (res) => {
      if (res.canceled) return
      if (res.target) {
        let index = formData.appletData.findIndex((item) => item.appid === res.appid)
        if (index === -1) return formData.appletData.push(res)
        return (formData.appletData[index] = res)
      }
      formData.appletData.push(res)
    },
    (error) => {
      console.log(error)
    }
  )
}

// // 点击启动APP
const handleStart = async (item) => {
  if (item.editType === 1) return
  await ipcRenderer.invoke('handle-open-applet', item.dirname, item.filepath, item.appid, item.target)
}

// 右键
const handleContextmenu = (event, item) => {
  let target = event.target
  formData.contextmenuItem ? (formData.contextmenuItem.editType = 0) : ''
  formData.contentmenuX = event.clientX
  formData.contentmenuY = event.clientY
  formData.contextmenuFlag = true
  formData.contextmenuItem = item
}

// 重命名
const handleRechristen = (event) => {
  formData.contextmenuFlag = false
  formData.contextmenuItem.editType = 1
  nextTick(() => {
    focusInput.value.focus()
  })
}

// input 失去焦点
const handleInputBlur = async (event, item) => {
  if (event.target.value.length === 0) return focusInput.value.focus()
  item.editType = 0
  await appletRechristen(systemDB, item.id, item.name)
}

// 删除
const handleDelete = async () => {
  try {
    console.log(formData.contextmenuItem)
    if (formData.contextmenuItem.type === 1) {
      let err = await ipcRenderer.invoke(
        'handle-fs-rmSync',
        formData.contextmenuItem.dirname,
        formData.contextmenuItem.appid
      )
      if (err && err.error) return console.log(err.msg)
    }
    await appletDeleteItem(systemDB, formData.contextmenuItem.id)
    formData.appletData = formData.appletData.filter((item) => item.id !== formData.contextmenuItem.id)
  } catch (error) {
    console.log(error)
  }
}

// 添加桌面图标
const handleAddDesktopIcon = () => {
  console.log(formData.contextmenuItem)
  ipcRenderer.send('set-desktop-icon', {
    target: formData.contextmenuItem.appid,
    type: formData.contextmenuItem.type,
    filepath: formData.contextmenuItem.filepath,
    name: formData.contextmenuItem.name,
    icon: formData.contextmenuItem.icon
  })
}
</script>
<style lang="scss">
.app-box .applet-box li p input {
  height: 22px;
  line-height: 22px;
  padding: 0 4px;
}
</style>

<style lang="scss" scoped>
.app-box {
  min-width: 692px;
  max-width: 692px;
  min-height: 212px;
  background: var(--background-color-white);
  border-radius: 10px;
  margin: 0 20px 15px;
  position: relative;
  overflow: hidden;

  // applet-box
  .applet-box {
    padding: 10px 10px;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    width: 689px;
    height: 166px;
    overflow-y: auto;

    li {
      text-align: center;
      padding: 10px 20px;
      cursor: pointer;
      margin-top: 5px;
      transition: all 0.3s;
      border-radius: 16px;

      img {
        width: 32px;
        height: 32px;
      }

      p {
        font-size: 12px;
        width: 72px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        position: relative;
        color: $color-text-primary;
        height: 22px;
        line-height: 22px;

        .el-input {
          height: 22px;
          line-height: 22px;
        }
      }
    }

    li:hover {
      background: var(--background-color);
      box-shadow: 0 12px 30px 0 rgb(0 0 0 / 20%);
      transform: translateY(-4px);
    }
  }

  // applet-box --end

  .tags {
    position: fixed;
    width: 105px;
    background-color: var(--background-color-white);
    z-index: 1024;
    border-radius: 5px;
    -webkit-box-shadow: 1px 2px 10px var(--color-ccc);
    box-shadow: 1px 2px 10px var(--color-ccc);
  }

  .tags .item {
    cursor: pointer;
    font-size: 14px;
    padding: 8px 20px 8px 15px;
    color: var(--color-text-regular);
  }

  .tags .item:hover {
    background-color: var(--hover-background-color-primary);
    color: var(--color-text-white);
  }

  .tags .item:last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
}
</style>