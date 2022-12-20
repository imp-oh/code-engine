/*
 * @Author: Chen
 * @Email: codeeetop@qq.com
 * @Date: 2021-12-23 16:58:28
 * @LastEditTime: 2022-01-10 16:06:14
 * @Description:  node 文件上传
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const promises_fs = require('fs/promises')
const FormData = require('form-data')
const path = require('path')
const store = require("../store/index")
const is = require("electron-is")
const dev = is.dev()


let cofing = {
  hostname: dev ? '127.0.0.1' : "www.xxxxx.top",
  port: dev ? 3301 : 443

  // hostname: "www.xxxxx.top",
  // port: 443
}


const httpUploadFile = (path, all) => {
  try {
    let userInfo = store.get('users')
    var form = new FormData()
    if (all['iconPath']) {
      try {
        fs.accessSync(all['iconPath'])
        let ico = fs.createReadStream(all['iconPath'])
        form.append('icon', ico)
      } catch (error) {

      }
    }

    fs.accessSync(all['codeenginePath'])
    let file = fs.createReadStream(all['codeenginePath'])
    form.append('file', file)
    for (var i in all) {
      if (i !== 'codeenginePath' || i !== 'iconPath') {
        form.append(`${i}`, `${all[i]}`)
      }
    }
    const options = {
      hostname: cofing.hostname,
      port: cofing.port,
      path: dev ? path : "/api" + path,
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        ...form.getHeaders(),
        'gitce': `${userInfo.codeengine}`
      }
    }


    return new Promise((resolve, reject) => {
      const req = (dev ? http : https).request(options, (res) => {
        res.setEncoding('utf8')
        res.on('data', function (chunk) {
          console.log(chunk)
          let data = new Function(' return ' + chunk)()
          if (data.status === 401) store.set('users', '')
          resolve(data)
        })
        res.on('error', err => {
          reject(err)
        })
      })
      req.on('error', (err) => {
        if (err.errno === -4079) store.set('users', '')
        reject(err)
      })

      // console.log(req)
      form.pipe(req)

    })
  } catch (error) {
    console.log(error)
    return Promise.reject(`no such file or directory,${error.path}`)
  }

}


module.exports = {
  httpUploadFile
}