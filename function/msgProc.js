require("seedRandom.js")
var aesEnc = require("../crypto/crypto-js.js")
var seqStart = 10000000
var seqEnd = 99999999
var seqLen = 20
function seqEncrypt(msg,friendInfo){
  var index = friendInfo.seqRecvIndex
  if (index >= seqLen) {
    index = 0
    var res = seqUpdate(friendInfo, "send")
    var seqSent = res.seqSent
    var indexSeq = res.indexSeq
    var secret = res.secret
    var pwd = seqSent[indexSeq[index++]]
    var enctext = aesEnc.AES.encrypt(msg, pwd)
    return {
      update: 1,
      seqSent: seqSent,
      index: index,
      enctext: enctext,
      seqIndex: indexSeq,
      secret: secret
    }
  }
  else {
    var indexSeq = friendInfo.seqIndex
    var seqSent = friendInfo.seqSent
    var pwd = seqSent[indexSeq[index++]]
    var enctext = aesEnc.AES.encrypt(msg, pwd)
    return {
      update: 0,
      enctext: enctext,
      index: index
    }
  }
}

function seqDecrypt(msg,friendInfo){
  var index = friendInfo.seqRecvIndex
  if(index >= seqLen){
    index = 0
    var res = seqUpdate(friendInfo,"recv")
    var seqRecv = res.seqRecv
    var indexSeq = res.indexSeq
    var secret = res.secret
    var pwd = seqSent[indexSeq[index++]]
    var plaintext = aesEnc.AES.decrypt(msg,pwd)
    return{
      update:1,
      seqRecv: seqRecv,
      index:index,
      plaintext: plaintext,
      seqIndex:indexSeq,
      secret:secret
    }
  }
  else{
    var indexSeq = friendInfo.seqIndex
    var seqSent = friendInfo.seqSent
    var pwd = seqSent[indexSeq[index++]]
    var plaintext = aesEnc.AES.decrypt(msg, pwd)
    return {
      update:0,
      plaintext: plaintext,
      index:index
    }
  }
}

function seqUpdate(friendInfo, deType){
  var secret = friendInfo.secret
  secret = secret + 1 //待改进
  var seqIndex = testRandom(secret, seqLen, 0, seqLen)
  if(deType == "recv"){
    var friendId = friendInfo.friendId
    var seqRecv = testRandom(aesEnc.MD5(friendId + secret), seqLen, seqStart, seqEnd)
    return {
      updataInfo:0,//recv seq update
      secret:secret,
      seqRecv:seqRecv,
      seqIndex: seqIndex,
    }
  }
  else if(deType == "send"){
    var myId = wx.getStorageSync("uniqueId")
    var seqSent = testRandom(aesEnc.MD5(myId + secret), seqLen, seqStart, seqEnd)
    return{
      updataInfo: 1,//send seq update
      secret: secret,
      seqRecv: seqSent,
      seqIndex: seqIndex,
    }
  }
  else{
    console.log("decrypt type wrong :/function/msgProcess")
  }
}
function recvInviteReply(recv){
  var tempList = wx.getStorageSync("friendList")
  if (recv.result == 1) {
    for (var i = 0; i < tempList.length; i++) {
      if (tempList[i].inviteCode == recv.inviteCode) {
        tempList[i].friendId = recv.friendId
        var myId = wx.getStorageSync("uniqueId")
        tempList[i].sessionId = aesEnc.MD5(myId + tempList[i].secret + recv.friendId)
        var seq1 = testRandom(aesEnc.MD5(myId + tempList[i].secret), seqLen, seqStart, seqEnd)
        var seq2 = testRandom(aesEnc.MD5(recv.friendId + tempList[i].secret), seqLen, seqStart, seqEnd)
        var seq3 = testRandom(aesEnc.MD5(tempList[i].secret), seqLen, 0, seqLen)
        tempList[i].seqSent = seq1;
        tempList[i].seqRecv = seq2;
        tempList[i].seqIndex = seq3;
        tempList[i].seqRecvIndex = 0;
        tempList[i].seqSentIndex = 0;
        wx.setStorageSync("friendList", tempList)
        wx.navigateTo({
          url: '/pages/dialog/dialog?sessionId='+tempList[i].sessionId,
          success:function(){
            console.log("navigate successful to page: "+ url)
          },
          fail:function(res){
            console.log(res)
          }
        })
      }
    }
  }
  else if (recv.accept == 0) {
    wx.showToast({
      title: '好友拒绝了您的通信请求',
    })
  }
  else {
    wx.showToast({
      title: '回答问题错误',
    })
  }
}
function testRandom(seed,num,start,end){
  var res = []
  Math.seedrandom("hello")
  for(var i = 0; i< num;i++){
    res.push(Math.floor(Math.random() * (end - start)) + start)
  }
  return res
}

module.exports= {
  rand: testRandom,
  recvInviteReply: recvInviteReply,
  seqDecrypt: seqDecrypt,
  seqEncrypt: seqEncrypt
}