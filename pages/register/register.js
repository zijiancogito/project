var webSocketConn = require("../../function/connect.js")
Page({
    data: {
        registerInfo:{},
        checkboxItems: [
            {name: 'standard is dealt for u.', value: '0', checked: true},
            {name: 'standard is dealicient for u.', value: '1'}
        ],

        countryCodes: ["+86", "+80", "+84", "+87"],
        countryCodeIndex: 0,
        isAgree: false
    },

    onLoad:function(){
       webSocketConn.connect(this.res,this.rej);
    },

    toProtocol:function(){
        this.gopage("../protocol/protocol")
    },
    reg:function(){
        if(!this.data.isAgree){
            wx.showToast({
                title:"请勾选安全协议",
                icon:"success",
                duration:2000
            })
        }
        else{
            var dataSent = {
                state:0,
                name : this.data.registerInfo.nickName,
                phone: this.data.registerInfo.phoneNumber,
                psw: this.data.registerInfo.password
            }
            webSocketConn.setRecvCallback(this.msgHandler)
            webSocketConn.sendMsg(dataSent,this.res,this.rej)
        }
        
    },
    res:function(data){
        console.log(data)
    },
    rej:function(data){
        wx.showToast({
            title:data,
            icon:"success",
            duration:3000
        })
    },
    msgHandler:function(data){
        console.log(data)
        if(data == "success"){
            wx.showToast({
                title:"注册成功",
                icon:"success",
                duration:3000
            })
            setTimeout(function(){
                wx.switchTab({
                    url: '../dialogList/dialogList',
                    success: function(res){
                        console.log("")
                    },
                    fail: function() {
                        // fail
                    },
                    complete: function() {
                        // complete
                    }
                    })
                },3000)  
        }
        else{
            wx.showToast({
                title:"注册失败",
                icon:"success",
                duration:3000
            })
        }
    },
    bindAgreeChange: function (e) {
        this.setData({
            isAgree: !!e.detail.value.length
        });
    },
    bindCountryCodeChange: function(e){
        console.log('picker country code 发生选择改变，携带值为', e.detail.value);

        this.setData({
            countryCodeIndex: e.detail.value
        })
    },
    checkboxChange: function (e) {
        console.log('checkbox发生change事件，携带value值为：', e.detail.value);

        var checkboxItems = this.data.checkboxItems, values = e.detail.value;
        for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
            checkboxItems[i].checked = false;

            for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
                if(checkboxItems[i].value == values[j]){
                    checkboxItems[i].checked = true;
                    break;
                }
            }
        }

        this.setData({
            checkboxItems: checkboxItems
        });
    },
    bindChange:function(e){
        this.data.registerInfo[e.currentTarget.id] = e.detail.value
    },
    gopage:function(url){
    wx.navigateTo({
      url: url,
      success: function(res){
        console.log("jump to" + url)
      },
      fail: function() {
        console.log("jump fail")
      },
    })
  },
})
