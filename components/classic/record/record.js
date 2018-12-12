const recorderManager = wx.getRecorderManager();

Component({
  properties: {

  },

  data: {
    recording: false,
    waitRecordingUrl: 'images/record3.png',
    recordingUrl: 'images/record10.gif'
  },

  attached: function(){
    recorderManager.onError((res) => {
      console.log(res);
    });
    recorderManager.onPause((res) => {
      console.log('暂停录音')
    });
    recorderManager.onStart(() => {
      console.log('开始录音')
    });
    recorderManager.onStop(res => {
      console.log('停止录音', res.tempFilePath);
      this.triggerEvent("newRecord", res.tempFilePath);
      //上传录音到服务器
      //app.globalData.session.upload(this.tempFilePath).then(log("upload replay: ")).catch(console.log);
    });
  },

  methods: {
    onRecord: function() {
      if (this.data.recording){
        this.setData({ recording: false });
        //停止录音
        recorderManager.stop();
      }else{
        this.setData({ recording: true });
         //开始录音
        const options = {
          duration: 10000, //指定录音的时长，单位 ms
          sampleRate: 16000, //采样率
          numberOfChannels: 1, //录音通道数
          encodeBitRate: 96000, //编码码率
          format: 'mp3', //音频格式，有效值 aac/mp3
          frameSize: 50, //指定帧大小，单位 KB
        };
        recorderManager.start(options);
      }
    }
  }
})