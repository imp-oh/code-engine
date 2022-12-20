
const Database = require("better-sqlite3")
const { ipcMain, app, ipcRenderer } = require("electron")
const fs = require("fs")
const path = require("path")
// const __system = () => ipcRenderer.sendSync('get-system')

const { APP_USER_DATA } = process.env
const systemPath = {
  userDataPath: APP_USER_DATA
}

class DB {
  static Database (sqliteName) {
    this.db = new Database(`${systemPath.userDataPath}/saves/${sqliteName}`)
    return this.db
  }
  constructor (sqliteName) {
    this.db = new Database(`${systemPath.userDataPath}/saves/${sqliteName}`)
  }
  
  /* 获取数据库 */
  getDB () {
    return this.db
  }
}



// class DB {
//   constructor (sqliteName) {
//     new Database(`${systemPath.userDataPath}/saves/${sqliteName}`)
//     // const keys = Object.getOwnPropertyNames(Database.prototype)
//     // for (let key of keys) {
//     //   if (key == 'constructor' || typeof db[key] !== 'function') continue
//     //   this[key] = db[key]
//     // }
//   }
// }


export default DB