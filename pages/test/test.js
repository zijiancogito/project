// test.js
var enc = require("../../function/encAndRand")
var aesEnc = require("../../crypto/crypto-js.js")
var proc = require("../../function/msgProc.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var plaintext = ""
    for (var k=0;k < 10;k++){
      plaintext +=  proc.rand(enc.random(), 1, 10000000, 99999999).toString()
    }
    for(var i = 0;i < 10; i++){
      var time = new Date().getTime()
      for (var j = 0; j < 1 * parseInt(Math.pow(10,i));j++){
        enc.sendEncData(plaintext)
      }
      console.log(i)
      var time2 = new Date().getTime()
      console.log(time2 - time)
    }
    var dataSent = {

    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})