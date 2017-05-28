//app.js
var conn = require("/function/connect.js")
var event = require('lib/event.js')
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
                sessionId:"123"
              }, {
              avatarUrl: "../../image/chen.png",
              name: "高德",
              message: [{ text: "233", from: "sent" }],
              count: 0,//未读消息数,
              country: "中国",
              city: "安庆",
              province: "安徽",
              friendId: "",
              sessionId: "234"
            }]
    // var initFriend = new Array()
    // initFriend["ab1cd"] =            
    //         {
    //             avatarUrl:"../../image/cao.png",
    //             name:"曹颖",
    //             message:[{text:"23333",from : "sent"}],
    //             count:0,//未读消息数,
    //             country:"中国",
    //             city:"?",
    //             province:"山西",
    //             friendId:""
    //         }
    // initFriend["xy123"] = 
    //         {
    //           avatarUrl: "../../image/chen.png",
    //           name: "高德",
    //           message: [{ text: "233", from: "sent" }],
    //           count: 0,//未读消息数,
    //           country: "中国",
    //           city: "安庆",
    //           province: "安徽",
    //           friendId: ""
    //         }
    // for(var key in initFriend){
    //   console.log(initFriend[key])
    // }
    wx.setStorageSync('friendList', initFriend)
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
  }
})