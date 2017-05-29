var name = ""
var tempId = ""
var avatarUrl = ""
var province = ""
var city = ""
var country = ""
var gender = ""
Page({
  onLoad:function(options){
    wx.showModal({
      title: "来自小程序Secret Message的邀请",
      content: '你的好友' + name + "邀请你进行秘密通信，是否同意？",
      showCancel:true,
      cancelText:"拒绝",
      confirmText:"接受邀请",
      success:function(res){
        if(res.confirm){
          wx.navigateTo({
            url: '../friendAnswer/friendAnswer?question=' + options.question + "&tip=" + options.tip + "&hashAns=" + options.hashAns + '&rand=' + options.rand + "&invitedCode=" + options.InviteCode
          })
          console.log("接受邀请")
        }
        else if(res.cancel){
          console.log("拒绝邀请")
        }
      }
    })
  },
})