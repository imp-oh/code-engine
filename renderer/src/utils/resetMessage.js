/*
 * @Author: Chen
 * @Email: cnblogco@qq.com
 * @Date: 2021-06-16 15:38:02
 * @LastEditTime: 2021-06-16 15:49:24
 * @Description: ...每位新修改者自己的信息
 */
// import { Message, $notify } from 'element-plus'
import { ElButton, ElSelect, ElMessage, ElNotification } from 'element-plus';



let messageInstance = null;
const resetMessage = (options) => {
  if (messageInstance) {
    messageInstance.close()
  }
  messageInstance = ElMessage(options)
}
  ;
['error', 'success', 'info', 'warning'].forEach(type => {
  resetMessage[type] = (options = '') => {
    if (typeof options === 'string') {
      options = {
        message: options
      }
    }
    options.type = type;
    return resetMessage(options);
  }
});



let notifyInstance = null;
const resetNotify = (options) => {
  if (notifyInstance) {
    notifyInstance.close()
  }
  notifyInstance = ElNotification(options)
};
['error', 'success', 'info', 'warning'].forEach(type => {
  resetNotify[type] = (options = '') => {
    if (typeof options === 'string') {
      options = {
        message: options
      }
    }
    options.type = type;
    return resetNotify(options);
  }
});








export { resetNotify, resetMessage };

