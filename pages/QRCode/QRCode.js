var qrApi = "https://www.mrxn.net/mrxnqrapi/api.php"
var text = "233333"
Page({
    onLoad:function(){
        wx.navigateTo({
          url: '../gestureCode/gestureCode',
          success: function(res){
            console.log(res)
          },
          fail: function() {
            console.log(res)
          }
        })
        
    }
    
})