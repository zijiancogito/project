//index.js
//获取应用实例
var connWebSocket = require("../../function/connect.js")
var app = getApp()
var scan = '../scanQRCode/scanQRCode'
var code = '../QRCode/QRCode'
const self = this
Page({
  data: {
    encryptedInfo:{},
    iv :""
  },
  bindChange:function(e){
    this.data.loginInfo[e.currentTarget.id] = e.detail.value
  },
  onLoad: function () {
    console.log('onLoad')
     //连接服务器
    //connWebSocket.connect(this.commonRes,this.commonRej);
    var that = this
    //发送code
    wx.login({
      success: function (res) {
        var dataSent = {
          state:1,
          code:res.code
        }
        connWebSocket.setRecvCallback(that.sessionKeyRecv)
        connWebSocket.sendMsg(dataSent,that.commonRes,that.commonRej)
        }
      })
      wx.checkSession({
        success:function(){
          console.log("you are online")
          wx.switchTab({
            url: '../friendList/friendList',
            success: function(res){
              console.log(res)
            },
            fail: function() {
              console.log("switch failed")
            }
          })
        },
        fail:function(){
          wx.login({
            success: function (res) {
              var dataSent = {
                state:1,
                code:res.code
              }
              connWebSocket.setRecvCallback(that.sessionKeyRecv)
              connWebSocket.sendMsg(dataSent,that.commonRes,that.commonRej)
            },
          })
        }
      })
    //获取加密敏感数据
  },
  commonRes:function(result){
      console.log(result)
  },
  commonRej:function(result){
      console.log(result)
  },
  getEncryptedInfo:function(cb){
    var that = this
    if(this.data.encryptedInfo && this.data.iv){
      typeof cb == "function" && cb()
    }else{
      wx.getUserInfo({
        success: function (res) {
          that.data.encryptedInfo = res.encryptedData
          that.data.iv = res.iv
          typeof cb == "function" && cb()
        }
      })
    }
  },
  sessionKeyRecv:function(res){
    var recv = JSON.parse(data)
    var result = recv.reply
    console.log(result)
  },
  msgHandle:function(data){
        var recv = JSON.parse(data)
        var res = recv.reply
        var secKey = recv.secKey
        if(res == "success"){
            wx.setStorageSync('secKey',secKey)
            wx.switchTab({
              url: '../dialogList/dialogList',
              success: function(res){
                wx.showToast({
                  title:"Hello World!",
                  icon:"success",
                  duration:3000
                })
              },
              fail: function() {
                wx.showToast({
                  title:"Failed to login!",
                  icon:"success",
                  duration:3000
              }),
              console.log("jump to fail" )
          },
        })
      }
      else{
        wx.showToast({
          title:"用户名或密码错误",
          icon:"scuess",
          duration:3000
        })
      }
    }
})
