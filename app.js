//app.js
var conn = require("/function/connect.js")
var event = require('lib/event.js')
var enc = require("function/encAndRand.js")
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    event(this)
    wx.setStorageSync('logs', logs)
    var friendList = wx.getStorageSync('friendList')||[]        
    wx.setStorageSync('friendList', friendList)
    var initFriend = [{
                avatarUrl:"../../image/cao.png",
                name:"曹颖",
                message:[{text:"23333",from : "sent"}],
                count:0,//未读消息数,
                country:"中国",
                city:"?",
                province:"山西",
                friendId:"",
                sessionId:"123",
                seqIndex: [0, 1, 3, 2, 5, 4, 6, 8, 9, 5, 11, 2, 3, 19, 17, 15, 12, 19, 12, 3],
                seqSent: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
                seqRecv: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
                seqRecvIndex:0,
                seqSentIndex:0
              }, {
              avatarUrl: "../../image/chen.png",
              name: "高德",
              message: [{ text: "233", from: "sent" }],
              count: 0,//未读消息数,
              country: "中国",
              city: "安庆",
              province: "安徽",
              friendId: "",
              sessionId: "234",
              seqIndex: [0,1,3,2,5,4,6,8,9,5,11,2,3,19,17,15,12,19,12,3],
              seqSent: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
              seqRecv: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
              seqRecvIndex: 0,
              seqSentIndex: 0
            }]
    wx.setStorageSync('friendList', initFriend)
  },
  onHide:function(){
    conn.connect(this.resolve, this.reject)
    var trd = wx.getStorageSync("trd_session_key")
    var dataSent = {//发送离线标识
      trd: trd
    }
    var encData = enc.sendEncData(dataSent,8)
    setTimeout(function(){
      conn.sendMsg(encData, this.resolve, this.reject)
    },3000)

  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function (res) {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null
  },
  resolve:function(res){
    console.log(res)
  },
  reject(res){
    console.log(res)
  }
})