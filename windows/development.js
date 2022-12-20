/**
 * 小程序开发启动
 */

const fs = require("fs")
const path = require("path")
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require
const log = require('electron-log')
const Module = require('module').Module
const old_findPath = Module._findPath
const Env = require('ce-core').Env

const development = () => {
  const { env, cwd } = process
  let root = process.cwd()
  env.CE_ENV = 'development'
  env.CE_APP_DIR = root
  env.CE_FILE_DIR = root
  env.APP_HOME_DIR = root
  Env('development')


  const str = fs.readFileSync(root + '\\package.json', 'utf-8')
  const pack = JSON.parse(str)
  const expr = path.join(root, pack.main)

  Module._findPath = function (request, paths, isMain) {
    if (!paths.includes(env.APP_NODE_MODULES)) paths.push(env.APP_NODE_MODULES)
    return old_findPath(request, paths, isMain)
  }

  requireFunc(expr)
}


module.exports = development