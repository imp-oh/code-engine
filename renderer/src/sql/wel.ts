/*
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-08-18 10:17:26
 * @LastEditTime: 2021-08-18 11:08:19
 * @Description: ...每位新修改者自己的信息
 */


// 已安装的小程序-初始数据
export const list = (_this: any) => {
  return _this.prepare("SELECT * FROM c_applet limit 0,36").all();
}


// 已安装的小程序-重命名
export const rechristen = (_this: any, id: any, name: any) => {
  return _this.prepare("UPDATE c_applet SET name=? WHERE id=?").run([name, id])
}


// 已安装的小程序-删除
export const deleteItem = (_this: any, id: any) => {
  return _this.prepare("DELETE FROM c_applet WHERE id=?").run([id])
}