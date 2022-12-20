/*
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-07-15 09:25:41
 * @LastEditTime: 2022-02-28 13:15:04
 * @Description: ...每位新修改者自己的信息
 */

const fs = require("fs")
const path = require("path")
const { v4: uuidV4 } = require("uuid")
const { app, shell, dialog } = require("electron")
const DB = require('../utils/db')
// const { initApplet } = require("../api/init")
// const { getFileBuffer, splitPath } = require("../ce/index")
const log = require("electron-log")
const store = require("../store/index")
const { unzip } = require('../pak')

/**
 * 获取文件后缀名
 * @param fileName - 文件名
 */
const getFileExt = (fileName) => path.extname(fileName)



/**
 * 获取文件名
 * @param fileName - 文件名
 * @param defaultName - 默认文件名
 */
const getFileName = (fileName = '', defaultName) => {
  // 处理 Windows 文件名不允许的字符
  fileName = fileName.replace(/(\/|\|?:|\?|\*|"|>|<|\|)/g, '') || path.basename(defaultName)

  fileName = /^\.(.*)/.test(fileName) ? defaultName : fileName

  const extName = getFileExt(fileName)
  if (!extName) {
    const ext = getFileExt(defaultName)
    fileName = `${fileName}${ext}`
  }
  return decodeURIComponent(fileName)
}


/**
 * 拼接路径
 * @param p - 路径
 */
const pathJoin = (...p) => path.join(...p)



/**
 * 检查文件是否存在
 * @param path - 文件路径
 */
const isExistFile = (path = '') => fs.existsSync(path)



/**
 * 打开文件
 * @param path - 文件路径
 */
const openFile = (dirName, filePath, appid, target) => {
  let _path = path.join(dirName, filePath)
  if ((path.extname(_path) === '.json') && !isExistFile(_path)) return false
  if (!appid) return shell.openPath(_path)
  const { env } = process
  if (env.CE_ENV) {
    processSpawn('D:\\Code\\ce\\CodeEngine\\CodeEngine.exe', appid)
  } else {
    processSpawn(app.getPath("exe"), appid)
  }
  return true
}

/**
 * 二进制打开
 * http://nodejs.cn/api/child_process.html#child_process_child_process_spawn_command_args_options
 */
const processSpawn = (pathExe, target) => {
  try {
    var spawn = require('child_process').spawn
    spawn(pathExe, [`-launch_appid=${target}`])
  } catch (error) {
    console.log(error)
    shell.openPath(pathExe)
  }
}


/**
 *  创建快捷lnk
 */
const writeShortcutLink = (arg) => {
  let exe = arg.type === 1 ? app.getPath("exe") : arg.filepath
  let options = {
    target: exe,
    args: `-launch_appid=${arg.target}`,
    icon: arg.icon,
    iconIndex: 0,
    description: "ce 小程序"
  }
  if (arg.type === 0) {
    delete options.icon
    delete options.iconIndex
  }
  shell.writeShortcutLink(
    `${app.getPath("desktop")}\\${arg.name}.lnk`, // 快捷方式
    'create',
    options
  )
}


/**
 * 打开文件所在位置
 * @param path - 文件路径
 */
const openFileInFolder = (path = '') => {
  if (!isExistFile(path)) return false
  shell.showItemInFolder(path)
  return true
}



/**
 * 删除指定路径文件
 * @param path - 文件路径
 */
const removeFile = (path = '') => {
  if (!isExistFile(path)) return
  try {
    fs.rmSync(path, {
      recursive: true
    })
  } catch (error) {
    console.log('removeFile:', error)
  }

}


/**
 * 获取 base64 图片字节
 * @param base64 - base64 字符串
 */
const getBase64Bytes = (base64 = '') => {
  if (!/^data:.*;base64/.test(base64)) return 0

  const data = base64.split(',')[1].split('=')[0]
  const { length } = data

  return Math.floor(length - (length / 8) * 2)
}



/**
 * 获取文件图标。
 * 系统关联图标
 * @param path - 文件路径
 */
const getFileIcon = async (path = '') => {
  const { env } = process
  const iconDefault = `${env.CE_HOME}\\build\\icons\\icon.png`
  if (!path) Promise.resolve(iconDefault)

  const icon = await app.getFileIcon(path, {
    size: 'normal',
  })
  return icon.toDataURL()
}


// 读取package.json
const getPackage = (ph) => {
  try {
    const content = fs.readFileSync(ph)
    return JSON.parse(content)
  } catch (error) {
    return { code: 404 }
  }
}


// 获取文件目录
// const getSplitPath = (_filePath) => {
//   const [isAsar, asarPath, filePath] = splitPath(_filePath)
// }




/**
 * 复制目录    
 * @param {*} src  文件路径
 * @param {*} dest 文件目标路径
 * @returns 
 */
const CopyDirectory = (src, dest) => {
  if (fs.existsSync(dest) == false) {
    fs.mkdirSync(dest)
  }
  if (fs.existsSync(src) == false) {
    return false
  }
  // 拷贝新的内容进去
  var dirs = fs.readdirSync(src)
  dirs.forEach(function (item) {
    var item_path = path.join(src, item)
    var temp = fs.statSync(item_path)
    if (temp.isFile()) { // 是文件
      fs.copyFileSync(item_path, path.join(dest, item))
    } else if (temp.isDirectory()) { // 是目录
      CopyDirectory(item_path, path.join(dest, item))
    }
  })
}

// // 文件夹删除
// function DeleteDirectory(dir) {
//   try {
//     if (fs.existsSync(dir) == true) {
//       var files = fs.readdirSync(dir);
//       files.forEach(function(item) {
//         var item_path = path.join(dir, item);
//         if (fs.statSync(item_path).isDirectory() && path.extname(item_path) !== '.asar') {
//           DeleteDirectory(item_path);
//         } else {
//           fs.unlinkSync(item_path); //删除文件
//         }
//       });
//       fs.rmdirSync(dir); // 删除目录
//     }
//   } catch (error) {
//     console.log(error)
//   }
// }

/**
 * 打开选择文件对话框
 */
const openDialogLnk = async (options, all) => {
  try {
    const result = await dialog.showOpenDialog(options)
    return unzipCodeEngine(result, all)
  } catch (error) {
    console.log(error)
    log.verbose('error:', error)
    console.log("错误了-----------")
    return error
  }
}

/**
 *  小程序更新
 * @param {*} result 
 * @param {*} options 
 * @returns 
 */
const unzipCodeEngine = async (result = {}, options) => {
  const { env } = process
  try {
    let packages = {
      asar: false
    }
    const _db = new DB(options.sqlite)

    if (!result.canceled) {
      let filepath = result.filePaths[0]
      let extname = path.extname(filepath)
      let basename = path.basename(filepath, extname)
      let dirname = path.dirname(filepath)
      let type = 1

      let exc = ['.asar', '.json']
      if (exc.indexOf(extname) !== -1) {
        let asar = false
        if (extname === '.asar') asar = true

        packages = __require(asar ? path.join(filepath, 'package.json') : filepath)
        packages.asar = asar


        if (packages.icon && packages.icon.length !== 0) {
          let newicon = path.join(dirname, 'icon.ico')
          // ico 写入
          if (packages.asar) fs.writeFileSync(newicon, fs.readFileSync(path.join(dirname, 'app.asar', packages.icon)))
          packages.icon = newicon
        } else {
          packages.icon = `${env.CE_HOME}\\build\\icons\\icon.png`
        }

      } else if (extname === '.exe') {
        // 判断 .exe 程序
        packages.name = basename
        type = 0
        packages.icon = await getFileIcon(filepath)
        packages.main = basename + extname
        packages.appid = ''
        packages.version = ''
        packages.shortcutName = ''
      }
      packages.newPathDir = dirname

      if (extname === '.codeengine') {
        packages = await unzip(filepath, true, true, options.path)
      }
      packages.newName = packages.shortcutName || packages.name
      if (!packages.appid && extname === '.json') packages.appid = options.id
      let all = _db.db.prepare(`SELECT id from c_applet WHERE appid='${packages.appid}' AND appid != ''`).all()
      if (all.length !== 0) {
        _db.db.prepare(`update c_applet set name='${packages.newName}',icon='${packages.icon}',filepath='${packages.main}',dirname='${packages.newPathDir}',asar='${packages.asar ? 1 : 0}',version='${packages.version}' WHERE  target='${packages.appid}'`).run()
      } else {

        _db.db.prepare(`INSERT INTO c_applet(id,name,icon,filepath,target,type,dirname,asar,appid,version)
             VALUES(
               '${options.id}',
               '${packages.newName}',
               '${packages.icon}',
               '${packages.main}',
               '${packages.appid}',
               '${type}',
               '${packages.newPathDir}',
               '${packages.asar ? 1 : 0}',
               '${packages.appid}',
               '${packages.version}'
               )`).run()
      }
      const res = _db.db.prepare(`SELECT filepath,dirname,target,asar,appid,version FROM c_applet WHERE type = 1`).all()
      store.set('applet', res)

      return {
        appid: packages.appid,
        name: packages.newName,
        icon: packages.icon,
        filepath: packages.main,
        editType: 0,
        target: packages.appid,
        dirname: packages.newPathDir,
        type
      }
    }
    return { canceled: result.canceled }
  } catch (error) {
    console.log(error)
    log.verbose('unzipCodeEngine:', error)

  }
}



module.exports = {
  CopyDirectory,
  getFileName,
  pathJoin,
  isExistFile,
  openFile,
  openFileInFolder,
  removeFile,
  uuidV4,
  getBase64Bytes,
  getFileIcon,
  openDialogLnk,
  writeShortcutLink,
  unzipCodeEngine
}