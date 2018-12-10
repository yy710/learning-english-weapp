//import { classicBehavior } from '../classic-beh.js';
const mMgr = wx.getBackgroundAudioManager();
//const mMgr = wx.createInnerAudioContext();

let aaa = [];
createNodes('#$@ was, his, hell;is:100分？', [
  ['was', 10],
  ['his', 99],
  ['hell', 88],
  ['is', 98],
  ['hellow', 9],
  ['100分', 100]
], aaa);
//console.log("createNodes: ", aaa);

Component({
  //behaviors: [classicBehavior],
  properties: {
    sentence:{
      type: Object,
      value: {},
      observer: function (newVal, oldVal, changedPath){
        console.log("sentence newVal: ", newVal);
        if(!newVal)return;
        let _nodes = [];
        createNodes(newVal.text[0], [], _nodes);
        console.log("_nodes: ", _nodes);
        this.setData({ st: newVal, nodes: _nodes });
      }
    },
    rate:{
      type: Array,
      value: {},
      observer: function (newVal, oldVal, changedPath){
        console.log("rate changed: ", newVal);
      }
    }
  },

  data: {
    st: {},
    nodes: [],
    playing: false,
    waittingUrl: 'images/player@waitting.png',
    playingUrl: 'images/player@playing.png'
  },

  attached: function() {
    const st = this.properties.sentence;
    mMgr.onTimeUpdate(() => {
      //console.log(mMgr.currentTime);
      if (mMgr.currentTime >= st.endTime) mMgr.stop();
    })
    this._recoverPlaying()
    this._monitorSwitch()
  },

  detached: function() {
    // wx.pauseBackgroundAudio()
  },

  methods: {
    onRecord: function(){

    },

    onPlay: function(event) {
      const st = this.properties.sentence;
      if(!st)return;
      if (!this.data.playing) {
        this.setData({ playing: true });
        if (mMgr.src == st.audio.src) {
          mMgr.play();
        } else {
          mMgr.src = st.audio.src;
        }
        mMgr.title = st.title;
        mMgr.startTime = st.startTime;
      } else {
        this.setData({ playing: false });
        mMgr.pause();
      }
    },

    _recoverPlaying: function() {
      const st = this.properties.sentence;
      if(!st)return;
      if (mMgr.paused) {
        this.setData({
          playing: false
        })
        return
      }
      if (mMgr.src == st.audio.src) {
        if (!mMgr.paused) {
          this.setData({
            playing: true
          })
        }
      }
    },

    _monitorSwitch: function() {
      mMgr.onPlay(() => {
        this._recoverPlaying()
      })
      mMgr.onPause(() => {
        this._recoverPlaying()
      })
      mMgr.onStop(() => {
          this._recoverPlaying()
        }),
        mMgr.onEnded(() => {
          this._recoverPlaying()
        })
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
  if(start !== -1){
    pushWord(results, [sentence.substring(0, start)]);
    pushWord(results, word);
  }else{
    end = 0;
  }

  createNodes(sentence.substring(end), evaluations, results);
}

function pushWord(arrs, word) {
  console.log("word: ", word);
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