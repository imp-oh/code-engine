<!--
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-06-08 16:01:45
 * @LastEditTime: 2022-02-28 14:56:17
 * @Description: ...每位新修改者自己的信息
-->


<script setup lang="ts">
import { onMounted, onBeforeUnmount, reactive, ref } from "vue";
import { ElIcon } from 'element-plus'
import { Download, Promotion, Refresh, VideoPause } from '@element-plus/icons-vue'
import { useRoute, useRouter } from "vue-router";
import { storePage } from '@/api/system/storeUser'
import { bigInOrderNo } from '@/utils/validate.js';
import { ipcRenderer, config, __dirpath } from '@/global'
import markdownit from 'markdown-it'
import xss from 'xss'
import hljs from 'highlight.js'
import path from 'path'

import DB from '@/utils/db'

const getFileSize = (bytes = 0, isUnit = true) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  isUnit = isUnit ? true : false;
  if (bytes === 0) return isUnit ? '0B' : '0';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  if (i === 0) return bytes + (isUnit ? sizes[i] : '');
  return (bytes / 1024 ** i).toFixed(2) + (isUnit ? sizes[i] : '')
}


let router = useRouter();
let route = useRoute();
let db: any = new DB('system/system.db').getDB()



let dataMain: any = reactive({
  fileName: "",
  tableData: [],
  search: "",
  drawer: false,
  drawerObject: {}
})
onMounted(() => {
  dataMain.search = route.params.search

  methods.getList()


  ipcRenderer.on('downloadItemUpdate', async (event, args) => {
    console.log(args)
    args.speeds = getFileSize(args.speed)
    args.totalBytess = getFileSize(args.totalBytes)
    args.receivedBytess = getFileSize(args.receivedBytes, false)
    methods.handleUpdateData(args)
  })

  // 下载成功后
  ipcRenderer.on("downloadItemDone", async (event, downloadItem) => {
    console.log(downloadItem.id)


    // const arrayAPPID = await ipcRenderer.invoke('get-appletId')
    // let index = arrayAPPID.findIndex(appItem => appItem.appid === downloadItem.id)
    // if (index !== -1) {
    //   let tabIndex = dataMain.tableData.findIndex(appItem => appItem.appid === downloadItem.id)
    //   if (tabIndex !== -1) {
    //     dataMain.tableData[tabIndex].file.progress = 1
    //     dataMain.tableData[tabIndex].appItem = arrayAPPID[index]
    //   }
    // }
  })

});


//在组件卸载之前
onBeforeUnmount(() => {
  ipcRenderer.removeAllListeners('downloadItemUpdate')
  ipcRenderer.removeAllListeners('downloadItemDone')
})


const methods = {


  handleRow(row) {
    dataMain.drawer = true
    let md = markdownit({
      highlight: function (str, lang) {
        console.log(lang)
        if (lang && hljs.getLanguage(lang)) {
          try {
            return '<div class="language-' + lang + '"><pre><code>' +
              hljs.highlight(lang, str, true).value +
              '</code></pre></div>';
          } catch (__) { }
        }

        return ""
      }
    });
    row.marked = md.render(xss(row.readmeContent))

    dataMain.drawerObject = row
  },
  getList() {
    storePage(dataMain.search).then(async (res) => {
      // const arrayAPPID = await ipcRenderer.invoke('get-appletId')
      const arrayAPPID = db.prepare("SELECT * FROM c_applet limit 0,36").all();
      console.log(arrayAPPID)
      if (res.code === 200) {
        // state 2暂停 1下载中 0下载
        res.rows.forEach(item => {
          item.logo = item.icon ? config.targetFile + item.icon : __dirpath + "\\build\\icons\\icon.ico"
          item.file = []
          item.state = 0;
          item.size = getFileSize(item.size)
          let index = arrayAPPID.findIndex((appItem: any) => appItem.appid === item.appid)
          if (index !== -1) {
            item.appItem = arrayAPPID[index]
            item.file.progress = 1
          }
        })
        dataMain.tableData = res.rows
      }
    })
  },

  handleDownload(row) {
    row.state = 1
    ipcRenderer.invoke("newDownloadFile", {
      url: config.targetFile + row.filename,
      fileName: '', // new Date().getTime() + '',
      id: row.appid
    }).then(res => {
      if (res) {
        res.progress = 1
        row.file = res
      }
    })
  },

  // 更新下载数据
  handleUpdateData(item: any) {
    console.log('下载百分比')
    const index = dataMain.tableData.findIndex(d => d.appid === item.id)
    if (index > -1) {
      if (dataMain.tableData[index].file.progress === 1) return
      let progress: any = (item.progress * 100)
      item.progressInt = parseInt(progress)
      dataMain.tableData[index].file = item
      dataMain.tableData[index].state = 1
    }
  },


  // 暂停 || 恢复下载
  handleStop(item) {
    ipcRenderer.invoke('pauseOrResume', { ...item.file }).then(res => {
      item.state = item.state === 2 ? 1 : 2
    })
  },
  async handleDelete(item: any) {
    let appItem = item.appItem
    ipcRenderer.invoke('removeDownloadItem', {
      appid: appItem.appid,
      path: path.join(appItem.dirname, appItem.filepath)
    }).then(res => {
      console.log(res)
      // dataMain.tableData.splice(index, 1)
    })
  },
  async handleOpen(item) {
    // ipcRenderer.invoke('openFileInFolder', item.file.path).then(res => {
    //   console.log("打开了")
    // })
    let appItem = item.appItem
    await ipcRenderer.invoke("handle-open-applet", appItem.dirname, appItem.filepath, appItem.appid, appItem.target);
  }
}
</script>

<template>
  <return-page class="apple-store">

    <template v-slot:center>
      <div class="system-search-box">
        <el-input class="search" size="mini" style="width: 200px;" maxlength="100" v-model="dataMain.search"
          @change="methods.getList()" spellcheck="false"></el-input>
        <svg-icon icon-class="search" class="search-button" @click="methods.getList()"></svg-icon>
      </div>
    </template>

    <!-- 商城展示 -->

    <ul class="app-box">

      <li v-for="(item, index) in dataMain.tableData" @click="methods.handleRow(item)">
        <div class="item-img">
          <img :src="item.logo" alt="">
        </div>
        <div class="item-content">
          <h4>{{ item.name }}</h4>
          <p>{{ item.description }}</p>
          <div class="item-button">

            <el-button size="mini" type="danger" circle title="更新"
              v-if="item.file.progress === 1 && item.appItem && item.version > item.appItem.version"
              @click.stop="methods.handleDownload(item)">
              <el-icon>
                <Refresh />
              </el-icon>
            </el-button>

            <el-button size="mini" type="primary" circle title="启动" v-if="item.file.progress === 1"
              @click.stop="methods.handleOpen(item)">
              <el-icon>
                <Promotion />
              </el-icon>
            </el-button>
            <template v-else>
              <el-button size="mini" type="primary" circle title="下载小程序" @click.stop="methods.handleDownload(item)"
                v-if="item.state === 0">
                <el-icon>
                  <Download />
                </el-icon>
              </el-button>
              <el-button size="mini" type="primary" circle title="下载中" v-if="item.state === 1"
                @click.stop="methods.handleStop(item)">
                <el-icon>
                  <VideoPause />
                </el-icon>
              </el-button>

              <el-button size="mini" type="primary" circle title="继续下载" v-if="item.state === 2"
                @click.stop="methods.handleStop(item)">
                <el-icon>
                  <VideoPlay />
                </el-icon>
              </el-button>

              <span class="progress"> {{ item.file.progressInt ? item.file.progressInt + '%' : "" }}</span>
            </template>

          </div>
        </div>
      </li>

    </ul>

    <el-drawer v-model="dataMain.drawer" title="" size="50%">
      <ul class="apple-store-drawer">

        <li>
          <div class="item-img">
            <img :src="dataMain.drawerObject.logo" alt="">
          </div>
          <div class="right">
            <div class="item">
              <h3>{{ dataMain.drawerObject.name }}</h3>
            </div>
            <p class="desc">{{ dataMain.drawerObject.description }}</p>

            <div>
              <el-button type="primary" size="mini"
                @click.stop="methods.handleOpen(dataMain.drawerObject)">启动</el-button>
              <el-button type="success" size="mini"
                @click="methods.handleDownload(dataMain.drawerObject)">更新</el-button>
              <el-button type="danger" size="mini" @click="methods.handleDelete(dataMain.drawerObject)">删除</el-button>
              <el-button size="mini" type="warning">安装目录</el-button>
              <!-- <i class="el-icon-s-tools"></i> -->
            </div>
          </div>
        </li>

        <li class="info">
          <div>
            <p>开发者</p>
            <span>{{ dataMain.drawerObject.userName }}</span>
          </div>
          <div>
            <p>大小</p>
            <span>{{ dataMain.drawerObject.size }}</span>
          </div>
          <div>
            <p>版本</p>
            <span>{{ dataMain.drawerObject.version }}</span>
          </div>
        </li>

        <li class="content">
          <div v-html="dataMain.drawerObject.marked" style="padding:0 10px"></div>
        </li>
      </ul>
    </el-drawer>

  </return-page>
</template>


<style lang="scss">
.apple-store {
  #system {
    .el-icon-arrow-left {
      color: #fff;
    }

    .system-search-box {
      -webkit-app-region: no-drag;
      position: absolute;
      left: 50%;
      margin-left: -100px;

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
    }
  }

  .el-drawer__header {
    margin-bottom: 10px;
  }
}
</style>

<style lang="scss" scoped>
.apple-store {
  background: #7d86a9;

  .apple-store-drawer {
    height: 100%;

    li {
      margin: 0 10px;
      display: flex;
      flex: 1;

      .right {
        width: 100%;
        margin-left: 20px;

        .item {
          display: flex;

          h3 {
            margin: 0;
          }
        }

        .desc {
          color: #8a8f99;
          font-size: 12px;
          margin: 7px 0;
        }
      }

      .item-img img {
        width: 88px;
        height: 88px;
      }
    }

    .info {
      flex-wrap: wrap;
      flex-direction: row;
      align-items: flex-start;
      justify-content: flex-start;
      margin: 15px 0;

      div {
        width: 33.333%;
        text-align: center;

        p {
          font-size: 1rem;
          font-weight: bold;
          margin-bottom: 5px;
        }

        span {
          color: #8a8f99;
          font-size: 14px;
        }
      }
    }

    li.content {
      margin: 0;
      display: block;
      overflow: auto;
      height: 478px;

      div {
        margin: 0;
        // padding: 0 25px !important;
      }
    }

    li.content::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    li.content::-webkit-scrollbar-track {
      background: rgb(239, 239, 239);
      border-radius: 2px;
    }

    li.content::-webkit-scrollbar-thumb {
      background: #bfbfbf;
      border-radius: 10px;
    }

    li.content::-webkit-scrollbar-thumb:hover {
      background: #333;
    }

    li.content::-webkit-scrollbar-corner {
      background: #2688d8;
    }
  }

  .progress {
    font-size: 14px;
    color: #303133;
    margin-left: 8px;
  }
}

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
    background: #fff;

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
        color: #8a8f99;
        height: 12px;
        line-height: 12px;
        padding-top: 12px;
        padding-right: 75px;
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
    background: #f3f6f9;
    box-shadow: 0 12px 30px 0 rgb(0 0 0 / 20%);
    transform: translateY(-4px);
  }
}

.g-container {
  p {
    padding: 5px;
  }

  .header {
    padding: 20px;
    border-bottom: 1px solid #eee;
  }

  ul {
    list-style-type: none;
  }

  ul>li {
    position: relative;
    border-bottom: 1px solid #eee;
  }

  ul>li>.li-row {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
    padding: 0 20px;
  }

  .flieNam {
    font-weight: bold;
  }

  .style_file-info {
    flex: 1 1;
    padding: 0 10px;
    overflow: hidden;
  }

  .style_file-desc {
    color: #999;
    display: flex;
    font-size: 14px;
  }

  .style_file-desc>p {
    flex: 1 1;
  }

  .download-item-progress {
    background-color: #e6f7ff;
    position: absolute;
    left: 0;
    top: 0;
    max-width: 100%;
    height: 100%;
    transition: width 0.3s linear;
  }
}
</style>