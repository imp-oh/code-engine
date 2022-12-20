/*
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-07-15 09:21:00
 * @LastEditTime: 2022-01-13 10:17:14
 * @Description: ...每位新修改者自己的信息
 */
const { app, shell } = require("electron")
const { getFileName,
  isExistFile,
  openFile,
  openFileInFolder,
  pathJoin,
  removeFile,
  uuidV4,
  unzipCodeEngine
} = require("./util")


const {
  isExistItem,
  setTaskbar,
  addDownloadItem,
  updateDownloadItem,
  getDownloadBytes,
  getDownloadData,
  getDownloadItem,
  setDownloadStore,
  initDownloadData
} = require("./helper")


const store = require("../store/index")
// const { fstat } = require("original-fs")
const fs = require('fs')

let mainWin = null
let newDownloadItem = null
let initDownloadItem = [] // 初始对象
let downloadItemData = store.get('applet') || []
let downloadCompletedIds = [] // 下载完成的 id
let tempDownloadItemIds = []  // 下载中的 id


/**
 * 下载文件
 * @param newItem - 新下载项
 */
function downloadFile (newItem) {
  let { webContents } = this.electron.mainWindow

  const { url, fileName, path: savePath, id: fileId } = newItem
  const newFileName = getFileName(fileName || '', url) // 处理文件名
  // 处理保存路径
  const downloadPath = pathJoin(savePath, newFileName)
  // 查找下载记录中是否存在历史下载
  // console.log(downloadItemData)
  const existItem = isExistItem(fileId, downloadItemData)
  if (existItem) {
    removeFile(newItem.path) //删除文件
    downloadItemData = []
    downloadCompletedIds = []
    // console.log("删除中")
  }

  newItem.fileName = newFileName
  newItem.path = downloadPath

  // 判断是否存在
  if (isExistFile(downloadPath)) {
    const id = existItem?.id || fileId //uuidV4()
    return { id, ...newItem }
  }


  if (existItem) {
    retryDownloadFile.call(this, { ...existItem, ...newItem, url })
    return null
  }


  newDownloadItem = {
    url,
    fileName: newFileName,
    path: downloadPath,
    id: fileId
  }

  webContents.downloadURL(url)
  return null
}



/**
 * 重新下载
 * @param data - 下载项
 */
function retryDownloadFile (data) {
  let { webContents } = this.electron.mainWindow
  newDownloadItem = {
    fileName: data.fileName,
    path: data.path,
    url: data.url,
    id: data.appid
  }
  tempDownloadItemIds.push(data.id)
  webContents.downloadURL(data.url)

  return true
}



/**
 *  初始WindowMain
 */
const handleDownloadData = () => {
  downloadItemData = initDownloadData()
}


/**
 * 监听下载
 * @param event - electron 事件
 * @param item - 下载项
 * @param webContents - webContents
 */
const listenerDownload = async (event, item, webContents) => {
  // 新建下载为空时，会执行 electron 默认的下载处理
  if (!newDownloadItem) return
  let { env } = process


  let prevReceivedBytes = 0 // 记录上一次下载的字节数据
  // 添加下载项
  const downloadItem = await addDownloadItem({
    item,
    downloadIds: tempDownloadItemIds,
    data: downloadItemData,
    newDownloadItem,
  })


  setTaskbar(downloadItemData, downloadCompletedIds, -1, mainWin)

  // 新下载任务创建完成，渲染进程监听该事件，添加到下载管理器列表
  webContents.send('newDownloadItem', { ...downloadItem, _sourceItem: null })

  // 更新下载
  item.on('updated', (e, state) => {
    const receivedBytes = updateDownloadItem({
      item,
      downloadItem,
      data: downloadItemData,
      prevReceivedBytes,
      state,
    })
    prevReceivedBytes = receivedBytes

    // 获取所有下载中的接受字节和总字节数据
    // const bytes = getDownloadBytes(downloadItemData)
    // 更新任务栏进度

    mainWin?.setProgressBar(downloadItem.progress * 1)
    // 通知渲染进程，更新下载状态
    webContents.send('downloadItemUpdate', { ...downloadItem, _sourceItem: null })
  })

  // 下载完成
  item.on('done', (e, state) => {
    downloadItem.state = state
    downloadItem.receivedBytes = item.getReceivedBytes()

    if (state !== 'cancelled') {
      downloadCompletedIds.push(downloadItem.id)
    }

    setTaskbar(downloadItemData, downloadCompletedIds, 0, mainWin)
    // 下载成功
    if (state === 'completed' && process.platform === 'darwin') {
      app.dock.downloadFinished(downloadItem.path)
    }


    setDownloadStore(downloadItemData)
    // 通知渲染进程，更新下载状态

    // 自动安装小程序    
    unzipCodeEngine({
      canceled: false,
      filePaths: [downloadItem.path]
    }, {
      sqlite: 'system/system.db',
      id: new Date().getTime(),
      path: downloadItem.path
    }).then(res => {
      webContents.send('downloadItemDone', { ...downloadItem, _sourceItem: null, appPath: env.APP_DEV == 'true' ? 'D:\\Code\\ce\\CodeEngine\\CodeEngine.exe' : app.getPath("exe") })
      try {
        fs.unlinkSync(downloadItem.path)
      } catch (error) {
        console.log('listenerDownload:error =>', error)
      }
    }, error => {
      console.log(error)
    })

  })
}






/**
 * 暂停或恢复
 * @param item - 下载项
 */
function pauseOrResume (item) {
  const sourceItem = getDownloadItem(downloadItemData, item.id)

  if (!sourceItem) return item


  if (sourceItem.resume === undefined || sourceItem.pause === undefined) {
    // 如果下载中或中断的，继续下载
    if (['progressing', 'interrupted'].includes(item.state)) {

      newDownloadItem = {
        url: item.url,
        fileName: item.fileName,
        path: item.path,
      }

      item.paused = true

      tempDownloadItemIds.push(item.id)
      download(item.url)
      return
    }
    console.log("下载 成功的-----")
    downloadCompletedIds.push(item.id)
    return
  }


  if (item.paused) {
    sourceItem.resume()
  } else {
    sourceItem.pause()
  }

  item.paused = sourceItem.isPaused()

  setDownloadStore(downloadItemData)
  return item
}

/**
 * 移除下载项。下载中会取消下载
 * @param item - 下载项
 * @param index - 下载项的下标
 */
const removeDownloadItem = (appid) => {
  const sourceItem = getDownloadItem(downloadItemData, appid)
  downloadItemData.splice(index, 1)
  // 如果下载项的状态是下载中，需要取消
  if (item.state === 'progressing') {
    sourceItem && sourceItem.cancel()
  }
  downloadCompletedIds = downloadCompletedIds.filter(id => id !== appid)
  removeFile(item.path)
  setDownloadStore(downloadItemData)
  return item
}





module.exports = {
  downloadFile,
  listenerDownload,
  downloadItemData,
  downloadCompletedIds,
  handleDownloadData,
  initDownloadData,
  pauseOrResume,
  openFileInFolder,
  removeDownloadItem
}