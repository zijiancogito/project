var Lock = require('../../lib/lock.js');
var sha256 = require("../../crypto/sha256.js");
var app = getApp();
var qrApi = "https://www.mrxn.net/mrxnqrapi/api.php"
var text = ""
var code = ""
Page({
    data: {
        title: '绘制Secert',
    },
    onLoad: function () {
        wx.stopPullDownRefresh()
        this.lock = new Lock(this);
    },
    resetPwd: function() {
        this.lock.updatePassword();
    },
    onSuccess:function(){
        text = JSON.parse(wx.getStorageSync('commonSecret'))
         wx.showToast({
             title:"二维码生成中...",
            duration:1000,
            icon:"loading"
        })
        for(var i = 0; i < text.length;i++){
           code += text[i]["index"]
        }
        console.log("your secert is"+code)
        var enc = sha256(code)
        var encArray = enc.words
        var encString = ""
        for(var i = 0;i < 8;i++){
           encString += encArray[i].toString(16)
        }
        console.log(qrApi + "?data=" + encString)
        wx.previewImage({
            // current: 'String', // 当前显示图片的链接，不填则默认为 urls 的第一张
            urls: [qrApi + "?data=" + encString],
            success: function(res){
                console.log(res)
            },
            fail: function() {
                console.log("show QR code failed")
            }
        })
    },
    onTitleChanged: function(title) { // 文字变化的事件，自定义
        this.setData({
            title:title
        })
    }
});
