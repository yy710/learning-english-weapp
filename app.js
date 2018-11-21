import {
  config
} from './config';
import {
  Session
} from './models/sessions.js';
import {
  log
} from './utils/util.js';

App({
  onLaunch() {
    this.globalData.session = new Session();
  },
  globalData: {
    session: null,
    sid: null
  }
});