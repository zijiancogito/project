// pages/friendList/friendList.js
Page({
  data:{
    temp :[]
  },
  onLoad:function(options){
    this.setData({
      temp:wx.getStorageSync('friendList')
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
})