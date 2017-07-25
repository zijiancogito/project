// answer.js
var conn = require("../../function/connect.js")
var aesEnc = require("../../crypto/crypto-js.js")
var enc = require("../../function/encAndRand.js")
var msgEnc = require("../../function/msgProc.js")
var answer = ""
var tempList = wx.getStorageSync("friendList")
var tempInfo = {}
var InviteCode = ""
var question = ""
var tip = ""
var hashAns = ""
var myname = ""
Page({
  data: {
  
  },
  onLoad: function (options) {
    console.log("answer.js on load")
    conn.connect(this.resolve,this.reject)
    question = options.question
    InviteCode = options.inviteCode
    answer = options.answer
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        myname = userInfo.nickName
      }
    })
    var trd = wx.getStorageSync("trd_session_key")
    //暂时以InviteCode作为目前好友的唯一标识，并发送给服务器
    tempInfo.friendId = options.inviteCode
    var dataSent = {
      inviteCode: options.inviteCode,
      trd: trd
    }
    var data = enc.sendEncData(dataSent, 4)
    var self = this
    setTimeout(function(){
      conn.sendMsg(data, self.resolve,self.reject)
    },2000)
  },
  onShow:function(){
    conn.setRecvCallback(this.recvConfirm)
  },
  onShareAppMessage: function (){
    var rand = enc.random()
    const that = this
    hashAns = aesEnc.SHA256(answer + rand).toString()
    console.log("invite code log :")
    console.log(InviteCode)
    return {
      title: '邀请好友进行秘密通信',
      path: '/pages/login/login?question=' + question + '&tip=' + tip + "&hashAns=" + hashAns + '&rand=' + rand + "&inviteCode=" + InviteCode+"&name="+myname,
      success: function (res) {
        tempInfo.inviteCode = InviteCode
        tempInfo.secret = aesEnc.MD5(answer).toString()
        tempInfo.avatarUrl = "../../image/love.png"
        tempInfo.name = "Waiting for answer..."
        //tempInfo.sessionId = 
        tempList.push(tempInfo)
        wx.setStorageSync("friendList", tempList)
        wx.navigateBack({
          delta: 2
        })
      },
      fail: function (res) {
        console.log("share failed")
      }
    }
  },
  recvConfirm: function (res) {
    var recv = JSON.parse(res)
    if(recv.state == 6){
      msgEnc.recvInviteReply(recv)
    }
  },
  resolve: function (data) {
    console.log(data)
  },
  reject: function (data) {
    console.log(data)
  },
  bindAnswerInput:function(e){
    tip = e.detail.value.tip
    console.log("tip is: "+tip)
  },
})