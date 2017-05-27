var promise = require("../../lib/Promise.js")
var connSocket = require("../../function/connect.js")
var enc = require("../../function/encAndRand.js")
var name = ""
var tempId = ""
var hashedId = ""
var avatarUrl = ""
var province = ""
var city = ""
var country = ""
var gender = ""
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
        for(var i= 0; i < fl.length;i++){
            if(fl[i].message.length != 0){
                tempList = [...tempList,fl[i]]
            }
        }
        this.setData({
            list:tempList
        })
        wx.getUserInfo({
          success: function (res) {
            var userInfo = res.userInfo
            self.name = userInfo.nickName
            self.avatarUrl = userInfo.avatarUrl
            self.gender = userInfo.gender
            self.province = userInfo.province
            self.city = userInfo.city
            self.country = userInfo.country
            var promise = new Promise(function (resolve, reject) {
              if (self.name != undefined) {
                resolve("get name success");
              } else {
                reject("get name failed");
              }
            });
            promise.then(function (value) {
              console.log(value)
              var rand = enc.random()
              self.tempId = rand + self.name
              self.hashedId = aesEnc.MD5(self.tempId).toString()
            }, function (value) {
              console.log(value)
            });
          }
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
        if(recv.state === 1){
            var secretObj = enc.aesDecrypt(recv.secret)
            var countLen = 0
            for(var item in secretObj.log){
              countLen++ 
            }
            var seq = wx.getStorageSync("seq")
            if (seq + 1 != secretObj.seq){
              console.log("wrong seq at recving offline msg")
              return
            }
            wx.setStorageSync("seq",seq+2)
            for (var i = 0; i < countLen;i++){
              for (var j = 0; j < tempList.length;j++)
                if (tempList[j].friendID == secretObj.log[i].from){
                    tempList[i].count++;
                    msgInfo = {
                      text: secretObj.log[i].text,
                      time: secretObj.log[i].time
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
        else if(recv.state === 0){
          var secretObj = enc.aesDecrypt(recv.secret)
          var seq = wx.getStorageSync("seq")
          if (secretObj.seq != seq + 1) {
            console.log("wrong seq at finish recving offline msg")
            return
          }
          wx.showToast({
              title:"接收离线消息完毕！",
              icon:"success",
              duration:3000
          })
          wx.setStorageSync("seq", seq + 2)
        }
        else if(recv.state == 3){
            //接收到在线消息
            var secretObj = enc.aesDecrypt(recv.secret)
            var seq = wx.getStorageSync("seq")
            if (secretObj.seq != seq + 1){
              console.log("wrong seq at recving online msg")
              return
            }
            for(var i = 0;i<tempList.length;i++){
              if (tempList[i].friendID == secretObj.from){
                    var tempData = {
                        text: secretObj.text,
                        time: secretObj.time,
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
          wx.setStorageSync("seq", seq + 2)
        }
        else{
            console.log("离线消息接收时出现意外state")
        }
    },
    onShareAppMessage: function () {
      var that = this
      return {
        title: '邀请好友进行秘密通信',
        path: '/page/share/share?name=' + that.name + "&tempId=" + that.hashedId + "&avatarUrl=" + that.avatarUrl + "&province=" + that.province + "&city=" + that.city + "&country=" + that.country + "&gender" + that.gender,
        success: function (res) {
          console.log("share success")
          conn.setRecvCallback(that.recvConfirm)
          var trd = wx.getStorageSync("trd_session_key")
          console.log("temp id is : "+that.hashedId)
          var dataSent = {
            tempId: that.hashedId,
            trd: trd
          }
          var data = enc.sendEncData(dataSent, 4)
          conn.sendMsg(data, that.resolve, that.reject)
        },
        fail: function (res) {
          console.log("share failed")
        }
      }
    },
    recvConfirm: function (res) {
      var recv = JSON.parse(res)
      var msg = enc.aesDecrypt(recv.secret)
      var seqRecv = msg.seq
      var seq = wx.getStorageSync("seq")
      if (seqRecv == seq + 1) {
        wx.setStorageSync("seq", seq + 2)
      }
      else {
        console.log("seq wrong at page friendList")
      }
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