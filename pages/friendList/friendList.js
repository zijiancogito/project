// pages/friendList/friendList.j
var conn = require("../../function/connect.js")
var enc = require("../../function/encAndRand.js")
var aesEnc = require("../../crypto/crypto-js.js")
var app = getApp()
var name = ""
var tempId = ""
var hashedId = ""
var avatarUrl = ""
var province = ""
var city = ""
var country = ""
var gender = ""
Page({
  data:{
    temp :[],
    avatarUrl: "https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1188647240,165150850&fm=117&gp=0.jpg"//测试url
  },
  onLoad:function(options){
    const self = this
    conn.connect(this.commonRes, this.commonRej)
    this.setData({
      temp:wx.getStorageSync('friendList')
    })
    wx.showShareMenu({
      withShareTicket:true
    })
    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        self.name = userInfo.nickName
        self.avatarUrl = userInfo.avatarUrl
        self.gender = userInfo.gender
        self.province = userInfo.province
        self.city = userInfo.city
        self.country = userInfo.country
        var promise = new Promise(function (resolve, reject) {
          if (self.name != undefined) {
            resolve("get name success");
          } else {
            reject("get name failed");
          }
        });
        promise.then(function (value) {
          console.log(value)
          var rand = enc.random()
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
      path: '/page/share/share?name=' + name + "&tempId=" + hashedId+"&avatarUrl="+avatarUrl+"&province="+province+"&city="+city+"&country="+country+"&gender"+gender,
      success: function (res) {
        console.log("share success")
        conn.setRecvCallback(that.recvConfirm)
        var trd = wx.getStorageSync("trd_session_key")
        var dataSent = {
          tempId:hashedId,
          trd:trd
        }
        var data = enc.sendEncData(dataSent,4)
        conn.sendMsg(data, that.commonRes, that.commonRej)
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
    var recv = JSON.parse(res)
    var msg = enc.aesDecrypt(recv.secret)
    var seqRecv = msg.seq
    var seq = wx.getStorageSync("seq")
    if(seqRecv == seq+1){
      wx.setStorageSync("seq",seq + 2)
    }
    else{
      console.log("seq wrong at page friendList")
    }
  },
 })