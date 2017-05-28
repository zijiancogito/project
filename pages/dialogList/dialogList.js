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
            title:"正在从服务器加载离线消息",
            icon:"loading",
            duration:5000
        });
        setTimeout(function(){
            if(!self.data.msgRecv){
                wx.showToast({
                    title:"获取离线消息失败，请刷新重试",
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
        setTimeout(function(){ 
          var data = enc.sendEncData(dataSent,2)
          connSocket.sendMsg(data,self.resolve,self.reject)
        },1000)
    },
    msgHandler:function(data){
      wx.showToast({
        title: "接收离线消息完毕！",
        icon: "success",
        duration: 3000
      })
        //离线消息暂时用数组传输，视服务器方便而定
        /*
        数组元素格式{
                text: "",
                from: friendID,
                time:send time
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
        else if(recv.state === 1){
            var countLen = 0
            for (var item in recv.log){
              countLen++ 
            }
            var seq = wx.getStorageSync("seq")
            if (seq + 1 != recv.seq){
              console.log("wrong seq at recving offline msg")
              return
            }
            wx.setStorageSync("seq",seq+2)
            for (var i = 0; i < countLen;i++){
              for (var j = 0; j < tempList.length;j++)
                if (tempList[j].sessionId == recv.log[i].sessionId){
                    tempList[i].count++;
                    var contains = aesEnc.AES.decrypt(recv.log[i].text)
                    msgInfo = {
                      text: contains,
                      time: recv.log[i].time,
                      from: "recv"
                    }
                    tempList[i].message = [...tempList[i].message, msgInfo];//更新msg列表（聊天记录）
                    wx.setStorageSync('friendList',tempList)
                    this.setData({
                        list:[...tempList]
                    })
                    break;
                }
            }
        }
        else if(recv.state == 3){
            //接收到在线消息
            for(var i = 0;i<tempList.length;i++){
              if (tempList[i].sessionId == recv.sessionId){
                    var contains = aesEnc.AES.decrypt(recv.log[i].text)
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
    onShareMessage: function () {
      var that = this
      wx.navigateTo({
        url: '../QuestionSet/QuestionSet',
        success:function(res){
           console.log("navigate to question success")
        },
        fail: function (res){
          console.log(res)
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
    resolve:function(data){
        console.log(data)
    },
    reject:function(data){
        console.log(data)
    }
})