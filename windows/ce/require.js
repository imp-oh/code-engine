/*
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-10-12 14:17:59
 * @LastEditTime: 2021-10-12 14:17:59
 * @Description: ...每位新修改者自己的信息
 */
// eslint-disable-next-line
function getNodeRequire() {
  var __r
  // eslint-disable-next-line
  if (typeof __webpack_require__ !== 'undefined') {
    // eslint-disable-next-line
    __r = ((typeof __non_webpack_require__ !== 'undefined') ? __non_webpack_require__ : undefined)
  } else {
    __r = ((typeof require !== 'undefined') ? require : undefined)
  }
  return __r
}

// eslint-disable-next-line
module.exports = getNodeRequire
