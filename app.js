import { config } from './config';
import { Session } from './models/sessions.js';
import { log } from './utils/util.js';

App({
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