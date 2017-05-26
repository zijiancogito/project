var name = ""
var tempId = ""
var avatarUrl = ""
var province = ""
var city = ""
var country = ""
var gender = ""
Page({
  onLoad:function(option){
    const self = this
    var name = option.name
    var tempId = option.tempId
    var avatarUrl = option.avatarUrl
    var province = option.province
    var city = option.city
    var country = option.country
    var gender = option.gender
    wx.showModal({
      title: "来自小程序Secret Message的邀请",
      content: '你的好友' + name + "邀请你进行秘密通信，是否同意？",
      showCancel:true,
      cancelText:"拒绝",
      confirmText:"接受邀请",
      success:function(res){
        if(res.confirm){
          wx.navigateTo({
            url: '/pages/login/login?name=' + name + "&id=" + tempId + "&avatarUrl=" + avatarUrl + "&province=" + province + "&city=" + city + "&country=" + country + "&gender" + gender,
          })
          console.log("用户点击确定")
        }
        else if(res.cancel){
          console.log("用户拒绝")
        }
      }
    })
  }
})