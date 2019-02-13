import {
  log
} from '../../utils/util.js';
import {
  config
} from '../../config.js';
import {
  ClassicModel
} from '../../models/classic.js';
import {
  LikeModel
} from '../../models/like.js';
let classicModel = new ClassicModel();
let likeModel = new LikeModel();
const app = getApp();
const session = app.globalData.session;

Page({
  //页面的初始数据
  data: {
    next: false,
    first: false,
    like: false,
    count: 0,
    //music component will error if set to {}
    sentence: null,
    rate: []
  },

  newRecord2: function(e) {
    console.log("newRecord2 event: ", e.detail);
    //上传录音到服务器
    session.upload(e.detail)
      .then(log("upload replay: "))
      // change navi status of next for server rate
      .then(res => {
        const _res = JSON.parse(res.data);
        this.setData({
          rate: _res.rate,
          next: _res.next
        });
      })
      .catch(console.log);
  },

  //生命周期函数--监听页面加载
  onLoad: function(options) {
    // 开始会话
    session.start()
      .then(log("session.start(): "))
      //res == session object
      .then(this.getLatestSentence)
      .then(log("/get-sentence: "))
      .then(this.setNavStatus)
      .then(log("setNavStatus: "))
      .catch(log("session.start catch error: "));
  },

  //get will reading (latest data)
  getLatestSentence: function(session) {
    return session.request('/get-latest-sentence')({});
  },

  getPreviousSentence: function() {
    return session.request('/get-previous-sentence')({
      id: this.data.sentence.id
    });
  },

  getNextSentence: function() {
    return session.request('/get-next-sentence')({
      id: this.data.sentence.id
    });
  },

  //It is needed because has a flag of status in the data structor of returns
  setNavStatus: function(res) {
    return setData(this, {
      sentence: res.data.sentence,
      //if first == true then left arrow will change to grey
      first: !res.data.previous,
      //if next == false then right arrow will change to grey 
      next: res.data.next
    });
  },

  onPrevious: function(event) {
    //console.log(event);
    this.getPreviousSentence()
      .then(log("getPreviousSentence(): "))
      .then(this.setNavStatus)
      .catch(log("error: "));
  },

  onNext: function(event) {
    //console.log(event);
    this.getNextSentence()
      .then(log("getNextSentence(): "))
      .then(this.setNavStatus)
      .catch(log("error: "));
  },

  onLike: function(event) {
    let like_or_cancel = event.detail.behavior;
    likeModel.like(like_or_cancel, this.data.classic.id, this.data.classic.type);
  },

  _getLikeStatus: function(cid, type) {
    likeModel.getClassicLikeStatus(cid, type, data => {
      this.setData({
        like: data.like_status,
        count: data.fav_nums
      });
    })
  }
})

/**
 * nav function
 * @s arrary sentences
 * @c int current sentence index
 * @return: array
 */
function nav(s, c) {
  let r = [false, false];
  if (s.length > 1) {
    if (c > 0) r[0] = true;
    if (c < s.length - 1) r[1] = true
  }
  return r;
}

//package this.setData function to Promise
function setData(that, obj) {
  return new Promise(function(resolve, reject) {
    that.setData(obj, function() {
      resolve("setData ok!");
    });
  });
}