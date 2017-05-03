Page({
    onLoad:function(){
        wx.scanCode({
          success: function(res){
            console.log(res.result)
            if(res.result){
                wx.setStorageSync('mySecert', res.result)
            }
          },
          fail: function() {
            console.log("invalied code")
          },
        })
    }
})