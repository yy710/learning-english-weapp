//import { classicBehavior } from '../classic-beh.js';
const app = getApp();
const session = app.globalData.session;
let audio = wx.createInnerAudioContext();
const audio2 = wx.createInnerAudioContext();

Component({
  //behaviors: [classicBehavior],
  properties: {
    sentence: {
      type: Object,
      value: {},
      observer: function(newVal, oldVal, changedPath) {
        console.log("sentence newVal: ", newVal);
        if (!newVal) return;
        //set audio to newVal
        audio.src = newVal.audio.src;
        //audio.startTime = newVal.audio.startTime;
        audio.seek(newVal.audio.startTime);
        //sync function
        audio.onTimeUpdate(() => {
          //console.log("audio.currentTime: ", audio.currentTime);
          if (audio.currentTime >= newVal.audio.endTime){
            audio.seek(newVal.audio.startTime);
          }
        });
        audio.onPause(() => this.setData({ playing: false }));
        audio.onEnded(() => {
          //this.setData({ playing: false });
          audio.seek(newVal.audio.startTime);
        });
        audio2.onEnded(()=>{
          const that = this;
          this.setData({ playing2: false });
          wx.showModal({
            title: '提示',
            content: '是否上传音频进行评测打分？',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定');
                that.triggerEvent("newRecord2", that.data.recordFile);
              } else if (res.cancel) {
                console.log('用户点击取消');
              }
            }
          })
        });

        this.setData({
          stImage: newVal.image,
          nodes: st2nodes(newVal)
        });
      }
    },
    rate: {
      type: Array,
      value: [],
      observer: function(newVal, oldVal, changedPath) {
        console.log("rate changed: ", newVal);
        if (newVal === [] || !this.properties.sentence)return;

        let _nodes = [];
        createNodes(this.properties.sentence.text[0], newVal, _nodes);

        this.setData({
          nodes: _nodes
        });
      }
    }
  },

  data: {
    nodes: [],
    playing: false,
    playing2: false,
    showPlaying2: false,
    speakingUrl: "images/speaker-gif-animation2.gif",
    noSpeakingUrl: "images/speaker-gif-animation.png",
    recordFile: null
  },

  attached: function() {

  },

  detached: function() {
    // wx.pauseBackgroundAudio()
  },

  methods: {
    onPlay: function(event) {
      this.setData({ playing: audio.paused });
      audio.paused?audio.play():audio.pause();
    },

    //playing recorded voice
    onPlay2: function(){
      this.setData({ playing2: audio2.paused });
      audio2.paused?audio2.play():audio2.pause();
    },

    newRecord: function(e){
      console.log("newReccord event: ", e.detail);
      this.setData({ showPlaying2: true });
      audio2.src = e.detail;
      //this.triggerEvent("newRecord2", e.detail);
      this.setData({recordFile: e.detail});
    }
  }
});

//evaluations: [ ["is", 50], ["he", 90], ... ]
function createNodes(sentence = '', evaluations = [], results = []) {
  //console.log("sentence: ", sentence);
  if (sentence.length === 0 || evaluations.length === 0) return;

  const word = evaluations.shift();
  const start = sentence.indexOf(word[0]);
  let end = start + word[0].length;

  //console.log("sentence.substring(0, start): ", sentence.substring(0, start));
  if (start !== -1) {
    pushWord(results, [sentence.substring(0, start)]);//处理标点符号
    pushWord(results, word);//处理单词评分
  } else {
    end = 0;
  }

  createNodes(sentence.substring(end), evaluations, results);
}

/**
 * @param arrs: return arrary
 * @param word: array, example: ['who', 60]
 */
function pushWord(arrs, word) {
  //console.log("word: ", word);
  let color = 'pass';
  if (word[1] >= 90) color = 'excellent';
  else if (word[1] < 70) color = 'fail';
  else if (!word[1]) color = 'nomal';

  arrs.push({
    name: 'span',
    attrs: {
      class: color
      //style: 'line-height: 60px; color: black;',
    },
    children: [{
      type: 'text',
      text: word[0]
    }]
  });
  return arrs;
}

function st2nodes(sen) {
  let _nodes = [];
  let text_arr = sen.text[1].split(" ").map(item => [item]);//转多维数组
  createNodes(sen.text[0], text_arr, _nodes);
  return _nodes;
}

function setPalying(obj, bol) {
  return function () {
    obj.setData({ playing: bol });
  };
}