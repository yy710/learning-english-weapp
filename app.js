let qcloud = require('./libs/qcloud-weapp-client-sdk/index');
import { config } from './config';
import { Session } from './models/sessions.js';

App({
  /**
   * 小程序初始化时执行，我们初始化客户端的登录地址，以支持所有的会话操作
   */
  onLaunch() {
    //qcloud.setLoginUrl(config.service.loginUrl);
    let session = new Session();
    session.start().then(res=>{
      wx.setStorageSync('sid', session.sid);
      this.globalData.sid = session.sid;
    }).catch(console.log);
  },

  globalData: {
    sid: {}
  }
});