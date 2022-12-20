const { dialog, webContents, shell, BrowserWindow, BrowserView,
  Notification, powerMonitor, screen, nativeTheme, app, session } = require('electron')
const { Registry } = require('rage-edit')
const fs = require('fs')
const promises_fs = require("fs/promises")
const store = require("../store/index")
const { downloadFile, pauseOrResume, openFileInFolder, removeDownloadItem } = require("../download/index")
const { getFileIcon, openDialogLnk, openFile, writeShortcutLink } = require("../download/util")
const path = require('path')
const AdmZip = require('adm-zip')
const { getAsarBuffer, getFileBuffer } = require('../ce/index')
const { httpUploadFile } = require('../utils/uploadFile')
const { listenerDownload } = require("../download/index")
const log = require('electron-log')


const getStoreSystem = () => {
  const { env } = process
  let systemConfig = {
    appletDir: path.join(env.CE_MODULES, 'CodeEngineModules', 'applet'),
    modulesDir: path.join(env.CE_MODULES, 'CodeEngineModules', 'node_modules'),
    downloadDir: path.join(env.CE_MODULES, 'CodeEngineModules', 'download')
  }
  return systemConfig
}


let fsRmSync = async (arg, appid) => {
  let dirPaht = (typeof arg) === 'string' ? arg : arg.dirname
  if (dirPaht.length === 0) return
  try {
    if (fs.existsSync(dirPaht)) {
      await promises_fs.rm(dirPaht, {
        recursive: true
      })
    }
    return null
  } catch (error) {
    console.log(error)
    if (error.errno === -4082) {
      let info = dialog.showMessageBoxSync({
        type: 'info',
        title: '提示信息',
        message: `内存占用，点击确定在删除${error.code}:${error.syscall} path:${error.path}`,
        buttons: ['ok', 'no']
      })
      if (info === 0) {
        app.relaunch()
        app.exit()
        return fsRmSync(arg, appid)
      } else {
        return {
          error: 21,
          msg: "程序删除"
        }
      }
    }
    return {
      error: 21,
      msg: "程序删除"
    }
  }
}

class Plug {
  constructor (ctx) {
    this.ctx = ctx
  }

  /** 创建前的生命周期 */
  beforeCreate (self) {
    console.log('创建前的生命周期')
  }

  /** 创建后的生命周期 */
  created (self) {
    console.log('创建后的生命周期')
    session.defaultSession.on('will-download', listenerDownload)

    self.electron.mainWindow.webContents.setWindowOpenHandler((details) => {
      const winx = new BrowserWindow({
        // icon: `${__dirpath}\\base\\icon\\icon.ico`,
        autoHideMenuBar: true,
      })
      winx.loadURL(details.url)
      return { action: 'deny', overrideBrowserWindowOptions: null }
    })
  }

  /**
   * 消息提示对话框
   */
  messageShow () {
    dialog.showMessageBoxSync({
      type: 'info', // "none", "info", "error", "question" 或者 "warning"
      title: '自定义标题-message',
      message: '自定义消息内容',
      detail: '其它的额外信息'
    })

    return '打开了消息框'
  }

  // 开关事件
  'window-controls' (event, type) {
    let self = this.ctx
    let returnValue = ''
    // 事件监听
    switch (type) {
      case 'min':
        self.electron.mainWindow.minimize()
        returnValue = ''
        break
      case 'max':
        if (self.electron.mainWindow.isMaximized()) {
          self.electron.mainWindow.unmaximize()
        } else {
          self.electron.mainWindow.maximize()
        }
        returnValue = self.electron.mainWindow.isMaximized()
        break
      case 'close':
        self.electron.mainWindow.close()
        returnValue = ''
        break
      default:
        returnValue = self.electron.mainWindow.isMaximized()
        break
    }
    return returnValue
  }

  // 获取store本地信息
  'handle-store-users' (event, type = 'get', options) {
    let returnValue = undefined
    if (type === 'get' || type === 'GET') {
      returnValue = store.get('users')
    } else if (type === 'set' || type === 'SET') {
      returnValue = store.set('users', options)
    }
    return returnValue
  }

  // 打开小程序
  'handle-open-applet' (event, dirName, filePath, appid, target) {
    console.log('=> handle-open-applet')
    console.log(filePath)
    return openFile(dirName, filePath, appid, target)
  }



  /* node 删除文件目录 */
  async 'handle-fs-rmSync' (event, arg, appid) {
    try {
      return await fsRmSync(arg, appid)
    } catch (error) {
      console.log(error)
      return error
    }
  }


  /* 设置NODE环境 */
  async 'handle-system-path' (event, value) {
    try {
      const reg = new Registry("HKEY_CURRENT_USER\\Environment")
      const winpath = await reg.get('path')
      const redcap = path.dirname(app.getPath("exe"))

      // 获取是否设置
      if (value === 'get' || value === 'GET') {
        return winpath.indexOf(redcap) !== -1
      }

      if (winpath.length === 0) {  //默认没配置path 就直接设置
        await reg.set('path', `${redcap};`)
        return
      }
      if (value) {
        let regx = new RegExp(/;$/)
        if (winpath.indexOf(redcap) < 0) {
          await reg.set('path', winpath + `${regx.test(winpath) ? '' : ';'}${redcap};`)
        }
      } else {
        const rex = winpath.replace(`${redcap};`, '') //.replace(redcap, '')
        await reg.set('path', rex)
      }
    } catch (error) {
      log.verbose("systemPath:error: =>", error)
    }
  }


  // 添加桌面图标
  'set-desktop-icon' (event, arg) {
    writeShortcutLink(arg)
  }



  /* 下载================ */

  // 新文件下载
  async newDownloadFile (event, args) {
    args.path = getStoreSystem().downloadDir  // 设置下载文件地址
    let data = downloadFile.call(this.ctx, args)
    return data
  }

  // 暂停 或者 开始下载
  async pauseOrResume (event, args) {
    return pauseOrResume.call(this.ctx, args)
  }


  // 删除下载项
  async removeDownloadItem (event, appid) {
    return removeDownloadItem.call(this.ctx, appid)
  }

  /* 下载================end */


  // 打开文件位置
  async openFileInFolder (event, path) {
    return openFileInFolder(path)
  }



  /**
   * 压缩包信息获取
   * @param {*} event 事件
   * @param {*} filePath 文件路径
   * @returns  
   */

  async 'handle-upload-applet' (event, filePath) {
    try {
      let admZip = new AdmZip(filePath)
      let zipEntries = admZip.getEntries()
      let packages = {}
      let isAsar = false
      let bufAsar = null
      zipEntries.forEach(function (zipEntry) {
        let entryName = ['.asar']
        let ceExtname = path.extname(zipEntry.entryName)
        if (!zipEntry.isDirectory && entryName.indexOf(ceExtname) !== -1) {
          isAsar = true
        }
      })
      if (isAsar) {
        bufAsar = admZip.getEntry('app.asar')
        let content = getAsarBuffer(bufAsar.getData(), 'package.json')
        packages = new Function('return ' + content)()
        packages.asar = isAsar
      } else {
        let json = admZip.readFile('package.json')
        let pakjs = JSON.parse(json.toString())
        pakjs.asar = false
        packages = pakjs
      }

      if (packages.icon && packages.icon.length !== 0) {
        let iconFile = path.join(packages.icon)
        let icon = isAsar ? getAsarBuffer(bufAsar.getData(), iconFile) : admZip.readFile(iconFile.replace(/\\/ig, '/'))
        let release = path.dirname(filePath)
        let iconPath = path.join(release, 'icon.ico')
        fs.writeFileSync(iconPath, icon)
        packages.iconPath = iconPath
      }
      packages.name = packages.shortcutName || packages.name
      delete packages.dependencies
      delete packages.devDependencies
      return packages
    } catch (error) {
      console.log(error)
      return {
        code: 400,
        msg: `${error}`
      }
    }
  }


  /* 小程序发布 */

  async 'handle-upload-applet-file' (event, formdata) {
    try {
      let data = await httpUploadFile('/store/base/appliedFile', formdata)
      return data
    } catch (error) {
      console.log('upload-applet-file => error:')
      log.verbose("upload-applet-file:error =>", error)
      return {
        code: 500,
        msg: `${error}`
      }
    }
  }



}

module.exports = Plug