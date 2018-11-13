import { config } from './config';
import { Session } from './models/sessions.js';
import { log } from './utils/util.js';

App({
  /**
   * 小程序初始化时执行，我们初始化客户端的登录地址，以支持所有的会话操作
   */
  onLaunch() {
    let session = new Session();
    session.start()
    .then(res =>this.globalData.session = session)
    .then(res =>{ return session.request('/')({ test: '76576576' }); })
    .then(log('onLaunch: '))
    .catch(console.log);
  },

  globalData: { session: {} }
});