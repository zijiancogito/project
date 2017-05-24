var promise = require("../../lib/Promise.js")
var connSocket = require("../../function/connect.js")
var rsaEnc = require("../../rsa/cryptico.js")
var aesEnc = require("../../crypto/crypto-js.js")
var app = getApp()
Page({
    data:{
        list:[],
        msgRecv:false,
        userInfo:{}
    },
    onLoad:function(){
        const self = this
        var fl = wx.getStorageSync('friendList')
        var tempList = []
        app.getUserInfo(function(userInfo){
        //更新数据
            self.setData({
                userInfo:userInfo
            })
        })
        for(var i= 0; i < fl.length;i++){
            if(fl[i].message.length != 0){
                tempList = [...tempList,fl[i]]
            }
        }
        this.setData({
            list:tempList
        })
        wx.showToast({
            title:"正在从服务器加载离线消息",
            icon:"loading",
            duration:5000
        });
        setTimeout(function(){
            if(!self.data.msgRecv){
                wx.showToast({
                    title:"获取离线消息失败，请刷新重试",
                    icon:"success",
                    duration:3000
                })
            }
        },4000);
        connSocket.connect(self.resolve,self.reject)
        connSocket.setRecvCallback(self.msgHandler)
        var trd = wx.getStorageSync("trd_session_key")
        var seq = wx.getStorageSync("seq")
        var dataSent = {
            trd:trd,
            seq:seq
        }
        setTimeout(function(){ 
          self.sendAESdata(dataSent,2)
        },1000)
    },
    sendAESdata: function (data2enc, state) {
      var pwd = "123456"//用于生成aes密钥的字串，待改进
      var textEnc = aesEnc.AES.encrypt(JSON.stringify(data2enc), pwd)
      var aeskey = textEnc.key.toString()
      wx.setStorage({
        key: 'aeskey2server',
        data: pwd,
        success: function () {
          console.log("set aeskey successs")
        },
        fail: function (res) {
          console.log(res)
        }
      })
      var aesKeyEnc = rsaEnc.cryptico.encrypt(aeskey, wx.getStorageSync("server_public_key"));
      var textSent = textEnc.ciphertext.toString()
      var that = this
      var dataSent = {
        state: state,
        aeskeyEnc: aesKeyEnc.cipher,
        aesEncText: textSent
      }
      console.log(dataSent)
      connSocket.sendMsg(dataSent, that.resolve, that.reject)
    },
    msgHandler:function(data){
        //离线消息暂时用数组传输，视服务器方便而定
        /*
        数组元素格式{
                text: "",
                from: friendID,
                time:send time
            }
        若要传输图片，则格式如下：
            {
                text: 图片的url,
                from: 'recv',
                image:true
            }
        */
        var recv = JSON.parse(data)
        this.data.msgRecv = true
        var tempList = wx.getStorageSync("friendList")
        if(recv.state === 1){
            for(var i = 0;i < tempList.length;i++){
                if(tempList[i].name == recv.from){
                    tempList[i].count+=recv.log.length;
                    tempList[i].message = [...tempList[i].message,...recv.log];
                    wx.setStorageSync('friendList',tempList)
                    this.setData({
                        list:[...tempList]
                    })
                    break;
                }
            }
        }
        else if(recv.state === 0){
            wx.showToast({
                title:"接收离线消息完毕！",
                icon:"success",
                duration:3000
            })
        }
        else if(recv.state == 3){
            //接收到在线消息
            for(var i = 0;i<tempList.length;i++){
                if(tempList[i].name == recv.from){
                    var tempData = {
                        text:recv.text,
                        from:"recv"
                    }
                    tempList[i].count++;
                    tempList[i].message = [...tempList[i].message,tempData]
                    wx.setStorageSync('friendList', tempList)
                    this.setData({
                        list:[...tempList]
                     })
                    break;
                }
            }
        }
        else{
            console.log("离线消息接收时出现意外state")
        }
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
    },
    resolve:function(data){
        console.log(data)
    },
    reject:function(data){
        console.log(data)
    }
})