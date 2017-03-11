//index.js
//获取应用实例
var app = getApp()
var isReg = 0;
const self = this
Page({
  /*
  data: {
    motto: 'Hello World',
    userInfo: {}
  },
  */
  //事件处理函数

  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log('onLoad')
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
    //点击login按钮时调用的函数
    wx.showToast({
      title:"登录中……",
      icon:"loading",
      duration:10000//延时10s用于登录
    })
    setTimeout(function(){
      if(!isReg){
        wx.showToast({
          title:"登录失败，请检查网络",
          icon:"",
          duration:3000
        })
      }
    },10001)//10s过后，登录失败
    this.isUser();
  },
  register:function(){

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
  isUser:function(){
    isReg = 1;//暂时没做登陆，认为已经注册
    wx.showToast({
      title:"登录成功",
      icon:"success",
      duration:3000
    })
    this.gopage("../dialogList/dialogList")
  },
 
  register:function(){
    //点击“注册”按钮时调用的函数
    this.gopage("../register/register")
  }
})
