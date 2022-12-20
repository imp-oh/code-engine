/*
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-07-15 10:26:49
 * @LastEditTime: 2021-12-03 09:28:11
 * @Description: ...每位新修改者自己的信息
 */
// store存储


const Store = require("electron-store")

const store = new Store({
  schema: {},
  // encryptionKey: "CodeEngine"
})


module.exports = store
