Page({
    chatlog:function(){
        this.gopage("../chatlog/chatlog")
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