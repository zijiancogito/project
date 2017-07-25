require("seedRandom.js")
var aesEnc = require("../crypto/crypto-js.js")
var seqStart = 10000000
var seqEnd = 99999999
var seqLen = 20
function seqEncrypt(msg,friendInfo){
  var index = friendInfo.seqSentIndex
  if (index >= seqLen) {
    index = 0
    var res = seqUpdate(friendInfo, "send")
    var seqSent = res.seqSent
    var indexSeq = res.indexSeq
    var secret = res.secret
    var pwd = seqSent[indexSeq[index++]].toString()
    console.log("Enc log :")
    console.log(msg+pwd)
    console.log(friendInfo)
    var enctext = aesEnc.AES.encrypt(msg, pwd)
    return {
      update: 1,
      seqSent: seqSent,
      index: index,
      enctext: enctext.ciphertext.toString(),
      seqIndex: indexSeq,
      secret: secret
    }
  }
  else {
    var indexSeq = friendInfo.seqIndex
    var seqSent = friendInfo.seqSent
    console.log(friendInfo)
    var pwd = seqSent[indexSeq[index++]].toString()//toString影响解密？
    var enctext = aesEnc.AES.encrypt(msg, pwd).toString()
    console.log("Enc log :")
    console.log(msg+","+pwd)
    console.log(enctext)
    return {
      update: 0,
      enctext: enctext,
      index: index
    }
  }
}

function seqDecrypt(msg,friendInfo){
  console.log("seqDec test1:" + msg)
  var index = friendInfo.seqRecvIndex
  console.log("seqDec test2:"+index)
  if(index >= seqLen){
    index = 0
    var res = seqUpdate(friendInfo,"recv")
    var seqRecv = res.seqRecv
    var indexSeq = res.indexSeq
    var secret = res.secret
    var pwd = seqRecv[indexSeq[index++]].toString()
    console.log("seqDec test3:" + pwd)
    var plaintext = aesEnc.AES.decrypt(msg,pwd).toString(aesEnc.enc.Utf8)
    console.log("seqDec test4: update")
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
    console.log("seqDec test5: no update")
    var indexSeq = friendInfo.seqIndex
    var seqRecv = friendInfo.seqRecv
    var pwd = seqRecv[indexSeq[index++]].toString()
    console.log("seqDec test6: " + msg +"," +pwd)
    console.log(friendInfo)
    var plaintext = aesEnc.AES.decrypt(msg, pwd).toString(aesEnc.enc.Utf8)
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
  console.log("recvInviteRepy invoke!!!!!!!!!!!")
  console.log(recv)
  var tempList = wx.getStorageSync("friendList")
  if (recv.result == 1) {
    for (var i = 0; i < tempList.length; i++) {
      console.log("查找好友"+i)
      console.log(tempList[i])
      if (tempList[i].inviteCode == recv.inviteCode) {
        console.log("找到好友，信息如下：")
        console.log(tempList[i])
        tempList[i].friendId = recv.friendId
        var myId = wx.getStorageSync("uniqueId")
        tempList[i].sessionId = aesEnc.MD5(recv.friendId + tempList[i].secret + myId ).toString()
        var seq1 = testRandom(aesEnc.MD5(myId + tempList[i].secret).toString(), seqLen, seqStart, seqEnd)
        var seq2 = testRandom(aesEnc.MD5(recv.friendId + tempList[i].secret).toString(), seqLen, seqStart, seqEnd)
        var seq3 = testRandom(aesEnc.MD5(tempList[i].secret).toString(), seqLen, 0, seqLen)
        tempList[i].seqSent = seq1;
        tempList[i].seqRecv = seq2;
        tempList[i].seqIndex = seq3;
        tempList[i].seqRecvIndex = 0;
        tempList[i].seqSentIndex = 0;
        tempList[i].message = [];
        console.log("更新好友信息为：")
        console.log(tempList[i])
        wx.setStorageSync("friendList", tempList)
        wx.navigateTo({
          url: '/pages/dialog/dialog?sessionId='+tempList[i].sessionId,
          success:function(){
            console.log("navigate successful to page: " + '/pages/dialog/dialog?sessionId=' + tempList[i].sessionId)
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
    for (var i = 0;i < tempList.length;i++){
      if(tempList[i].inviteCode == recv.inviteCode){
        tempList.splice(i,1)
      }
    }
  }
  else {
    for (var i = 0; i < tempList.length; i++) {
      if (tempList[i].inviteCode == recv.inviteCode) {
        tempList.splice(i, 1)
      }
    }
    wx.showToast({
      title: '回答问题错误',
    })
  }
}
function testRandom(seed,num,start,end){
  var res = []
  Math.seedrandom(seed)
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