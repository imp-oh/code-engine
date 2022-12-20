const Appliaction = require('ce-core').Appliaction
const Plug = require('./plug-in')
const log = require('electron-log')
const { BrowserWindow, session } = require('electron')
const DB = require('./utils/db')
class Main extends Appliaction {
  constructor () {
    super()
  }

  /**
   * core app have been loaded
   */
  async ready () {
    // do some things
    new DB('system/system.db')
  }

  /**
   * electron app ready
   */
  async electronAppReady () {
    // do some things

  }


  /**
 * main window have been loaded
 */
  async windowReady () {
    // do some things
    // 延迟加载，无白屏
    const winOpt = this.config.BrowserWindow
    if (winOpt.show == false) {
      const win = this.electron.mainWindow
      win.once('ready-to-show', () => {
        win.show()
      })
    }

  }
}

Main.use(Plug)

module.exports = Main




