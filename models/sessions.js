class Request {
  url;
  method;
  sid;
  constructor(sid = '', url = 'https://www.all2key.cn/learning-english/', method = 'GET') {
    this.url = url;
    this.method = method;
    this.sid = sid;
    //this.action = '';
    //this.data = '';
  }

  send(action) {
    let that = this;
    return function(data) {
      return new Promise((resolve, reject) => {
        //if (sid) data.sid = sid;
        wx.request({
          url: that.url + action,
          data: data,
          method: that.method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          header: {
            'Accept': 'application/json',
            'sid': that.sid
          }, // 设置请求的 header
          success: resolve,
          fail: reject,
          complete: function() {
            wx.hideToast();
          }
        });
      });
    };
  }
}

class Session {
  request;
  sid;
  userInfo;
  constructor() {
    this.sid = '';
    this.request = new Request();
    this.userInfo = {};
  }

  checkSession() {
    return new Promise((resolve, reject) => {
      wx.checkSession({
        success: resolve(true),
        fail: resolve(false)
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
      .then(log('wxlogin() return: '))
      .then(this.request.send("login"))
      .then(res => this.sid = res.data.sid)
      .catch(log('catch error in login method: '));
  }

  start() {
    return Promise.all([this.checkSession(), this.getLocalSid()])
      .then(log('Promise.all() return: '))
      .then(res => {
        if (res[0] === false || res[1] === false) {
          return this.login();
        } else {
          return this.sid = res[1];
        }
      })
      .catch(log("catch from start method: "));
  }
}

function log(note = '') {
  return data => {
    console.log(note, data);
    return Promise.resolve(data);
  };
}

function wxlogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => resolve(res.code),
      fail: reject
    });
    //resolve('login ok!');
  });
}

export {
  Session
};