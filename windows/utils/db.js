
const Database = require("better-sqlite3")
const { ipcMain, app } = require("electron")
const fse = require("fs-extra")
const fs = require("fs")
const path = require("path")
let userDataPath = app.getPath("userData")

// fs.mkdirSync(dir + '\\saves')
// fs.mkdirSync(dir + '\\saves\\system')
// fs.mkdirSync(dir + '\\saves\\db')

class DB {
  constructor (sqliteName) {
    let dir = path.dirname(`${userDataPath}/saves/${sqliteName}`)
    if (!fs.existsSync(dir)) {
      fse.mkdirpSync(dir)
    }
    this.db = new Database(`${userDataPath}/saves/${sqliteName}`)
    this.init()
  }

  getDB () {
    return this.db
  }

  /* 初始数据库表 */
  init () {
    this.db.exec(`PRAGMA foreign_keys = OFF;`)
    this.db.exec(`
    CREATE TABLE IF NOT EXISTS "c_applet" (
    "id"  TEXT NOT NULL,
    "appid"  TEXT NOT NULL,
    "version"  TEXT NOT NULL,
    "asar"  INTEGER DEFAULT 1,  
    "name"  TEXT NOT NULL,
    "icon"  TEXT NOT NULL,
    "filepath"  TEXT NOT NULL,
    "sort"  INTEGER DEFAULT 0,
    "type"  INTEGER NOT NULL DEFAULT 0,
    "time"  TIMESTAMP DEFAULT (datetime('now', 'localtime')),
    "target"  TEXT,
    "dirname"  TEXT
    );
  `)


    this.db.exec(`
  CREATE TABLE IF NOT EXISTS "c_diary" (
    "id" text NOT NULL,
    "time" TIMESTAMP DEFAULT (datetime('now', 'localtime')),
    "content" text,
    PRIMARY KEY ("id")
  )
  `)

    this.db.exec(`CREATE TABLE IF NOT EXISTS "config_sys" (
    "id" text(30) NOT NULL,
    "key" TEXT,
    "value" TEXT,
    "type" TEXT,
    PRIMARY KEY ("id")
  )`)

  }

}


module.exports = DB