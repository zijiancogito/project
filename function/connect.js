module.exports = (function(){
    var isWebsocketOpen = false
    var msgToSend = []
    var servAddr = "ws://"+"123.206.68.127" + ":23947"
    var msgRecved = {}
    var recvCallback = null
    var uuid = null

    function connect(resolve,rej){
        //对目标服务器发起连接请求
        wx.connectSocket({
            url: servAddr,
            data: {},
            method: 'GET', 
            success:function(){
                resolve("socket connected")
            },
            fail: function(){
                rej("failed to connect socket")
            }
        })
    }

    function init(){
        //监听连接打开事件和收到信息事件
        wx.onSocketOpen(function() {
                isWebsocketOpen = true;
                console.log("Sockect Open!")
                while(msgToSend.length > 0){
                    var msg = msgToSend.pop();
                    sendMsg(msg);
                }
            })
        wx.onSocketMessage(function(data) {
            console.log("Recv msg: "+data.data)
            msgRecved.callback && msgRecved.callback.call(null,data.data,...msgRecved.params)
        })
    }
   
   function setRecvCallback(callback,...params){
       //设置接收到信息的回调函数
       if(callback){
           msgRecved.callback = callback;
           msgRecved.params = params;
       }
   }
    function sendMsg(msg,resolve,reject){
        //发送消息
        if(typeof(msg) == "object"){
            msg = JSON.stringify(msg);
        }
        if(isWebsocketOpen){
            wx.sendSocketMessage({
              data: msg,
              success: function(){
                  resolve(msg +" sent successfully!")
              },
              fail: function(){
                  reject("netWork wrong")
              }
            })
        }
        else{
            msgToSend.push(msg);
            reject("websocket not open!")
        }
    }

    init();//执行初始化操作
    return {
        connect:connect,
        sendMsg:sendMsg,
        setRecvCallback:setRecvCallback,
        isWebsocketOpen:isWebsocketOpen,
        init:init
    };
})()