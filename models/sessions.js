import { _request } from '../utils/http.js';
const log = require('../utils/util.js').log;
import { config } from '../config.js';

class Session {
  constructor() {
    this.sid = '';
    this.userInfo = {};
  }

  /**
   * The function will  be set dynamically 
   */
  request(){ return Promise.reject("session.request no init!"); }

  upload(tempFilePath){
    let that = this;
    console.log("(befor upload)this.sid: ", that.sid);
    return new Promise(function(resolve, reject){
      wx.uploadFile({
        url: `${config.api_blink_url}/upload`,
        filePath: tempFilePath,
        name: 'record',
        header: {
          'method': 'post',
          "Content-Type": "multipart/form-data",
          'accept': 'application/json',
          'sid': that.sid //若有token，此处换上你的token，没有的话省略
        },
        formData: {
          'sentenceId': 1 //其他额外的formdata，可不写
        },
        success: function (res) {
          console.log("upload success: ", res);
          resolve(res);
        },
        fail: function (res) {
          console.log('fail:', res);
          reject(res);
        }
      });
    });
  }

  checkSession() {
    return new Promise((resolve, reject) => {
      wx.checkSession({
        success: () => resolve(true),
        fail: () => resolve(false)
      });
    });
  }

  /**
   * @return sid
   */
  getLocalSid() {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: 'sid',
        success: res => resolve(res.data),
        fail: res => resolve(false)
      })
    });
  }

  login() {
    return wxlogin()
      .then(this.request("/login"))
      .then(log("server reply for login: "))
      .then(res =>{
        if(!res.data.sid)return Promise.reject("server error!");
        wx.setStorageSync('sid', res.data.sid);
        return this.sid = res.data.sid;
      })
      .catch(log('catch error in login method: '));
  }

  start() {
    return Promise.all([this.checkSession(), this.getLocalSid()])
      .then(log('Promise.all() return: '))
      .then(res => {
        if (res[0] === false || res[1] === false) {
          this.request = _request();
          return this.login();
        } else {
          this.request = _request(res[1]);
          return this.sid = res[1];
        }
      })
      .catch(log("catch from start method: "));
  }
}

function wxlogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: resolve,
      fail: reject
    });
  });
}

export { Session };