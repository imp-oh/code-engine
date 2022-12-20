/*
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-06-27 17:27:55
 * @LastEditTime: 2022-02-09 11:03:22
 * @Description: ...每位新修改者自己的信息
 */


const AdmZip = require('adm-zip')
const path = require("path")
const fs = require("fs")
const { dialog, app, ipcMain } = require('electron')
const log = require("electron-log")
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require

const { getAsarBuffer } = require('./ce/index')
const Module = require('module').Module
const old_findPath = Module._findPath

const Env = require('ce-core').Env



/**
 * 解压CodeEngine包
 * @param {*} oldPath 解压包路径
 * @param {*} isStart 默认启动后存储小程序信息
 * @param {*} isOpen  默认启动
 * @param {*} zipPath 小程序路径安装包
 * @param {*} installation 判断是否是安装包启动
 * @returns 
 */
let unzip = async (oldPath, isStart = false, isOpen = false, zipPath = '', installation = false) => {
  try {

    Env('production')
    const { env } = process
    // log.verbose(app.getAppPath())
    // env.CE_NODE_MODULES = path.join(app.getAppPath(), 'node_modules')
    const config = {
      main_node_modules: env.APP_NODE_MODULES,
      resourcesDir: env.APP_RESOURCES_DIR
    }

    env.CE_ENV = 'production'
    env.CE_NODE_MODULES = config.main_node_modules

    let packages = {
      asar: false
    }
    let newPathDir = null
    let isAsar = false
    let admZip = new AdmZip(oldPath, "GBK")
    let asar = null

    let zipEntries = admZip.getEntries() // an array of ZipEntry records
    zipEntries.forEach(function (zipEntry) {
      let entryName = ['.asar']
      let ceExtname = path.extname(zipEntry.entryName)
      if (!zipEntry.isDirectory && entryName.indexOf(ceExtname) !== -1) {
        isAsar = true
      }
    })



    if (isAsar) {
      asar = admZip.getEntry('app.asar')
      let coneten = getAsarBuffer(asar.getData(), 'package.json')
      let packjs = new Function('return ' + coneten)()
      packages = packjs
      packages.asar = isAsar
    } else {
      let json = admZip.readFile('package.json')
      let pakjs = JSON.parse(json.toString())
      pakjs.asar = false
      packages = pakjs
    }

    newPathDir = path.join(env.CE_MODULES, 'CodeEngineModules/applet', packages.appid)


    // admZip.deleteFile('ce.cer') //删除证书文件
    admZip.extractAllTo(newPathDir, true)


    if (packages.icon && packages.icon.length !== 0) {
      // 判断是否存在icon图标
      let iconFile = path.join(packages.icon)
      let icos = packages.asar ? getAsarBuffer(asar.getData(), iconFile) : admZip.readFile(iconFile.replace(/\\/ig, '/'))
      packages.icon = path.join(newPathDir, 'icon.ico')
      fs.writeFileSync(packages.icon, icos)
    }
    // 这里存在问题
    if (!packages.icon) packages.icon = `${config.resourcesDir}\\build\\icons\\icon.ico`

    packages.newName = packages.shortcutName || packages.name
    packages.newPathDir = newPathDir

    let dirpath = path.join(newPathDir, packages.asar ? 'app.asar' : '', packages.main)


    env.CE_APP_DIR = path.join(newPathDir, packages.asar ? 'app.asar' : '') // 如果有打包的是asar 目录为 D:/code/cexxxx/app.asar/
    env.CE_FILE_DIR = newPathDir// 小程序当前目录  D:/code/cexxxx/
    env.APP_HOME_DIR = env.CE_APP_DIR

    Module._findPath = function (request, paths, isMain) {
      paths.push(config.main_node_modules)
      return old_findPath(request, paths, isMain)
    }

    if (!isOpen) requireFunc(dirpath)
    if (!isStart) {
      let DB = require('./utils/db')
      // 数据存储
      let _db = new DB('system/system.db')
      let id = new Date().getTime()
      let all = _db.db.prepare(`SELECT target from c_applet WHERE target='${packages.appid}'`).all()
      if (all.length !== 0) {
        _db.db.prepare(`update c_applet set name='${packages.newName}',icon='${packages.icon}',filepath='${packages.main}',dirname='${packages.newPathDir}',asar='${packages.asar ? 1 : 0}',version = '${packages.version}' WHERE  target='${packages.appid}'`).run()
      } else {
        _db.db.prepare(`INSERT INTO c_applet(id,name,icon,filepath,target,type,dirname,asar,appid,version) VALUES('${id}','${packages.newName}','${packages.icon}','${packages.main}','${packages.appid}','1','${packages.newPathDir}','${packages.asar ? 1 : 0}','${packages.appid}','${packages.version}')`).run()
      }
    }


    return packages
  } catch (error) {
    log.verbose("zip error:", error)
    dialog.showErrorBox('小程序安装包错误', `${error}`)
    process.exit()
  }
}

module.exports = { unzip }
