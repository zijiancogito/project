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
var trd_recv_state = 1
Page({
  data: {
  },
  bindChange:function(e){
    this.data.loginInfo[e.currentTarget.id] = e.detail.value
  },
  onLoad: function () {
    //test data
    // var phrase = "1234"
    // var pubkey = rsaEnc.cryptico.generateRSAKey(phrase,2048)
    // var stringPubKey = rsaEnc.cryptico.publicKeyString(pubkey)
    // wx.setStorageSync("server_public_key", stringPubKey)
    // var test = {
    //   reply : 1234,
    //   pubkey: stringPubKey
    // }
    // this.sessionKeyRecv(JSON.stringify(test))
    console.log('onLoad')
    //连接服务器
    connWebSocket.connect(this.commonRes,this.commonRej);
    var that = this
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
