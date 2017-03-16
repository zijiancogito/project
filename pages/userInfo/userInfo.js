Page({
    
    confDel: function () {
        wx.showModal({
            content: '确定要删除所有的聊天记录吗？',
            showCancel: true,
            success: function (res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                    wx.showToast({
                        title: '删除完成',
                        icon: 'success',
                        duration: 3000
                    });
                }
            }
        });
    },
    confExit: function () {
        wx.showModal({
            content: '确定要退出吗？',
            showCancel: true,
            success: function (res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                    wx.navigateTo({
                        url: '../login/login',
                        success: function(res){
                            console.log("navigate to ../login/login")
                        },
                        fail: function() {
                            console.log("navigate failed")
                        },
                    })

                }
            }
        });
    }
})