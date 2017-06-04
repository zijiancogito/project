var conn = require( "../../function/connect.js")
var rsaEnc = require("../../rsa/cryptico.js")
var enc = require("../../function/encAndRand.js")
var msgEnc = require("../../function/msgProc.js")
var aesEnc = require("../../crypto/crypto-js.js")
var app = getApp()
var tempList = ""
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
    app.getUserInfo(function (userInfo){
      myAvatar  = userInfo.avatarUrl
    })
    sid = options.sessionId
    var msg = []
    tempList = wx.getStorageSync('friendList')
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
  onUnload:function(){
    // 页面关闭
    wx.showModal({
      title:"是否保留此次会话记录？",
      content:"‘不保留’仅删除本次聊天的记录，之前的记录不会被删除",
      cancelText:"不保留",
      confirmText:"保留",
      success:function(res){
        if(res.confirm){
          wx.setStorageSync('friendList', tempList)
        }
        console.log("显示成功")
      },
      fail:function(){
        console.log("显示失败")
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
        this.setData({
          messages: [...this.data.messages, {
                  text: this.data.inputContent.message,
                  from: 'sent',
                  avatarUrl:myAvatar
            }]
        })
        this.setData({
            inputValue : ''
        })
        const _self = this
        var trd = wx.getStorageSync("trd_session_key")
        var plaintext = _self.data.messages[_self.data.messages.length - 1].text
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
        var seqObj = msgEnc.seqEncrypt(plaintext, friendInfo)
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
        var dataSent = {
            friendID:friendId,//好友长期秘密
            messageEnc: enctext,
            sessionid: sid
        }
        wx.setStorageSync("friendList",tempList)//存入缓存
        var encData = enc.sendEncData(dataSent,3)
        conn.sendMsg(encData,this.resolve,this.reject)
    },
  msgHandler:function(data){
    //离线消息暂时用数组传输，视服务器方便而定
    /*
    数组元素格式{
              text: "",
              from: 'recv'
           }
    若要传输图片，则格式如下：
          {
              text: 图片的url,
              from: 'recv',
              image:true
          }
    */
    var recv = JSON.parse(data)
    this.data.msgRecv = true
    var tempList = wx.getStorageSync("friendList")
    if (recv.state == 6) {
      msgEnc.recvInviteReply(recv)
    }
    else if(recv.state === 3){
      if (sid == recv.sessionid) {
        var found = 0
        //接收到的是当前会话窗口好友的在线消息
        for(var i = 0;i < tempList.length;i++){
          if(tempList[i].sessionId == sid){
            found = i
            break;
          }
        }
        flag = 2
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
        else{
          tempList[found].seqRecvIndex = seqObj.index;
          plaintext = seqObj.plaintext
        }
        try {
          firstContact = JSON.parse(plaintext)
        }
        catch (e) {
          if(tempList[found].message.length == 1){
            flag = 1;
          }
        }
        if (flag == 1) {
          //这是第一条收到的消息，也就是好友的问候消息,附带好友资料信息
          tempList[found].name = firstContact.name
          tempList[found].avatarUrl = firstContact.avatarUrl
          tempList[found].country = firstContact.country
          tempList[found].gender = firstContact.gender
          tempList[found].city = firstContact.city
          tempList[found].province = firstContact.province
          this.setData({
            messages: [...this.data.messages, {
              text: firstContact.text,
              time: recv.time,
              from: 'recv',
              avatarUrl: tempList[found].avatarUrl
            }]
          })
          wx.setNavigationBarTitle({
            title: tempList[found].name
          });
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
          var t = new Date()
          tempList[found].message.push({
            text: "宝塔镇河妖！",
            time:t.getDate+t.getHours+t.getMinutes+t.getSeconds
          })
          var infoExchange = JSON.stringify(info)
          var seqObj = msgEnc.seqEncrypt(infoExchange, tempList[found])
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
          var dataSent = {
            friendID:friendId,//好友长期秘密
            messageEnc: enctext,
            sessionid: sid
          }
          wx.setStorageSync("friendList", tempList)//存入缓存
          var encData = enc.sendEncData(dataSent, 3)
          conn.sendMsg(encData, this.resolve, this.reject)
        }
        else {
          //这不是第一条消息
          this.setData({
            messages: [...this.data.messages, {
              text: plaintext,
              time: recv.time,
              from: 'recv',
              avatarUrl:tempList[found].avatarUrl
            }]
          })
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
        this.setData({
          messages: [...this.data.messages, {
            text: plaintext,
            time: recv.time,
            from: 'recv',
            avatarUrl:tempList[found].avatarUrl
          }]
        })
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