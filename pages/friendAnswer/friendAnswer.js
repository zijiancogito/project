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
var name = ""
var myAvatar = ""
var myname = ""
var mycountry = ""
var mygender = ""
var mycity = ""
var myprovince = ""
var seqStart = 10000000
var seqEnd = 99999999
var seqLen = 20
var app = getApp()
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
    app.getUserInfo(function (userInfo) {
      myname = userInfo.nickName
      myAvatar = userInfo.avatarUrl
      mycountry = userInfo.country
      mygender = userInfo.gender
      mycity = userInfo.city
      myprovince = userInfo.province
    })
    console.log("friendans opt log!!!!!")
    console.log(options)
    hashedAns = options.hashAns
    rand = options.rand
    inviteCode = options.inviteCode
    name = options.name
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
      if(myHashAns == hashedAns){//验证答案是否正确
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
        console.log("success info !!!")
        console.log(data)
        var tempInfo = {
          friendId:inviteCode,
          avatarUrl:"../../image/love.png",
          name:name
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
    console.log("waitReply invoked!")
    console.log("get server reply :!!!!!!!!!!!")
    console.log(recv)
    if(recv.state == 4){
      for (var i = 0; i < tempList.length;i++){
        if (tempList[i].friendId == recv.inviteCode){//验证成功，用inviteCode到服务器上换取对方的真实frindId并更新  
          found = i
          tempList[i].friendId = recv.friendId
          tempList[i].avatarUrl = ""
          var myId = wx.getStorageSync("uniqueId")
          console.log("uniqueId :"+myId)
          tempList[i].secret = aesEnc.MD5(this.data.inputContent.answer).toString()
          tempList[i].sessionId = aesEnc.MD5(myId + tempList[i].secret + recv.friendId).toString()
          console.log("inviterId: ")
          console.log(recv.friendId)
          console.log("reciver id:")
          console.log(myId)
          console.log("secret:")
          console.log(this.data.inputContent.answer)
          console.log(tempList[i].secret)
          tempList[i].seqSent = msgProc.rand(aesEnc.MD5(myId + tempList[i].secret).toString(), seqLen, seqStart, seqEnd)
          tempList[i].seqRecv = msgProc.rand(aesEnc.MD5(recv.friendId + tempList[i].secret).toString(), seqLen,seqStart, seqEnd)
          tempList[i].seqIndex = msgProc.rand(aesEnc.MD5(tempList[i].secret).toString(), seqLen, 0, seqLen)
          tempList[i].seqRecvIndex = 0;
          tempList[i].seqSentIndex = 0;
          tempList[i].message =[];
          var enctext = ""
          var firstContact = {
            name:myname,
            avatarUrl:myAvatar,
            country:mycountry,
            gender:mygender,
            city:mycity,
            province:myprovince,
            text: "天王盖地虎！"
          }
          console.log(JSON.stringify(firstContact))
          var seqObj = msgProc.seqEncrypt(JSON.stringify(firstContact),tempList[i])
          var firstAsk = {
            text: "天王盖地虎！",
            time: new Date().getTime(),
            from:"sent",
            avatarUrl: myAvatar
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
          //匿名性，未完成
          var dataToEnc1 = {
            sessionid: tempList[i].sessionId,
            friendID: tempList[i].friendId//好友长期秘密
          }
          var dataEnc1 = JSON.stringify(enc.sendEncData(dataToEnc1, 3))
          console.log(dataEnc1)
          var dataSent = {
            encTarget: dataEnc1,
            message: enctext
          }
          var encData = enc.sendEncData(dataSent, 3)
          setTimeout(function(){

          },1000)
          connSocket.sendMsg(encData,this.resolve,this.reject)
          console.log("Navigate to " + '../dialog/dialog?sessionId=' + tempList[found].sessionId + "sucess!")
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
    console.log("resolve invoked!")
    console.log(res)
  },
  reject:function(res){
    console.log("reject invoked!")
    console.log(res)
  }
})