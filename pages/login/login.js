//index.js
//获取应用实例
var connWebSocket = require("../../function/connect.js")
var app = getApp()
var isReg = 0;
var isOnline = 0
const self = this
Page({
  data: {
    loginInfo:{}
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
    connWebSocket.connect(this.commonRes,this.notOnline);
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
  },

  login:function(){
    //点击login按钮时调用
    if(!connWebSocket.isWebsocketOpen){
      //connWebSocket.connect(this.commonRes,this.notOnline);
    }
    wx.showToast({
      title:"登录中……",
      icon:"loading",
      duration:10000//延时10s用于登录
    })
    this.isUser()
  },

  isUser:function(){
    var account = this.data.loginInfo.account
    var password = this.data.loginInfo.password
    var dataSent = JSON.stringify({
      state:1,
      acc :account,
      psw:password
    })
    connWebSocket.setRecvCallback(this.msgHandle)
    connWebSocket.sendMsg(dataSent,this.commonRes,this.notOnline)
  },

   gopage:function(url){
    wx.navigateTo({
      url: url,
      success: function(res){
        console.log("jump to" + url)
      },
      fail: function() {
        console.log("jump fail")
      },
    })
  },
  register:function(){
    //点击“注册”按钮时调用的函数
    this.gopage("../register/register")
  },
  commonRes:function(result){
      console.log(result)
  },
  commonRej:function(result){
      console.log(result)
  },
  notOnline:function(data){
    wx.showToast({
      title:data,
      icon:'success',
      duration:3000
    })
  },
  msgHandle:function(data){
        var recv = JSON.parse(data)
        var res = recv.reply
        if(res == "success"){
            wx.switchTab({
              url: '../dialogList/dialogList',
              success: function(res){
                isReg = 1
                wx.showToast({
                  title:"登录成功",
                  icon:"success",
                  duration:3000
                })
              },
              fail: function() {
                wx.showToast({
                  title:"跳转失败",
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
