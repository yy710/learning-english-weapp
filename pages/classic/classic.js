import { log } from '../../utils/util.js';
import { ClassicModel } from '../../models/classic.js'
import { LikeModel } from '../../models/like.js'
let classicModel = new ClassicModel()
let likeModel = new LikeModel()
const baseUrl = "https://www.all2key.cn/"

const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();

/**
 * @fileOverview 演示会话服务和 WebSocket 信道服务的使用方式
 */

let app = getApp();
console.log("app: ", app);

// 显示繁忙提示
var showBusy = text => wx.showToast({
  title: text,
  icon: 'loading',
  duration: 10000
});

// 显示成功提示
var showSuccess = text => wx.showToast({
  title: text,
  icon: 'success'
});

// 显示失败提示
var showModel = (title, content) => {
  wx.hideToast();
  wx.showModal({
    title,
    content: JSON.stringify(content),
    showCancel: false
  });
};

Page({
  /**
   * 页面的初始数据
   */
  data: {
    classic: {
      type: 200,
      image: baseUrl + 'images/001.png',
      url: baseUrl + 'audio/01intoWoods.mp3',
      title: 'Dinosaurs Before Dark'
    },
    latest: true,
    first: false,
    like: false,
    count: 0
  },

  //开始录音
  start: function () {
    const options = {
      duration: 10000, //指定录音的时长，单位 ms
      sampleRate: 16000, //采样率
      numberOfChannels: 1, //录音通道数
      encodeBitRate: 96000, //编码码率
      format: 'mp3', //音频格式，有效值 aac/mp3
      frameSize: 50, //指定帧大小，单位 KB
    };
    recorderManager.start(options);
  },

  //暂停录音
  pause: function () {
    recorderManager.pause();
  },

  //继续录音
  resume: function () {
    recorderManager.resume();
  },

  //停止录音
  stop: function () {
    recorderManager.stop();
  },

  //播放声音
  play: function () {
    innerAudioContext.autoplay = true;
    innerAudioContext.src = this.tempFilePath;
    innerAudioContext.onPlay(() => console.log('开始播放'));
    innerAudioContext.onError((res) => {
      console.log(res.errMsg);
      console.log(res.errCode);
    });
  },

  upload: function(){
    app.globalData.session.upload(this.tempFilePath).then(log("upload replay: ")).catch(console.log);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    recorderManager.onStart(() => {
      console.log('recorder start')
    });
    //错误回调
    recorderManager.onError((res) => {
      console.log(res);
    });
    recorderManager.onPause((res) => {
      console.log('暂停录音')
    });
    recorderManager.onStart(() => {
      console.log('重新开始录音')
    });
    //错误回调
    recorderManager.onError((res) => {
      console.log(res);
    });
    recorderManager.onStop((res) => {
      this.tempFilePath = res.tempFilePath;
      console.log('停止录音', res.tempFilePath);
      //const { tempFilePath } = res;
    });


    //doLogin(app.globalData.qcloud);
    classicModel.getLatest((data) => {
      this._getLikeStatus(data.id, data.type)
      this.setData({
        //classic:data
        classic: {
          type: 300
        }
      })
    })
  },

  onPrevious: function(event) {
    let index = this.data.classic.index
    classicModel.getPrevious(index, (data) => {
      if (data) {
        this._getLikeStatus(data.id, data.type)
        this.setData({
          classic: data,
          latest: classicModel.isLatest(data.index),
          first: classicModel.isFirst(data.index)
        })
      } else {
        console.log('not more classic')
      }
    })
  },

  onNext: function(event) {
    let index = this.data.classic.index
    classicModel.getNext(index, (data) => {
      if (data) {
        this._getLikeStatus(data.id, data.type)
        this.setData({
          classic: data,
          latest: classicModel.isLatest(data.index),
          first: classicModel.isFirst(data.index)
        })
      } else {
        console.log('not more classic')
      }
    })
  },

  onLike: function(event) {
    let like_or_cancel = event.detail.behavior
    likeModel.like(like_or_cancel, this.data.classic.id, this.data.classic.type)
  },

  _getLikeStatus: function(cid, type) {
    likeModel.getClassicLikeStatus(cid, type, (data) => {
      this.setData({
        like: data.like_status,
        count: data.fav_nums
      })
    })
  }
})

/**
 * 点击「登录」按钮，测试登录功能
 */
function doLogin(qcloud) {
  showBusy('正在登录');

  // 登录之前需要调用 qcloud.setLoginUrl() 设置登录地址，不过我们在 app.js 的入口里面已经调用过了，后面就不用再调用了
  qcloud.login({
    success(result) {
      showSuccess('登录成功');
      console.log('登录成功', result);
    },

    fail(error) {
      showModel('登录失败', error);
      console.log('登录失败', error);
    }
  })
}

/**
 * 点击「清除会话」按钮
 */
function clearSession() {
  // 清除保存在 storage 的会话信息
  qcloud.clearSession();
  showSuccess('会话已清除');
}

/**
 * 点击「请求」按钮，测试带会话请求的功能
 */
function doRequest() {
  showBusy('正在请求');

  // qcloud.request() 方法和 wx.request() 方法使用是一致的，不过如果用户已经登录的情况下，会把用户的会话信息带给服务器，服务器可以跟踪用户
  qcloud.request({
    // 要请求的地址
    url: this.data.requestUrl,

    // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
    login: true,

    success(result) {
      showSuccess('请求成功完成');
      console.log('request success', result);
    },

    fail(error) {
      showModel('请求失败', error);
      console.log('request fail', error);
    },

    complete() {
      console.log('request complete');
    }
  })
}