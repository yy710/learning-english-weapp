//import { classicBehavior } from '../classic-beh.js';
//const mMgr = wx.getBackgroundAudioManager();
let audio = wx.createInnerAudioContext();

Component({
  //behaviors: [classicBehavior],
  properties: {
    sentence: {
      type: Object,
      value: {},
      observer: function(newVal, oldVal, changedPath) {
        console.log("sentence newVal: ", newVal);
        if (!newVal) return;

        audio.src = newVal.audio.src;
        audio.startTime = newVal.audio.startTime;
        audio.onTimeUpdate(() => {
          if (audio.currentTime >= newVal.audio.endTime) audio.stop();
        });
        audio.onStop(() => {
          this.setData({
            playing: false
          });
        });

        this.setData({
          st: newVal,
          nodes: st2nodes(newVal)
        });
      }
    },
    rate: {
      type: Array,
      value: {},
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
    recording: false,
    waitRecordingUrl: 'images/record3.png',
    recordingUrl: 'images/record10.gif',
    speakingUrl: "images/speaker-gif-animation2.gif",
    noSpeakingUrl: "images/speaker-gif-animation.png"
  },

  attached: function() {
    //const st = this.data.st;
    //console.log("attached st: ", st);
    //this._recoverPlaying()
    //this._monitorSwitch()
  },

  detached: function() {
    // wx.pauseBackgroundAudio()
  },

  methods: {
    onRecord: function() {
      const r = this.data.recording;
      r?this.setData({recording:false}):this.setData({ recording: true });
    },

    onPlay: function(event) {
      audio.startTime = this.data.st.audio.startTime;
      this.setData({
        playing: audio.paused
      });
      audio.paused ? audio.play() : audio.pause();
    },

    onPlay2: function(){

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