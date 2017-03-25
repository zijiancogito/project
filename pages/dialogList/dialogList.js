var promise = require("../../lib/Promise.js")
var connSocket = require("../../function/connect.js")
Page({
    data:{
        list:[
            {
                avatar:"../../image/cao.png",
                name:"曹颖",
            },
            {
                avatar:"../../image/chen.png",
                name:"高德",
            },
        ],
        msgRecv:false
    },
    onLoad:function(){
        const self = this
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
        var dataSent = {
            state:2,
            myName:self.data.userName,
            friendName:self.data.friendName
        }
        //connSocket.sendMsg(dataSent,self.resolve,self.reject)
        setTimeout(function(){ 
            connSocket.sendMsg(dataSent,self.resolve,self.reject)
        },1000)
    },
    msgHandler:function(data){
        //离线消息暂时用数组传输，视服务器方便而定
        /*
        数组元素格式{
                text: "",
                from: 'recv'
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
        if(recv.state === 1){
            for(i in wx.getStorageInfoSync("friendList")){
                if(i.name == recv.name){
                    
                }
            }

            for(item in recv.log){
                var log = {
                    name:item.friendName,
                    msg:[...wx.getStorageInfoSync("log"),...recv.log],
                }
            }
            
            wx.setStorage({
              key: 'friendList',
              data: log,
              success: function(res){
                  console.log("接收到离线消息")
              },
              fail: function() {
                console.log("接收离线消息失败")
              },
            })
        }
        else if(recv.state === 0){
            wx.showToast({
                title:"接收离线消息完毕！",
                icon:"success",
                duration:3000
            })
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

