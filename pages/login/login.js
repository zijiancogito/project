//index.js
//获取应用实例
var connWebSocket = require("../../function/connect.js")
var app = getApp()
const self = this
Page({
  data: {
    encryptedInfo:{},
    iv :""
  },
  // //事件处理
  // bindViewTap: function() {
  //   wx.navigateTo({
  //     url: '../logs/logs'
  //   })
  // },
  bindChange:function(e){
    this.data.loginInfo[e.currentTarget.id] = e.detail.value
  },
  onLoad: function () {
    console.log('onLoad')
     //连接服务器
    connWebSocket.connect(this.commonRes,this.commonRej);
    var that = this
    //获取加密敏感数据
    this.getEncryptedInfo(function(){
      var dataSent ={
        state : 1,
        encInfo:that.data.encryptedInfo,
        iv:that.data.iv
      }
      connWebSocket.setRecvCallback(this.msgHandle)
      connWebSocket.sendMsg(dataSent,this.commonRes,this.commonRej)
    })
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
  msgHandle:function(data){
        var recv = JSON.parse(data)
        var res = recv.reply
        if(res == "success"){
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
