const path = require('path')
const log = require('electron-log')

const Main = require('./windows/main')
const Development = require('./windows/development')
const Applet = require('./windows/applet')
const { unzip } = require('./windows/pak')

let [exe = '', dev = '', NodeEnv = ''] = process.argv
let isElectron = path.basename(exe) === 'electron.exe'

let exc = ['.CodeEngine', '.codeengine', '.CODEENGINE', '.ce', '.CE']

if (dev === '.' && !isElectron) {
  // 小程序开发模式
  return Development()
} else if (dev.indexOf('-launch_appid=') !== -1 && !isElectron) {
  // 小程序生成环境
  log.verbose('小程序生成环境')
  const [, appid] = dev.split('=')
  return Applet(appid)
} if (dev && exc.includes(path.extname(dev)) && !isElectron) {
  // 小程序安装包
  log.verbose('小程序安装')
  log.verbose(dev)
  return unzip(dev, false, false, '', true)
} else {
  console.log('平台启动')
  new Main()
}

