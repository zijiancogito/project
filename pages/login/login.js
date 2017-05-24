//index.js
//获取应用实例
var rsaEnc = require("../../rsa/cryptico.js")
var aesEnc = require("../../crypto/crypto-js.js")
var connWebSocket = require("../../function/connect.js")
var Promise = require("../../lib/Promise.js")
var app = getApp()
var scan = '../scanQRCode/scanQRCode'
var code = '../QRCode/QRCode'
const self = this
var trd_recv_state = 0
Page({
  data: {
  },
  bindChange:function(e){
    this.data.loginInfo[e.currentTarget.id] = e.detail.value
  },
  onShareAppMessage: function () {
    return {
      title: '自定义转发标题',
      path: '/page/login?id=123',
      success: function(res) {
        
        console.log("show success")
      },
      fail: function(res) {
        // 转发失败
        console.log("show failed")
      }
    }
  },
  onLoad: function () {
    console.log('onLoad')
     //连接服务器
    connWebSocket.connect(this.commonRes,this.commonRej);
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
  },
  commonRes:function(result){
      console.log(result)
  },
  commonRej:function(result){
      console.log(result)
  },
  sessionKeyRecv:function(res){
    var recv = JSON.parse(res)
    console.log(recv.reply)
    wx.setStorageSync('trd_session_key', recv.reply)
    wx.setStorageSync('server_public_key', recv.pubkey)
    wx.setStorageSync('seq', 0)
    trd_recv_state = 1
    var pwd = "123456"
    var data2enc = {
      trd: res.reply,
      seq: 0
    }
    var textEnc = aesEnc.AES.encrypt(JSON.stringify(data2enc),aesk)
    var aeskey = textEnc.key.toString()
    wx.setStorage({
      key: 'aeskey2server',
      data: pwd,
      success:function(){
        console.log("set aeskey successs")
      },
      fail:function(res){
        console.log(res)
      }
    })
    var aesKeyEnc = rsaEnc.cryptico.encrypt(aeskey, wx.getStorageSync("server_public_key"));
    console.log(aesKeyEnc.cipher)
    var dataSent = {
      state:2,
      aeskeyEnc: aesKeyEnc.cipher,
      aesEncText: textEnc
    } 
    connWebSocket.sendMsg(dataSent,commonRes,commonRej)
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
