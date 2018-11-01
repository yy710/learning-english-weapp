class Request {
  constructor(sid = '', url = 'https://www.all2key.cn/learning-english/', method = 'GET') {
    this.url = url;
    this.method = method;
    this.sid = sid;
    //this.action = '';
    //this.data = '';
  }

  send(action) {
    return function(data) {
      return new Promise(function(resolve, reject) {
        //if (sid) data.sid = sid;
        wx.request({
          url: this.url + action,
          data: data,
          method: this.method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          header: {
            'Accept': 'application/json',
            'sid': this.sid
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

let aaa = new Request();

class Session {
  cccc;
  sid;
  userInfo;
  constructor() {
    this.sid = '';
    this.cccc = 4564646;
    this.userInfo = {};
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
    return _login()
      .then(log('login(): '))
      .then(res => console.log(this.sid))
      .catch(log('login(): '));
  }

  start() {
    console.log(this.sid)
    return Promise.all([this.checkSession(), this.getLocalSid()])
      .then(log('user was signed!'))
      .then(res => this.sid = res[1])
      .then(this.login);
  }
}

function log(note = '') {
  return data => {
    console.log(note, data);
    return Promise.resolve(data);
  };
}

function _login() {
  return new Promise((resolve, reject) => {
    /*
    wx.login({
      success: (res) => resolve(res.code),
      fail: reject
    });
    */
    resolve('login ok!');
  });
}

export {
  Session
};