Page({
    data: {
        inputShowed: false,
        inputVal: ""
    },
    showInput: function () {
        this.setData({
            inputShowed: true
        });
    },
    hideInput: function () {
        this.setData({
            inputVal: "",
            inputShowed: false
        });
    },
    clearInput: function () {
        this.setData({
            inputVal: ""
        });
    },
    inputTyping: function (e) {
        this.setData({
            inputVal: e.detail.value
        });
    },
    searchFriend:function(){
        this.gopage("../friendInfo(simple)/friendInfo(simple)")
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