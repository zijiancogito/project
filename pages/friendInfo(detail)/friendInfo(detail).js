Page({
    data:{
        friendName:"",
        contact:"",
        asume:""
    },
    onLoad:function(opt){
        var temp  = wx.getStorageSync('friendList')
        this.setData({
            friendName:opt["name"],
        })
        const self = this
        setTimeout(function(){
            for(var i = 0;i < temp.length;i++){
                if(temp[i].name == self.data.friendName){
                    console.log(temp[i].contact)
                    if(temp[i].contact != undefined)
                    {
                        self.setData({
                            contact:temp[i].contact,
                        })
                    }
                    if(temp[i].asume != undefined){
                        self.setData({
                            asume:temp[i].asume
                        })
                    }
                    break;
                }
            }
        }
        ,1000)
    },
    startDialog:function(){
        this.gopage("../dialog/dialog?name=" + this.data.friendName)
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