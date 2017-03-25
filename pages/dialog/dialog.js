var conn = require( "../../function/connect.js")
var app = getApp()
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
    app.getUserInfo(function(data){
        self.setData({
            userName:data.nickName
        })
    })
    wx.setNavigationBarTitle({
        title: self.data.friendName 
    });
    wx.showModal({
      title:"提示",
      content:"是否加载本地消息记录？",
      cancelText:"不加载",
      cancelColor:"#FF0000",
      confirmText:"加载",
      success:function(res){
        if(res.confirm){
          //点击加载按钮
          
        }
      },
      fail:function(res){
        console.log("confirm wrong!")
      },
    });
    
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
    if(recv.state === 1){
      this.setData({
        messages:[...messages,...recv.log]
      })
    }
    else if(recv.state === 3 && recv.from == self.data.friendName){
      //接收到的是消息
       this.setData({
          messages: [...this.data.messages, {
                  text: recv.message,
                  from: 'recv'
          }]
       })
    }
    else if(recv.state === 3 && recv.from != self.data.friendName){
      console.log("意外情况")
    }
    else if(recv.state === 0){
       wx.showToast({
        title:"接收离线消息完毕！",
        icon:"success",
        duration:3000
      })
    }

  },
  resolve:function(data){
    console.log(data)
  },
  reject:function(data){
    console.log(data)
  }
})