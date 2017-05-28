var conn = require("../../function/connect.js")
var aesEnc = require("../../crypto/crypto-js.js")
var enc = require("../../function/encAndRand.js")
var question = ""
var answer = ""
var tip = ""
var hashAns = ""
var name = ""
var InviteCode = ""
var avatarUrl = ""
var province = ""
var city = ""
var country = ""
var gender = ""
Page({
  data: {
  
  },
  onLoad: function (options) {
    const self = this
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        self.name = userInfo.nickName
        self.avatarUrl = userInfo.avatarUrl
        self.gender = userInfo.gender
        self.province = userInfo.province
        self.city = userInfo.city
        self.country = userInfo.country
        var promise = new Promise(function (resolve, reject) {
          if (self.name != undefined) {
            resolve("get name success");
          } else {
            reject("get name failed");
          }
        });
        promise.then(function (value) {
          console.log(value)
          var rand = enc.random()
          var tempId = rand + self.name
          self.InviteCode = aesEnc.MD5(self.tempId).toString()
        }, function (value) {
          console.log(value)
        });
      }
    }) 
  },
  bindQuestionInput:function(e){
    question = e.detail.value
  },
  bindTipInput:function(e){
    tip = e.detail.value
  },
  onShareAppMessage:function(){
    var rand = enc.random()
    const that = this
    hashAns = aesEnc.SHA256(answer+rand).toString()
    return {
      title: '邀请好友进行秘密通信',
      path: '/page/share/share?question='+question+'&tip='+tip+"&hashAns="+hashAns+'&rand='+rand+"&invitedCode="+InviteCode,
      success: function (res) {
       wx.navigateTo({
         url: '../answer/answer?pageFrom=set&InviteCode=' + that.InviteCode,
         success:function(){
          console.log("navigate to answer success")
         },fail:function(res){
          console.log(res)
         }
       })
      },
      fail: function (res) {
        console.log("share failed")
      }
    }
  },
  resolve: function (data) {
    console.log(data)
  },
  reject: function (data) {
    console.log(data)
  }
})