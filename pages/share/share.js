Page({
  onLoad:function(option){
    name = option.nickname
    id = option.id
    wx.showModal({
      title: "来自小程序Secret Message的邀请",
      content: '你的好友' + name + "邀请你进行秘密通信，是否同意？",
      showCancel:true,
      cancelText:"拒绝",
      confirmText:"接受邀请",
      success:function(res){
        if(res.confirm){
          console.log("用户点击确定")
        }
        else if(res.cancel){
          console.log("用户拒绝")
        }
      }
    })
  }
})