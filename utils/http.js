import { config } from '../config.js';
// config truck function
const _request = __request(config.api_blink_url);

class HTTP {
  constructor() {
    this.baseRestUrl = config.api_blink_url
  }

  //http 请求类, 当noRefech为true时，不做未授权重试机制
  request(params) {
    var that = this
    var url = this.baseRestUrl + params.url;

    if (!params.method) {
      params.method = 'GET';
    }
    wx.request({
      url: url,
      data: params.data,
      method: params.method,
      header: {
        'content-type': 'application/json',
        'appkey': config.appkey
      },
      success: function(res) {
        // 判断以2（2xx)开头的状态码为正确
        // 异常不要返回到回调中，就在request中处理，记录日志并showToast一个统一的错误即可
        var code = res.statusCode.toString();
        var startChar = code.charAt(0);
        if (startChar == '2') {
          params.success && params.success(res.data);
        } else {
          params.error && params.error(res);
        }
      },
      fail: function(err) {
        params.fail && params.fail(err)
      }
    });
  }
};

class Request {
  constructor(url = config.api_blink_url, method = 'GET') {
    this.url = url;
    this.method = method;
    //this.action = '';
    //this.data = '';
  }

  send(action, sid = '') {
    let that = this;
    return function(sendData) {
      return new Promise((resolve, reject) => {
        //if (sid) data.sid = sid;
        wx.request({
          url: that.url + action,
          data: sendData,
          method: that.method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          // 设置请求的 header
          header: {
            'Accept': 'application/json',
            'sid': sid
          },
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

function __request(url) {
  return function(sid = '') {
    return function(action, method = 'GET') {
      return function(data) {
        return new Promise((resolve, reject) => {
          //if (sid) data.sid = sid;
          wx.request({
            url: url + action,
            data: data,
            method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            // 设置请求的 header
            header: {
              'Accept': 'application/json',
              'sid': sid
            },
            success: resolve,
            fail: reject,
            complete: function() {
              wx.hideToast();
            }
          });
        });
      }
    }
  }
}

export {
  HTTP,
  _request
};