Page({
    data:{
        message:[]
    },
    onLoad:function(opt){
        var temp = wx.getStorageSync('friendList')
        for(var i = 0;i < temp.length;i++){
            if(temp[i].name == opt["name"]){
                this.setData({
                    message:temp[i].message
                })
                break;
            }
        }
        console.log(this.data.message)
    }
})