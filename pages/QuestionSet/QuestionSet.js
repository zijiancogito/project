var conn = require("../../function/connect.js")
var aesEnc = require("../../crypto/crypto-js.js")
var enc = require("../../function/encAndRand.js")
var question = ""
var answer = ""
var hashAns = ""
var name = ""
var InviteCode = ""

Page({
  data: {
  
  },
  onLoad: function (options) {
    const self = this
    var rand = enc.random()
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        self.name = userInfo.nickName
      }
    })
    var tempId = rand + self.name
    InviteCode = aesEnc.MD5(self.tempId).toString()
  },
  setFinished:function(){
    if(question == "" || answer == ""){
      wx.showToast({
        title: '问题或答案不能为空',
      })
    }
    else{
      wx.navigateTo({
        url: '../answer/answer?question=' + question + "&answer=" + answer + "&inviteCode=" + InviteCode,
        success: function () {
          console.log("navigate url: " + '../answer/answer?question=' + question + "&answer=" + answer + "&inviteCode=" + InviteCode)
        },
        fali: function (res) {
          console.log(res)
        }
      })
    }
   
  },
  bindQuestionInput:function(e){
    question = e.detail.value
  },
  bindTipInput:function(e){
    answer = e.detail.value
  },
  resolve: function (data) {
    console.log(data)
  },
  reject: function (data) {
    console.log(data)
  }
})