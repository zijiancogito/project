Page({
    addFriend:function(){
        this.gopage("../friendList/friendList")
    },
    gopage:function(url){
        wx.navigateTo({
        url: url,
        success: function(res){
            console.log("navigate to"+ url)
            wx.showToast({
                title:"添加成功",
                icon:"success",
                duration:3000
            })
        },
        fail: function() {
            console.log("navigate failed")
            wx.showToast({
                title:"添加失败",
                icon:"fail",
                duration:3000
            })
        },
        })
    }
})