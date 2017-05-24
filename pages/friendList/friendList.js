// pages/friendList/friendList.j
var conn = require("../../function/connect.js")
var rsaEnc = require("../../rsa/cryptico.js")
var aesEnc = require("../../crypto/crypto-js.js")
var app = getApp()
var name = ""
var tempId = ""
var hashedId = ""

Page({
  data:{
    temp :[],
  },
  onLoad:function(options){
    const self = this
    this.setData({
      temp:wx.getStorageSync('friendList')
    })
    wx.showShareMenu({
      withShareTicket:true
    })
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        console.log(userInfo.nickName)
        self.name = userInfo.nickName
        var promise = new Promise(function (resolve, reject) {
          if (self.name != undefined) {
            resolve("get name success");
          } else {
            reject("get name failed");
          }
        });
        promise.then(function (value) {
          console.log(value)
          var range = 1000000000
          var time = new Date().getTime()
          var seed = (time * 9301 + 49297) % 233280
          var rand = Math.ceil(seed / (233280.0) * range)
          self.tempId = rand + self.name
          self.hashedId = aesEnc.MD5(self.tempId).toString()
        }, function (value) {
          console.log(value)
        });
      }
    }) 
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },  
  friendInfo:function(){
      this.gopage("../friendInfo(detail)/friendInfo(detail)")
  },
  onShareAppMessage:function(){
    var that = this
    return {
      title: '邀请好友进行秘密通信',
      path: '/page/share?name=' + name + "?id=" + hashedId,
      success: function (res) {
        console.log("share success")
        conn.connect(that.commonRes,that.commonRej)
        conn.setRecvCallback(that.recvConfirm)
        var trd = wx.getStorageSync("trd_session_key")
        var dataSent = {
          tempId:hashedId,
          trd:trd
        }
        that.sendAESdata(dataSent,4)
      },
      fail: function (res) {
        console.log("share failed")
      }
    }
  },
  commonRes:function(res){
    console.log(res)
  },
  commonRej:function(res){
    console.log(res)
  },
  recvConfirm:function(res){
    var seqRecv = res.reply
    var seq = wx.getStorageSync("seq")
    if(seqRecv == seq+1){
      wx.setStorageSync("seq",seq + 2)
    }
  },
  sendAESdata: function (data2enc,state){
    var pwd = "123456"//用于生成aes密钥的字串，待改进
    var textEnc = aesEnc.AES.encrypt(JSON.stringify(data2enc), pwd)
    var aeskey = textEnc.key.toString()
    wx.setStorage({
      key: 'aeskey2server',
      data: pwd,
      success: function () {
        console.log("set aeskey successs")
      },
      fail: function (res) {
        console.log(res)
      }
    })
    var aesKeyEnc = rsaEnc.cryptico.encrypt(aeskey, wx.getStorageSync("server_public_key"));
    var textSent = textEnc.ciphertext.toString()
    var that = this
    var dataSent = {
      state: state,
      aeskeyEnc: aesKeyEnc.cipher,
      aesEncText: textSent
    }
    console.log(dataSent)
    conn.sendMsg(dataSent, that.commonRes, that.commonRej)
  },
})