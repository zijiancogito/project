Page({
    addFriend:function(){
        this.gopage("../index/index")
    },
    gopage:function(url){
        wx.navigateTo({
        url: url,
        success: function(res){
            console.log("navigate to "+ url)
        },
        fail: function() {
            console.log("navigate failed")
        },
        })
    }
})