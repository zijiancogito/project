Page({
    toProtocol:function(){
        this.gopage("../protocol/protocol")
    },
    reg:function(){
        this.gopage("../dialogList/dialogList")
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
})
