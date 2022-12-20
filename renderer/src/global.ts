/*
 * @Author: Chen
 * @Email: codeeetop@qq.com
 * @Date: 2021-12-02 13:55:22
 * @LastEditTime: 2022-02-12 12:17:59
 * @Description: ...每位新修改者自己的信息
 */
const { ipcRenderer, dialog } = require("electron")
const path = require('path')


const __dirpath = process.env.INIT_CWD || path.join(__dirname, "../../../");
const __appletDir = process.env.INIT_CWD || path.join(process.execPath, "../../") //文件目录
const __system = () => { } //ipcRenderer.sendSync('get-system')
const config = {
  target: process.env.NODE_ENV === 'production' ? 'https://www.xxxx.top' : 'http://127.0.0.1:3301',
  targetFile: process.env.NODE_ENV === 'production' ? 'https://www.xxxxx.top/api' : 'http://127.0.0.1:3301',
}

let versions = () => { }// ipcRenderer.sendSync('get-versions');

export {
  versions,
  config,
  ipcRenderer,
  path,
  __dirpath,
  __appletDir,
  __system,
  dialog
}