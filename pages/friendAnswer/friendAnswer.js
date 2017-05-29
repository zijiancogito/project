// friendAnswer.js
var aesEnc = require("../../crypto/crypto-js.js")
var hashedAns = ""
var rand = ""
Page({
  data: {
    question:"",
    tip:"",
    times:0,
    inputContent:[],
    inputValue: ''
  },
  onLoad: function (options) {
    hashedAns = options.hashAns
    rand = options.rand
    this.setData({
      question:options.question,
      tip:options.tip,
    })
  },
  bindChange:function(e) {
    this.data.inputContent[e.currentTarget.id] = e.detail.value
    console.log(e.detail.value)
  },
  bindCommit:function(){
    if(this.data.times > 5){
      wx.showToast({
        title: '错误次数到达上线',
      })
    }
    else{
      this.setData({
        inputValue: ''
      })
      var myHashAns = aesEnc.SHA256(this.data.inputContent.answer + rand)
      console.log("my ans hash: "+ myHashAns)
      if(myHashAns == hashedAns){
        wx.showToast({
          title: '好友认证成功，登录后就可以开始聊天啦！',
        })
      }
      else{
        var times = this.data.times
        this.setData({
          times:times + 1
        })
          wx.showToast({
            title: '错误' + times+1 + "次，还有" + 5 - this.data.times+"次回答机会",
          })
      }
    }
  }
})