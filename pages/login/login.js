//index.js
//获取应用实例
var enc = require("../../function/encAndRand.js")
var connWebSocket = require("../../function/connect.js")
var Promise = require("../../lib/Promise.js")
var app = getApp()
var scan = '../scanQRCode/scanQRCode'
var code = '../QRCode/QRCode'
var tempId = ""
var trd_recv_state = 0
var isShared = 0
Page({
  data: {
  },
  bindChange:function(e){
    this.data.loginInfo[e.currentTarget.id] = e.detail.value
  },
  onLoad: function (options) {
    console.log(options)
    tempId = options.tempId
    //连接服务器
    connWebSocket.connect(this.resolve,this.reject);
    const that = this
    wx.login({
      success: function (res) {
        if (options.name != undefined) {
          isShared = 1
          var friendSet = {
            name: options.name,
            friendID: options.friendTempID,
            avatarUrl: options.avatarUrl,
            gender: options.gender,
            province: options.province,
            city: options.city,
            country: options.country,
            message: [],
            count: 0
          }
          var tempList = wx.getStorageSync("friendList")
          tempList.push(friendSet)
          wx.setStorageSync("friendList",tempList)
        }
        console.log(wx.getStorageSync("friendList"))
        var dataSent = {
          state: 1,
          code: res.code
        }
        connWebSocket.setRecvCallback(that.sessionKeyRecv)
        connWebSocket.sendMsg(dataSent, that.resolve, that.reject)
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
    wx.setStorageSync('seq', 0)
    trd_recv_state = 1
    if(isShared==1){
      var trd = recv.reply
      var seq = 1
      var initData = {
        trd: trd,
        friendTempID: tempId,
        seq: 1
      }
      wx.setStorageSync("seq", seq)
      var dataSent = enc.sendEncData(initData, 5)
      connWebSocket.setRecvCallback(this.updateFriendID)
      connWebSocket.sendMsg(dataSent, this.resolve, this.reject)
    }
  },
  updateFriendID:function(res){
    var recv = JSON.parse(res)
    if(recv.state == 5){
      var msg = enc.aesDecrypt(recv.secret)
      var seq = wx.getStorageSync("seq")
      if(seq +1  == msg.seq){
        var tempList = wx.getStorageSync("friendList")
        tempList[tempList.length - 1].friendId = msg.friendPermanentId
        wx.setStorageSync("friendList",tempList)
        wx.setStorageSync("seq", seq + 2)
        wx.switchTab({
          url: '../friendList/friendList',
          success:function(){
            console.log("switch1 success")
          },
          fail:function(){
            console.log("switch1 failed")
          }
        })
      }
      console.log("seq wrong at login/updateFriendID")
    }
    else{
      console.log("state wrong at login/updateFriendID")
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
