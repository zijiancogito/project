var name = ""
var tempId = ""
var avatarUrl = ""
var province = ""
var city = ""
var country = ""
var gender = ""
var inviteCode = ""
var question = ""
var tip = ""
var hashAns = ""
var rand = ""
var connSocket = require("../../function/connect.js")
var enc = require("../../function/encAndRand.js")
Page({
  onLoad:function(options){
    const self = this
    name = options.name
    inviteCode = options.inviteCode
    question = options.question
    tip = options.tip
    hashAns = options.hashAns
    rand = options.rand
    console.log("opt log !!!!!!!!!!!!!!:")
    console.log(options)
    setTimeout(function () { }, 10000)
    connSocket.connect(this.resolve,this.reject)
    wx.showModal({
      title: "来自小程序Secret Message的邀请",
      content: '你的好友' + name + "邀请你进行秘密通信，是否同意？",
      showCancel:true,
      cancelText:"拒绝",
      confirmText:"接受邀请",
      success:function(res){
        if(res.confirm){
          wx.navigateTo({
            url: '../friendAnswer/friendAnswer?name='+name+'&question=' + question + "&tip=" + tip + "&hashAns=" + hashAns + '&rand=' + rand + "&inviteCode=" + inviteCode
          })
          console.log("接受邀请")
        }
        else if(res.cancel){
          setTimeout(function(){},10000)
          var data = {
            inviteCode: inviteCode
          }
          var encData = enc.sendEncData(data, 6)
          connSocket.sendMsg(encData, self.resolve, self.reject)
          console.log("拒绝邀请")
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }
      }
    })
  },
  resolve:function(res){
    console.log(res)
  },
  reject:function(res){
    console.log(res)
  }
})