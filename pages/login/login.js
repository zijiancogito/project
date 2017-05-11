//index.js
//获取应用实例
var connWebSocket = require("../../function/connect.js")
var Promise = require("../../lib/Promise.js")
var app = getApp()
var scan = '../scanQRCode/scanQRCode'
var code = '../QRCode/QRCode'
const self = this
var trd_recv_state = 1
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
          setTimeout(function(){
            if(trd_recv_state){
              wx.switchTab({
                url: '../friendList/friendList',
                success: function(res){
                  console.log(res)
                },
                fail: function() {
                  console.log("switch failed")
                }
              })
            }
            else{
              wx.showToast({
                title:"登录超时，请刷新重试",
                duration:3000,
                icon:"loading"
              })
            }
          },3000)
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
    var recv = JSON.parse(res)
    var result = recv.reply
    console.log(result)
    wx.setStorageSync('trd_session_key', result.third)
    trd_recv_state = 1
  },
  onPullDownRefresh:function(){
    var that = this
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
          setTimeout(function(){
            if(trd_recv_state){
              wx.stopPullDownRefresh()
              wx.switchTab({
                url: '../friendList/friendList',
                success: function(res){
                  console.log(res)
                },
                fail: function() {
                  console.log("switch failed")
                }
              })
            }
            else{
              wx.stopPullDownRefresh()
              wx.showToast({
                title:"服务器连接超时,请刷新重试",
                duration:3000,
                icon:"loading"
              })
            }
          },3000)
        }
      })
    }
})
