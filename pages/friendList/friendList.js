// pages/friendList/friendList.js
Page({
  data: {
    inputShowed: false,
    inputVal: "",
    useName: "",
    res: [],
    temp: []
  },
  onLoad: function () {
    const self = this
    conn.connect(this.resolve, this.reject);
    conn.setRecvCallback(this.msgHandler);
    app.getUserInfo(function (userInfo) {
      self.setData({
        userName: userInfo.nickName
      })
    })
  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
    var dataSent = {
      state: 4,
      search: e.detail.value,
      requirer: this.data.userName
    }
    conn.sendMsg(dataSent, this.resolve, this.reject)
  },
  searchFriend: function () {
    this.gopage("../friendInfo(simple)/friendInfo(simple)")
  },
  gopage: function (url) {
    wx.navigateTo({
      url: url,
      success: function (res) {
        console.log("navigate to " + url)
      },
      fail: function () {
        console.log("navigate failed")
      },
    })
  },
  resolve: function (data) {
    console.log(data)
  },
  reject: function (data) {
    console.log(data)
  },
  msgHandler: function (parma) {
    var recv = JSON.parse(parma);
    if (recv.state == 4) {
      this.setData({
        res: recv.info
      })
    }
  },
  onLoad: function (options) {
    this.setData({
      temp: wx.getStorageSync('friendList')
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  friendInfo: function () {
    this.gopage("../friendInfo(detail)/friendInfo(detail)")
  },
})