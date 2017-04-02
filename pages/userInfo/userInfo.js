var app = getApp()
Page({
    data:{
        username:"",
        contact:"",
        addition:""
    },
    onLoad:function(){
        const self = this 
        wx.getUserInfo({
          success: function(res){
            var userInfo = res.userInfo;
            var name = userInfo.nickName;
            var avatarUrl = userInfo.avatarUrl
            var gender = userInfo.gender //性别 0：未知、1：男、2：女
            var province = userInfo.province
            var city = userInfo.city
            var add =" " + province + city
            if(gender == 1){
                add += " 男"
            }
            else if(gender == 2){
                add += " 女"
            }
            else{
                add += " 未知性别"
            }
            self.setData({
                username:name,
                addition:add
            })
          },
          fail: function() {
            console.log("获取用户信息失败")
          },
        })
    },
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