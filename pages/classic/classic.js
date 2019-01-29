import {log} from '../../utils/util.js';
import {config} from '../../config.js';
import {ClassicModel} from '../../models/classic.js';
import {LikeModel} from '../../models/like.js';
let classicModel = new ClassicModel();
let likeModel = new LikeModel();
const app = getApp();
const session = app.globalData.session;
//console.log("app: ", app);

let pageJson = {
  //页面的初始数据
  data: {
    next: false,
    first: false,
    like: false,
    count: 0,
    sentences: [],
    //music component will error if set to {}
    sIndex: null
  },

  newRecord2: function(e) {
    console.log("newRecord2 event: ", e.detail);
    //上传录音到服务器
    session.upload(e.detail)
      .then(log("upload replay: "))
      // change navi status of next for server rate
      .then()
      .catch(console.log);
  },

  //生命周期函数--监听页面加载
  onLoad: function(options) {
    // 开始会话
    session.start()
      .then(log("session.start(): "))
      //res == session
      .then(this.getLatestSentence)
      .then(log("/get-sentence: "))
      .then(res => {
        this.setData({
          sentence: res.data.sentence,
          first: res.data.sentence.previousId === 0
        });
      })
      .catch(log("session.start catch error: "));
  },

  //get will reading (latest data)
  getLatestSentence: function(session){
    return session.request('/get-sentence')({ action: "latest" });
  },

  getPreviousSentence: function(){

  },

  getNextSentence: function(){

  },

  setNavStatus: function(){

  },

  onPrevious: function(event) {
    console.log(event);
    this.setData({ next: true });
    /*
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
    */
  },

  onNext: function(event) {
    console.log(event);
    this.setData({ next: false });
    /*
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
    */
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
};

Page(pageJson);


/**
 * nav function
 * @s arrary sentences
 * @c int current sentence index
 * @return: array
 */
function nav(s, c){
  let r = [false, false];
  if(s.length > 1){
    if(c > 0)r[0]=true;
    if(c < s.length-1 )r[1]=true
  }
  return r;
}