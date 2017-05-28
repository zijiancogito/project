// answer.js
var conn = require("../../function/connect.js")
var aesEnc = require("../../crypto/crypto-js.js")
var enc = require("../../function/encAndRand.js")
var msgEnc = require("../../function/msgProc.js")
var answer = ""
var tempList = wx.getStorageSync("friendList")
var tempInfo = {}
Page({
  data: {
  
  },
  onLoad: function (options) {
    if(options.pageFrom == "set"){
      conn.setRecvCallback(this.recvConfirm)
      var trd = wx.getStorageSync("trd_session_key")
      //暂时以InviteCode作为目前好友的唯一标识，并发送给服务器
      tempInfo.invitedCode = options.InviteCode
      var dataSent = {
        tempId: options.InviteCode,
        trd: trd
      }
      var data = enc.sendEncData(dataSent, 4)
      conn.sendMsg(data, this.resolve, this.reject)
    }
    else if(options.pageFrom = "test"){

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
    answer = e.detail.value
    console.log(answer)
  },
  answerSet:function(){
    tempInfo.secret = answer
    tempList.push(tempInfo)
    wx.setStorageSync("friendList", tempList)
    wx.navigateBack({
      delta:2
    })
  }
})