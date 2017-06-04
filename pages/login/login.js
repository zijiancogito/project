//index.js
//获取应用实例
var enc = require("../../function/encAndRand.js")
var connWebSocket = require("../../function/connect.js")
var Promise = require("../../lib/Promise.js")
var app = getApp()
var scan = '../scanQRCode/scanQRCode'
var code = '../QRCode/QRCode'
var trd_recv_state = 0
var isShared = 0
var question = ""
var tip = ""
var hashAns = ""
var rand = ""
var inviteCode = ""
Page({
  data: {
  },
  bindChange:function(e){
    this.data.loginInfo[e.currentTarget.id] = e.detail.value
  },
  onLoad: function (options){
    console.log(options)
    //连接服务器
    connWebSocket.connect(this.resolve,this.reject);
    const that = this
    wx.login({
      success: function (res) {
        if (options.question != undefined){
          isShared = 1
          inviteCode = options.InvitedCode
          console.log("shared friend ! inviteCode = "+inviteCode)
          question = options.question
          tip = options.tip
          rand = options.rand
          hashAns = options.hashAns
          var name = options.name
          var tempList = wx.getStorageSync("friendList")
          var newFriend = {
            friendId: options.InvitedCode,
            name: name
          }
          tempList.push(newFriend)
          wx.setStorageSync("friendList",tempList)
        }
        console.log(wx.getStorageSync("friendList"))
        var dataSent = {
          state: 1,
          code: res.code
        }
        connWebSocket.setRecvCallback(that.sessionKeyRecv)
        setTimeout(function(){
          connWebSocket.sendMsg(dataSent, that.resolve, that.reject)
        },1000)
        
        if (isShared != 1) {//用户不是被邀请的
          console.log("非邀请用户")
          wx.checkSession({
            success: function () {
              console.log("check session success")
              setTimeout(function () {
                if (trd_recv_state) {
                  wx.switchTab({
                    url: '../dialogList/dialogList',
                    success: function (res) {
                      console.log(res)
                    },
                    fail: function () {
                      console.log("switch failed")
                    }
                  })
                }
                else {
                  wx.showToast({
                    title: "登录超时，请刷新重试",
                    duration: 3000,
                    icon: "loading"
                  })
                }
              }, 3000)
            },
            fail: function () {
              wx.login({
                success: function (res) {
                  var dataSent = {
                    state: 1,
                    code: res.code
                  }
                  connWebSocket.setRecvCallback(that.sessionKeyRecv)
                  connWebSocket.sendMsg(dataSent, that.resolve, that.reject)
                },
              })
            }
          })
        }
      },
      fail:function(){
        console.log("login failed")
      }
    })
  },
  resolve:function(result){
      console.log(result)
  },
  reject:function(result){
      console.log(result)
  },
  sessionKeyRecv:function(res){
    var recv = JSON.parse(res)
    console.log(recv.reply)
    wx.setStorageSync('trd_session_key', recv.reply)
    wx.setStorageSync('server_public_key', recv.pubkey)
    wx.setStorageSync("uniqueId",recv.id)
    wx.setStorageSync('seq', 0)
    trd_recv_state = 1
    console.log(inviteCode)
    if(isShared==1){
      wx.navigateTo({
        url: '../share/share?question=' + question + '&tip=' + tip + "&hashAns=" + hashAns + '&rand=' + rand + "&inviteCode=" + inviteCode,
      })
     }
  },
  onPullDownRefresh:function(){
    wx.showToast({
      title: '刷新中',
      icon:"loading",
      duration:3000
    })
    //connWebSocket.connect(this.resolve,this.reject)
    const that = this

    wx.login({
      success: function (res) {
        var dataSent = {
          state:1,
          code:res.code
        }
        connWebSocket.setRecvCallback(that.sessionKeyRecv)
        connWebSocket.sendMsg(dataSent,that.resolve,that.reject)
        }
    })
    wx.checkSession({
        success:function(){
          console.log("you are online")
          setTimeout(function(){
            if(trd_recv_state){
              if (isShared == 1) {
                wx.navigateTo({
                  url: '../share/share?question=' + question + '&tip=' + tip + "&hashAns=" + hashAns + '&rand=' + rand + "&inviteCode=" + inviteCode,
                })
              }
              else{
                wx.switchTab({
                  url: '../dialogList/dialogList',
                  success: function (res) {
                    console.log(res)
                  },
                  fail: function () {
                    console.log("switch failed")
                  }
                })
              }
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
          wx.stopPullDownRefresh()
        }
      })
    }
})
