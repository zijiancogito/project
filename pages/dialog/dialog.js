var conn = require( "../../function/connect.js")
var app = getApp()
var tempList
Page({
  data:{
    messages:[],
    friendName:"",
    userName:"",
    msgRecv:false,
    inputContent:[],
    inputValue:""
  },
  onLoad:function(options){
    const self = this;
    conn.connect(self.resolve,self.reject);
    this.setData({
      friendName:options["name"],
    })
    var tempList = wx.getStorageSync('friendList')
    var msg = []
    tempList = wx.getStorageSync('friendList')
    for(var i = 0; i < tempList.length;i++){
      if(tempList[i].name == options["name"] && tempList[i].message.length != 0){
          tempList[i].count = 0//清空未读消息数
          wx.setStorageSync('friendList', tempList)
          msg = [...tempList[i].message]
          break;
        }
    }
    self.setData({
      messages:[...msg]//显示未读消息
    })
    app.getUserInfo(function(data){
        self.setData({
            userName:data.nickName
        })
    })
    wx.setNavigationBarTitle({
        title: self.data.friendName 
    });
  },
  onUnload:function(){
    // 页面关闭
    wx.showModal({
      title:"是否保留此次会话记录？",
      content:"‘不保留’仅删除本次聊天的记录，之前的记录不会被删除",
      cancelText:"不保留",
      confirmText:"保留",
      success:function(res){
        if(res.confirm){
          wx.setStorageSync('friendList', tempList)
        }
        console.log("显示成功")
      },
      fail:function(){
        console.log("显示失败")
      }
    })
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

  bindChange(e) {
        this.data.inputContent[e.currentTarget.id] = e.detail.value
    },

    sendMessage:function(){
        //点击send按钮触发的函数
        this.setData({
          messages: [...this.data.messages, {
                  text: this.data.inputContent.message,
                  from: 'sent'
            }]
        })
        this.setData({
            inputValue : ''
        })
        const _self = this
        console.log(_self)
        var dataSent = {
                state:3,
                targetName:_self.data.friendName,
                message:_self.data.messages[_self.data.messages.length - 1].text,
                name:_self.data.userName
        }
        conn.sendMsg(dataSent,this.resolve,this.reject);
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
    if(recv.state === 3 && recv.from == self.data.friendName){
      //接收到的是当前会话窗口好友的在线消息
       this.setData({
          messages: [...this.data.messages, {
                  text: recv.message,
                  from: 'recv'
          }]
       })
    }
    else if(recv.state === 3 && recv.from != self.data.friendName){
      //收到的是其他好友的在线消息
      for(var i = 0; i< tempList.length;i++){
        if(tempList[i].name == recv.from){
            var tempData = {
              text:recv.text,
              from:"recv"
            }
            tempList[i].message = [...tempList[i].message,tempData];
            break;
        } 
      }
    }
    else{
      console.log("dialog消息处理有问题")
    }
  },
  resolve:function(data){
    console.log(data)
  },
  reject:function(data){
    console.log(data)
  }
})