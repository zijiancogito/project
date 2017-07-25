var promise = require("../../lib/Promise.js")
var connSocket = require("../../function/connect.js")
var enc = require("../../function/encAndRand.js")
var aesEnc = require("../../crypto/crypto-js.js")
var msgEnc = require("../../function/msgProc.js")
var app = getApp()
Page({
    data:{
        list:[],
        msgRecv:false,
        userInfo:{}
    },
    onLoad:function(){
        console.log("onLoad");
        const self = this
        var fl = wx.getStorageSync('friendList')
        var tempList = []
        connSocket.connect(this.resolve,this.reject)
        app.getUserInfo(function(userInfo){
        //更新数据
            self.setData({
                userInfo:userInfo
            })
        })
        this.setData({
            list:fl
        })
        
        wx.showToast({
            title:"收取消息中...",
            icon:"loading",
            duration:5000
        });
        setTimeout(function(){
            if(!self.data.msgRecv){
                wx.showToast({
                    title:"收取消息失败，请刷新重试",
                    icon:"success",
                    duration:3000
                })
            }
        },4000);
        
        connSocket.setRecvCallback(self.msgHandler)
        var trd = wx.getStorageSync("trd_session_key")
        var seq = wx.getStorageSync("seq")
        var dataSent = {
            trd:trd,
            seq:seq
        }
        wx.setStorageSync("seq",seq++)
        setTimeout(function(){ 
          var data = enc.sendEncData(dataSent,2)
          connSocket.sendMsg(data,self.resolve,self.reject)
        },1000)
    },
    onShow:function(){
      connSocket.setRecvCallback(this.msgHandler)
      console.log("dialoglist onShow")
      connSocket.keepOnlineState()
      //显示时更新好友列表
      var fl = wx.getStorageSync('friendList')
      console.log(fl)
      this.setData({
        list: fl
      })
      console.log(fl)
    },
    msgHandler:function(data){
      wx.showToast({
        title: "接收消息完毕！",
        icon: "success",
        duration: 3000
      })
        console.log("recv msg show !!!!!")
        var recv = JSON.parse(data)
        this.data.msgRecv = true
        var tempList = wx.getStorageSync("friendList")
        console.log(recv.state)
        console.log(recv)
        if (recv.reply != undefined || recv.reply != null){
          wx.setStorageSync('trd_session_key', recv.reply)
          wx.setStorageSync('server_public_key', recv.pubkey)
          wx.setStorageSync("uniqueId", recv.id)
        }
        else if (recv.state == 6) {
          msgEnc.recvInviteReply(recv)
        }
        else if(recv.state === 1){
          //收到离线消息
            var countLen = 0
            for (var item in recv.log){
              countLen++ 
            }
            var seq = wx.getStorageSync("seq")
            if(recv.seq == seq){
              wx.setStorageSync("seq", seq++)
              for (var i = 0; i < countLen; i++) {
                for (var j = 0; j < tempList.length; j++)
                  if (tempList[j].sessionId == recv.log[i].sessionId) {
                    tempList[i].count++;
                    var contains = aesEnc.AES.decrypt(recv.log[i].text)
                    msgInfo = {
                      text: contains,
                      time: recv.log[i].time,
                      from: "recv"
                    }
                    tempList[i].message = [...tempList[i].message, msgInfo];//更新msg列表（聊天记录）
                    wx.setStorageSync('friendList', tempList)
                    this.setData({
                      list: [...tempList]
                    })
                    break;
                  }
              }
            }
            
        }
        else if(recv.state == 3){
            //接收到在线消息
            for(var i = 0;i<tempList.length;i++){
              console.log("online message log!!!")
              console.log(tempList[i])
              console.log(recv)
              if (tempList[i].sessionId == recv.sessionId){
                    var contains = aesEnc.AES.decrypt(recv.log[i].text)
                    console.log("The msg you recv is: ")
                    console.log(contains)
                    var tempData = {
                        text: contains,
                        time: recv.time,
                        from:"recv"
                    }
                    tempList[i].count++;
                    tempList[i].message = [...tempList[i].message,tempData]
                    wx.setStorageSync('friendList', tempList)
                    this.setData({
                        list:[...tempList]
                     })
                    break;
                }
            }
        }
        else{
            console.log("离线消息接收时出现意外state")
        }
    },
    sessionKeyRecv: function (res) {
      var recv = JSON.parse(res)
      console.log(recv.reply)
      wx.setStorageSync('trd_session_key', recv.reply)
      wx.setStorageSync('server_public_key', recv.pubkey)
      wx.setStorageSync("uniqueId", recv.id)
      console.log(recv)

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
    resolve:function(data){
        console.log(data)
    },
    reject:function(data){
        console.log(data)
    }
})