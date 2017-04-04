//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var friendList = wx.getStorageSync('friendList')||[]        
    wx.setStorageSync('friendList', friendList)
    var initFriend = [            
            {
                avatar:"../../image/cao.png",
                name:"曹颖",
                asume:"1232",
                contact:"12321312",
                message:[{text:"23333",from : "sent"}],
                count:0//未读消息数
            },
            {
                avatar:"../../image/chen.png",
                name:"高德",
                asume:"",
                contact:"",
                message:[],
                count:0
            },]
    wx.setStorageSync('friendList', initFriend)
  },
  
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
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