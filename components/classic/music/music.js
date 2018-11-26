import {
  classicBehavior
} from '../classic-beh.js'

let mMgr = wx.getBackgroundAudioManager()
mMgr.onTimeUpdate(() => {
  //console.log(mMgr.currentTime);
  if (mMgr.currentTime >= 31.5) mMgr.pause();
})

let aaa = [];
createNodes('#$@ was, his, hell;is:100分？', [
  ['was', 10],
  ['his', 99],
  ['hell', 88],
  ['is', 98],
  ['hellow', 9],
  ['100分', 100]
], aaa);
console.log("createNodes: ", aaa);

Component({
  /**
   * 组件的属性列表
   */
  behaviors: [classicBehavior],

  properties: {
    src: String,
    title: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    nodes: aaa,
    _nodes: [{
      name: 'span',
      attrs: {
        class: 'excellent'
        //style: 'line-height: 60px; color: black;',
      },
      children: [{
        type: 'text',
        text: '122345777557'
      }]
    }, {
      name: 'span',
      attrs: {
        class: 'pass'
      },
      children: [{
        type: 'text',
        text: '67565675757'
      }]
    }, {
      name: 'span',
      attrs: {
        class: 'fail'
      },
      children: [{
        type: 'text',
        text: '675kjkjhkjhkjh5757'
      }]
    }],

    playing: false,
    waittingUrl: 'images/player@waitting.png',
    playingUrl: 'images/player@playing.png'
  },

  attached: function() {
    this._recoverPlaying()
    this._monitorSwitch()
  },

  detached: function() {
    // wx.pauseBackgroundAudio()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onPlay: function(event) {
      if (!this.data.playing) {
        this.setData({
          playing: true,
        })
        if (mMgr.src == this.properties.src) {
          mMgr.play()
        } else {
          mMgr.src = this.properties.src
        }
        mMgr.title = this.properties.title
        mMgr.startTime = 21;
      } else {
        this.setData({
          playing: false,
        })
        mMgr.pause()
      }
    },

    _recoverPlaying: function() {
      if (mMgr.paused) {
        this.setData({
          playing: false
        })
        return
      }
      if (mMgr.src == this.properties.src) {
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
})

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

function merge(arrs, results, color = null) {
  //console.log("arrs: ", arrs);
  if (arrs.length === 0) {
    //console.log("results: ", results);
    return;
  }
  const word = arrs.shift();
  if (word[1] >= 90) {
    if (color === 'excellent') {
      let result = results.pop();
      result.children[0].text += word[0];
      results.push(result);
    } else {
      color = 'excellent';
      pushWord(results, word, 'excellent');
    }
  } else if (word[1] >= 70) {
    if (color === 'pass') {
      let result = results.pop();
      result.children[0].text += word[0];
      results.push(result);
    } else {
      color = 'pass';
      pushWord(results, word, 'pass');
    }
  } else {
    if (color === 'fail') {
      let result = results.pop();
      result.children[0].text += word[0];
      results.push(result);
    } else {
      color = 'fail';
      pushWord(results, word, 'fail');
    }
  }
  //console.log("results: ", results);
  merge(arrs, results, color);
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