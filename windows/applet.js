/*
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-06-29 16:43:33
 * @LastEditTime: 2022-03-02 17:05:47
 * @Description: 小程序正式环境使用
 */


const { dialog, app } = require("electron")
const log = require("electron-log")
const path = require('path')
const Module = require('module').Module
const old_findPath = Module._findPath
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;
const Env = require('ce-core').Env

const applet = async (appid) => {
  log.verbose('appid =>', appid)
  const { env } = process


  env.CE_ENV = 'production'

  let DB = require('./utils/db')
  // 数据存储
  let sqlite = new DB('system/system.db')
  let row = sqlite.db.prepare('SELECT * FROM c_applet WHERE appid = ?').get(appid)

  if (row) {
    let applets = row;
    let isAsar = applets.asar == 1;
    let appPath = path.join(applets.dirname, isAsar ? 'app.asar' : '', applets.filepath)
    env.CE_APP_DIR = path.join(applets.dirname, isAsar ? 'app.asar' : '')  // 如果有打包的是asar 目录为 D:/code/cexxxx/app.asar/
    env.CE_FILE_DIR = applets.dirname // 小程序当前目录  D:/code/cexxxx/
    Env('production')
    env.APP_HOME_DIR = env.CE_APP_DIR


    // 依赖绑定
    Module._findPath = function (request, paths, isMain) {
      if (!paths.includes(env.APP_NODE_MODULES)) paths.push(env.APP_NODE_MODULES)
      return old_findPath(request, paths, isMain)
    }
    requireFunc(appPath)

  } else {
    log.verbose('no Appid:', getApplet)
    dialog.showErrorBox('title', '没有找到小程序');
    app.quit()
  }
}



module.exports = applet



