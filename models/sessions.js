class Session {
  sid;
  userInfo;
  constructor() {
    this.sid = '';
    this.userInfo = {};
    this.start();
  }

  checkSession() {
    return new Promise((resolve, reject) => {
      wx.checkSession({
        success: resolve,
        fail: reject
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
        success: function(res) {
          //if(!res.data)reject();
          resolve(res.data);
        },
        fail: reject
      })
    });
  }

  login() {
    console.log('catch error!');
    //return _login().then(_request('login')()).catch(log);
  }

  start() {
    return Promise.all([this.checkSession(), this.getLocalSid()])
      //.then(log)
      .then(res => this.sid = res[1])
      .catch(log)
      .then(this.login);
  }
}

function log(res) {
  console.log(res);
  return Promise.resolve(res);
}

function _login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => resolve(res.code),
      fail: reject
    })
  });
};

function _request(action) {
  return function(sid = '') {
    return function(data) {
      return new Promise(function(resolve, reject) {
        //if (sid) data.sid = sid;
        wx.request({
          url: 'https://www.all2key.cn/' + action,
          data: data,
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          header: {
            'Accept': 'application/json',
            'sid': sid
          }, // 设置请求的 header
          success: resolve,
          fail: reject,
          complete: function() {
            wx.hideToast();
          }
        });
      });
    };
  };
}

export {
  Session
};