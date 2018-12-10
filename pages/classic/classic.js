import {log} from '../../utils/util.js';
import {config} from '../../config.js';
import {ClassicModel} from '../../models/classic.js';
import {LikeModel} from '../../models/like.js';
let classicModel = new ClassicModel();
let likeModel = new LikeModel();
const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();
const app = getApp();
const session = app.globalData.session;
//console.log("app: ", app);

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
recorderManager.onStop(res => {
  this.tempFilePath = res.tempFilePath;
  console.log('停止录音', res.tempFilePath);
  //const { tempFilePath } = res;
});

let pageJson = {
  //页面的初始数据
  data: {
    classic: {
      type: 200,
      image: config.api_blink_url + '/images/001.png',
      url: config.api_blink_url + '/audio/01intoWoods.mp3',
      title: 'Dinosaurs Before Dark'
    },
    latest: true,
    first: false,
    like: false,
    count: 0,
    sentences: []
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
  //播放录音
  play: function () {
    innerAudioContext.autoplay = true;
    innerAudioContext.src = this.tempFilePath;
    innerAudioContext.onPlay(() => console.log('开始播放'));
    innerAudioContext.onError((res) => {
      console.log(res.errMsg);
      console.log(res.errCode);
    });
  },
  //上传录音到服务器
  upload: function () {
    app.globalData.session.upload(this.tempFilePath).then(log("upload replay: ")).catch(console.log);
  },
  //生命周期函数--监听页面加载
  onLoad: function (options) {
    // 开始会话
    session.start()
      .then(res => {
        session.sid = res;
        return session.request('/get-sentence')()
          .then(log("get-sentence: "))
          .then(res => this.setData({
            sentences: res.data
          }))
      })
      .catch(log("session.start catch error: "));

    classicModel.getLatest(data => {
      this._getLikeStatus(data.id, data.type);
      this.setData({ classic: { type: 300 } });
    });
  },

  onPrevious: function (event) {
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

  onNext: function (event) {
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

  onLike: function (event) {
    let like_or_cancel = event.detail.behavior;
    likeModel.like(like_or_cancel, this.data.classic.id, this.data.classic.type);
  },

  _getLikeStatus: function (cid, type) {
    likeModel.getClassicLikeStatus(cid, type, data => {
      this.setData({ like: data.like_status, count: data.fav_nums });
    })
  }
};

Page(pageJson);