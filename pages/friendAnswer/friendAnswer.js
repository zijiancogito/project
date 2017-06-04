// friendAnswer.js
var aesEnc = require("../../crypto/crypto-js.js")
var connSocket = require("../../function/connect.js")
var msgProc = require("../../function/msgProc.js")
var enc = require("../../function/encAndRand.js")
var hashedAns = ""
var rand = ""
var inviteCode = ""
var tempList = wx.getStorageSync("friendList")
var found = 0
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
        var tempInfo = {
          friendId:inviteCode
        }
        tempList.push(tempInfo)
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
      for (var i = 0; i < tempList.length;i++){
        if (tempList[i].friendId == recv.inviteCode){
          found = i
          tempList[i].friendId = recv.friendId
          tempList[i].avatarUrl = ""
          var myId = wx.getStorageSync("uniqueId")
          tempList[i].secret = this.data.inputContent.answer
          tempList[i].sessionId = aesEnc.MD5(myId + tempList[i].secret + recv.friendId)
          tempList[i].seqSent = msgProc.rand(aesEnc.MD5(myId + tempList[i].secret),20,0,20)
          tempList[i].seqRecv = msgProc.rand(aesEnc.MD5(recv.friendId + tempList[i].secret),20,0,20)
          tempList[i].seqIndex = msgProc.rand(aesEnc.MD5(tempList[i].secret), 20, 0, 20)
          tempList[i].seqRecvIndex = 0;
          tempList[i].seqSentIndex = 0;
          var enctext = ""
          var seqObj = msgProc.seqEncrypt("天王盖地虎！",tempList[i])
          var firstAsk = {
            text: "天王盖地虎！",
            time: new Date().getTime()
          }
          tempList[i].message = []
          tempList[i].message.push(firstAsk)
          if(seqObj.update == 0){
              enctext = seqObj.enctext
              tempList[i].seqSentIndex = seqObj.index
          }
          else{
              tempList[i].seqSentIndex = seqObj.index
              tempList[i].seqSent = seqObj.seqSent
              enctext = seqObj.enctext
              tempList[i].seqIndex = seqObj.indexSeq
              tempList[i].secret = seqObj.secret
          }
          wx.setStorageSync("friendList", tempList)
          var dataSent = {
            sessionid:tempList[i].sessionId,
            messageEnc: enctext,
            friendID:tempList[i].friendId
          }
          var dataEnc = enc.sendEncData(dataSent,3)
          connSocket.sendMsg(dataEnc,this.resolve,this.reject)
          wx.navigateTo({
            url: '../dialog/dialog?sessionId=' + tempList[found].sessionId,
            success:function(){
              console.log(tempList[found])
              console.log("Navigate to " + '../dialog/dialog?sessionId=' + tempList[found].sessionId+"sucess!")
            },
            fail:function(res){
              console.log(res)
            }
          })
        }
        else{
          console.log("InviteId not found!")
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