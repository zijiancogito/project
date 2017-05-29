// friendAnswer.js
var aesEnc = require("../../crypto/crypto-js.js")
var connSocket = require("../../function/connect.js")
var msgProc = require("../../function/msgProc.js")
var enc = require("../../function/encAndRand.js")
var hashedAns = ""
var rand = ""
var inviteCode = ""
Page({
  data: {
    question:"",
    tip:"",
    times:0,
    inputContent:[],
    inputValue: ''
  },
  onLoad: function (options) {
    connSocket.connect(this.resolve,this.reject)
    hashedAns = options.hashAns
    rand = options.rand
    inviteCode = options.invitedCode
    this.setData({
      question:options.question,
      tip:options.tip,
    })
  },
  bindChange:function(e) {
    this.data.inputContent[e.currentTarget.id] = e.detail.value
  },
  bindCommit:function(){
    if(this.data.times >= 5){
      wx.showToast({
        title: '错误次数到达上限，邀请链接失效',
      })
      var trd = wx.getStorageSync("trd_session_key")
      var data = {
        trd: trd,
        result: 0,
        inviteCode: inviteCode
      }
      var encData = enc.sendEncData(data, 7)
      connSocket.sendMsg(encData, this.resolve, this.reject)
    }
    else{
      this.setData({
        inputValue: ''
      })
      var myHashAns = aesEnc.SHA256(this.data.inputContent.answer + rand)
      if(myHashAns == hashedAns){
        wx.showToast({
          title: '好友认证成功，可以开始聊天啦！',
        })
        connSocket.setRecvCallback(this.waitReply,this.resolve,this.reject)
        var trd = wx.getStorageSync("trd_session_key")
        var data = {
          trd: trd,
          result: 1,
          inviteCode:inviteCode
        }
        var encData = enc.sendEncData(data, 7)
        connSocket.sendMsg(encData,this.resolve,this.reject)
      }
      else{
        var times = this.data.times
        times += 1
        console.log(times)
        this.setData({
          times:times
        })
        wx.showToast({
          title: '错误' + times + "次，还有" + (5-times) +"次回答机会",
        })
      }
    }
  },
  waitReply:function(res){
    var recv = JSON.parse(res)
    if(recv.state == 4){
      var tempList = wx.getStorageSync("friendList")
      for(var i = 0;i < tempList.lengh;i++){
        if (tempList[i].friendId == recv.inviteCode){
          tempList[i].friendId = recv.friendId
          var myId = wx.getStorageSync("uniqueId")
          tempList[i].secret = this.data.inputContent.answer
          tempList[i].sessionId = aesEnc.MD5(myId + tempList[i].secret + recv.friendId)
          tempList[i].seqSent = msgProc.rand(aesEnc.MD5(myId + tempList[i].secret),20,0,20)
          tempList[i].seqRecv = msgProc.rand(aesEnc.MD5(recv.friendId + tempList[i].secret),20,0,20)
          tempList[i].seqIndex = msgProc.rand(aesEnc.MD5(tempList[i].secret), 20, 0, 20)
          tempList[i].seqRecvIndex = 0;
          tempList[i].seqSentIndex = 0;
          var enctext = ""
          var seqObj = msgProc.seqEncrypt(msg,temoList[i])
          if(seqObj.update == 0){
              enctext = seqObj.enctext
              tempList[i].seqSentIndex = seqObj.index
          }
          else{
              tempList[i].seqSentIndex = seqObj.index
              tempList[i].seqSent = seqObj.seqSent
              enctext = seqSent.enctext
              tempList[i].seqIndex = seqSent.indexSeq
              tempList[i].secret = seqSent.secret
          }
          wx.setStorageSync("friendList", tempList)
          var dataSent = {
            sessionId:tempList[i].sessionId,
            messageEnc: enctext,
            friendId:tempList[i].friendId
          }
          var dataEnc = enc.sendEncData(dataSent,3)
          connSocket.sendMsg(dataEnc,this.resolve,this.reject)
        }
      }
    }
  },
  resolve:function(res){
    console.log(res)
  },
  reject:function(res){
    console.log(res)
  }
})