//import { classicBehavior } from '../classic-beh.js';
const app = getApp();
const session = app.globalData.session;
const audio = wx.createInnerAudioContext();
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
        audio.startTime = newVal.audio.startTime;
        //sync function
        audio.onTimeUpdate(() => {
          console.log("audio.currentTime: ", audio.currentTime);
          if (audio.currentTime >= newVal.audio.endTime) audio.stop();
          else if (audio.currentTime < newVal.audio.startTime) audio.seek(newVal.audio.startTime);// only for iphone bug of startTime invalid
        });
        audio.onStop(()=>this.setData({playing:false}));
        audio.onEnded(()=>this.setData({playing:false}));
        audio2.onEnded(()=>this.setData({playing2:false}));

        this.setData({
          st: newVal,
          nodes: st2nodes(newVal)
        });
      }
    },
    rate: {
      type: Array,
      value: [],
      observer: function(newVal, oldVal, changedPath) {
        console.log("rate changed: ", newVal);
      }
    }
  },

  data: {
    st: {},
    nodes: [],
    playing: false,
    playing2: false,
    showPlaying2: false,
    speakingUrl: "images/speaker-gif-animation2.gif",
    noSpeakingUrl: "images/speaker-gif-animation.png"
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
      this.triggerEvent("newRecord2", e.detail);
    }
  }
});

function createNodes(sentence = '', evaluations = [], results = []) {
  //console.log("sentence: ", sentence);
  if (sentence.length === 0 || evaluations.length === 0) return;

  const word = evaluations.shift();
  const start = sentence.indexOf(word[0]);
  let end = start + word[0].length;

  //console.log("sentence.substring(0, start): ", sentence.substring(0, start));
  if (start !== -1) {
    pushWord(results, [sentence.substring(0, start)]);
    pushWord(results, word);
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
  let text_arr = sen.text[1].split(" ").map(item => [item]);
  createNodes(sen.text[0], text_arr, _nodes);
  return _nodes;
}

function setPalying(obj, bol) {
  return function () {
    obj.setData({ playing: bol });
  };
}