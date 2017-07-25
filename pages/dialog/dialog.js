var conn = require( "../../function/connect.js")
var rsaEnc = require("../../rsa/cryptico.js")
var enc = require("../../function/encAndRand.js")
var msgEnc = require("../../function/msgProc.js")
var aesEnc = require("../../crypto/crypto-js.js")
var app = getApp()
var tempList = []
var sid = ""
var name = ""
var avatarUrl = ""
var country = ""
var gender = ""
var city = ""
var province = ""
var friendId = ""
var myname = ""
var myAvatar = ""
var mycountry = ""
var mygender = ""
var mycity = ""
var myprovince = ""
Page({
  data:{
    messages:[],
    msgRecv:false,
    inputContent:[],
    inputValue:"",
  },
  onLoad:function(options){
    const self = this;
    conn.connect(self.resolve,self.reject);
    conn.setRecvCallback(this.msgHandler)
    app.getUserInfo(function (userInfo){
      myAvatar  = userInfo.avatarUrl
      myname = userInfo.nickName
      mycountry = userInfo.country
      mygender = userInfo.gender 
      mycity = userInfo.city
      myprovince = userInfo.province
    })
    sid = options.sessionId
    console.log("sid!!!!!!!!!!!!!!!")
    console.log(sid)
    var msg = []
    tempList = wx.getStorageSync('friendList')
    console.log("wtf????!!!!")
    console.log(tempList)
    for(var i = 0; i < tempList.length;i++){
      if(tempList[i].sessionId == sid && tempList[i].message.length != 0){
          tempList[i].count = 0//清空未读消息数
          var avatar = tempList[i].avatarUrl
          wx.setStorageSync('friendList', tempList)
          msg = [...tempList[i].message]
          break;
        }
    }
    self.setData({
      messages:[...msg]//显示消息
    })
  },
  onShow:function(){
    conn.setRecvCallback(this.msgHandler)//切换到当前目录的消息处理机
    console.log("dialog onShow")
    conn.keepOnlineState()
  },
  onUnload:function(){
    // 页面关闭
    wx.showModal({
      title:"是否保留此次会话记录？",
      content:"‘不保留’仅删除本次聊天的记录，之前的记录不会被删除",
      cancelText:"不保留",
      confirmText:"保留",
      success:function(res){
        if(res.confirm){
          console.log("save info :")
          console.log(tempList)
          wx.setStorageSync('friendList', tempList)
        }
        wx.switchTab({
          url: '/pages/dialogList/dialogList',
        })
      },
      fail:function(){
        console.log("选择失败")
        wx.switchTab({
          url: '/pages/dialogList/dialogList',
        })
      }
    })
  },
  gopage:function(url){
      wx.navigateTo({
        url: url,
        success: function(res){
          console.log("navigate to "+ url)
        },
        fail: function() {
          console.log("navigate failed")
        },
      })
  },

  bindChange(e) {
        this.data.inputContent[e.currentTarget.id] = e.detail.value,
        console.log(e.detail.value)
    },

  sendMessage:function(){
      //点击send按钮触发的函数
      console.log("log 0")
      var msgSent = {
        text: this.data.inputContent.message,
        from: 'sent',
        avatarUrl: myAvatar
      }
      this.setData({
        messages: [...this.data.messages, msgSent ]
      })
      
      console.log("log 1");
      this.setData({
          inputValue : ''
      })
      console.log("log 2")
      const _self = this
      var trd = wx.getStorageSync("trd_session_key")
      console.log("log 3 : trd "+trd)
      console.log(_self.data.messages+","+_self.data.messages.length - 1)
      var plaintext = _self.data.messages[_self.data.messages.length - 1].text
      console.log("log 4 : "+ plaintext)
      var friendInfo = {}
      var found = 0
      var enctext = ""
      for(var i = 0;i < tempList.length;i++){
        if(tempList[i].sessionId == sid){
          friendInfo = tempList[i]
          found = i
          break;
        }
      }
      tempList[found].message.push(msgSent)
      friendInfo = tempList[found]
      console.log("log 5 : ")
      console.log(friendInfo)//can't find
      var seqObj = msgEnc.seqEncrypt(plaintext, friendInfo)
      console.log(seqObj)
      if(seqObj.update == 0){
        tempList[found].seqSentIndex = seqObj.index;
        enctext=seqObj.enctext
      }
      else{
        tempList[found].seqSent = seqObj.seqRev;
        tempList[found].seqSentIndex = seqObj.index;
        tempList[found].secret = seqObj.secret;
        tempList[found].seqIndex = seqIndex
        enctext = seqObj.enctext
      }
      friendId = tempList[found].friendId
      console.log(enctext)
      //匿名，未完成
      var dataToEnc1 = {
        sessionid: sid,
        friendID: friendId//好友长期秘密
      }
      var dataEnc1 = JSON.stringify(enc.sendEncData(dataToEnc1,3))
      console.log(dataEnc1)
      var dataSent = {
        encTarget: dataEnc1,
        message: enctext
      }
      wx.setStorageSync("friendList",tempList)//存入缓存
      var encData = enc.sendEncData(dataSent,3)
      conn.sendMsg(encData,this.resolve,this.reject)
  },
  msgHandler:function(data){
    var recv = JSON.parse(data)
    console.log(recv)
    console.log("dialog online msg recv log 1, sessionid: "+recv.sessionid)
    this.data.msgRecv = true
    if (recv.state == 6) {
      msgEnc.recvInviteReply(recv)
    }
    else if(recv.state === 3){
      if (sid == recv.sessionid) {
        var found = 0
        //接收到的是当前会话窗口好友的在线消息
        console.log("接收到的是当前会话窗口好友的在线消息")
        for(var i = 0;i < tempList.length;i++){
          if(tempList[i].sessionId == sid){
            found = i
            console.log("dialog online msg recv log 2,found friend : " + i)
            console.log(tempList[i])
            break;
          }
        }
        var flag = 2
        var temp = tempList[found]
        var plaintext = ""
        var firstContact = ""
        console.log("dialog online msg recv log test1!!!!!!")
        console.log(temp)
        var seqObj = msgEnc.seqDecrypt(recv.text, temp)
        console.log("dialog online msg recv log test2!!!!!!")
        console.log(seqObj)
        if (seqObj.update == 1) {//更新随机序列
          tempList[found].seqRecv = seqObj.seqRev;
          tempList[found].seqRecvIndex = seqObj.index;
          tempList[found].secret = seqObj.secret;
          tempList[found].seqIndex = seqIndex
          plaintext = seqObj.plaintext
        }
        else{
          tempList[found].seqRecvIndex = seqObj.index;
          plaintext = seqObj.plaintext
          console.log("dialog online msg recv log 3,decrypt result : " + plaintext)
        }
        try {
          firstContact = JSON.parse(plaintext)
          if (tempList[found].message.length == 0) {
            flag = 1;
            console.log("dialog online msg recv log 4:firstContact")
          }
          console.log(tempList[found].message.length)
        }
        catch (e) {
          console.log("dialog online msg recv log 5:maybe decrypt failed or Not firstContact")
        }
        if (flag == 1) {
          //这是第一条收到的消息，也就是好友的问候消息,附带好友资料信息
          var enctext = ""
          tempList[found].name = firstContact.name
          tempList[found].avatarUrl = firstContact.avatarUrl
          tempList[found].country = firstContact.country
          tempList[found].gender = firstContact.gender
          tempList[found].city = firstContact.city
          tempList[found].province = firstContact.province
          friendId = tempList[found].friendId
          console.log("dialog online msg recv log 6:get friend info")
          console.log(tempList[found])
          var dataRecv = {
            text: firstContact.text,
            time: recv.time,
            from: 'recv',
            avatarUrl: tempList[found].avatarUrl
          }
          this.setData({
            messages: [...this.data.messages, dataRecv ]
          })
          tempList[found].message.push(dataRecv)
          wx.setNavigationBarTitle({
            title: tempList[found].name
          });
          wx.setStorageSync("friendList", tempList)//保存好友信息
          //收到第一条消息，需要返回自己的个人信息给好友
          var info = {
            name:myname,
            avatarUrl:myAvatar,
            country:mycountry,
            city:mycity,
            province:myprovince,
            gender:mygender,
            text:"宝塔镇河妖！"//第一条问好消息
          }
          var t = new Date().getTime()
          dataRecv = {
            text: "宝塔镇河妖！",
            time: t,
            from: "sent",
            avatarUrl: myAvatar
          }
          this.setData({
            messages: [...this.data.messages, dataRecv]
          })
          tempList[found].message.push(dataRecv)
          var infoExchange = JSON.stringify(info)
          console.log("dialog online msg recv log 7:infoExchange: "+infoExchange)
          console.log(tempList[found])
          var seqObj = msgEnc.seqEncrypt(infoExchange, tempList[found])
          console.log("dialog online msg recv log 8 : ")
          console.log(seqObj)
          if (seqObj.update == 0) {
            tempList[found].seqSentIndex = seqObj.index;
            enctext = seqObj.enctext
          }
          else {
            tempList[found].seqSent = seqObj.seqRev;
            tempList[found].seqSentIndex = seqObj.index;
            tempList[found].secret = seqObj.secret;
            tempList[found].seqIndex = seqIndex
            enctext = seqObj.enctext
          }
          //匿名，未完成
          var dataToEnc1 = {
            sessionid: sid,
            friendID: friendId//好友长期秘密
          }
          var dataEnc1 = JSON.stringify(enc.sendEncData(dataToEnc1, 3))
          console.log(dataEnc1)
          var dataSent = {
            encTarget: dataEnc1,
            message: enctext
          }
          var encData = enc.sendEncData(dataSent, 3)
          console.log("dialog online msg recv log 7:send first msg successfully!")
          wx.setStorageSync("friendList", tempList)//存入缓存
          conn.sendMsg(encData, this.resolve, this.reject)
          flag = 2
        }
        else {
          //这不是第一条发送的消息
          var msg = ""
          try {//可能是第一条接收的消息，需要更新好友信息
            firstContact = JSON.parse(plaintext)
            msg = firstContact.text
            tempList[found].name = firstContact.name
            tempList[found].avatarUrl = firstContact.avatarUrl
            tempList[found].country = firstContact.country
            tempList[found].gender = firstContact.gender
            tempList[found].city = firstContact.city
            tempList[found].province = firstContact.province
            wx.setStorageSync("friendList", tempList)
          }
          catch (e) {//不是第一条接收的消息
            msg = plaintext
            console.log("dialog online msg recv log 5:maybe decrypt failed or Not firstContact")
          }
          var dataRecv = {
            text: msg,
            time: recv.time,
            from: 'recv',
            avatarUrl: tempList[found].avatarUrl
          }
          this.setData({
            messages: [...this.data.messages, dataRecv ]
          })
          tempList[found].message.push(dataRecv)
          console.log("dialog online msg recv log 8:after push not first msg")
          console.log(tempList[found])
        }
      }
      else {
      //收到的是其他好友的在线消息,暂时默认不是第一条消息
        var found = 0
        for (var i = 0; i < tempList.length; i++) {
          if (tempList[i].sessionId == recv.sessionId) {
            found = i
            break;
          }
        }
        var temp = tempList[found]
        var plaintext = ""
        var firstContact = ""
        var seqObj = msgEnc.seqDecrypt(recv.text, temp)
        if (seqObj.update == 1) {
          tempList[found].seqRecv = seqObj.seqRev;
          tempList[found].seqRecvIndex = seqObj.index;
          tempList[found].secret = seqObj.secret;
          tempList[found].seqIndex = seqIndex
          plaintext = seqObj.plaintext
        }
        else {
          tempList[found].seqRecvIndex = seqObj.index;
          plaintext = seqObj.plaintext
        }
        var dataRecv = {
          text: plaintext,
          time: recv.time,
          from: 'recv',
          avatarUrl: tempList[found].avatarUrl
        }
        this.setData({
          messages: [...this.data.messages, dataRecv]
        })
        tempList[found].message.push(dataRecv)
      }
       wx.setStorageSync("friendList",tempList)
    }
    else{
      console.log("dialog消息处理有问题")
    }
  },
  resolve:function(data){
    console.log(data)
  },
  reject:function(data){
    console.log(data)
  },
})