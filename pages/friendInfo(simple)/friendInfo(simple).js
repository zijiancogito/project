var temp = []
Page({
    data:{
        name:"",
        asume:"",
        phoneNumber:""
    },
    onLoad:function(opt){
        this.setData({
            name:opt["name"],
            asume:opt["asume"],
            phoneNumber:opt["phoneNumber"]
        })
        temp = wx.getStorageSync('friendList')
    },
    addFriend:function(){
        temp.push({
            name:this.data.name,
            asume:this.data.asume,
            contact:this.data.phoneNumber,
            avatar:"../../image/love.png",
            message:[],
            count:0//未读消息数
        })
        wx.setStorageSync('friendList', temp)
        this.gopage("../friendList/friendList")
    },
    gopage:function(url){
        wx.switchTab({
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