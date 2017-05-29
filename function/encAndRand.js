var rsaEnc = require("../rsa/cryptico.js")
var aesEnc = require("../crypto/crypto-js.js")
function random(){
  var range = 1000000000
  var time = new Date().getTime()
  var seed = (time * 9301 + 49297) % 233280
  var rand = Math.ceil(seed / (233280.0) * range)
  return rand
}
//十六进制字符串转字节数组  

function Str2Bytes(str) {
  var pos = 0;
  var len = str.length;
  if (len % 2 != 0) {
    return null;
  }
  len /= 2;
  var hexA = new Array();
  for (var i = 0; i < len; i++) {
    var s = str.substr(pos, 2);
    var v = parseInt(s, 16);
    hexA.push(v);
    pos += 2;
  }
  return hexA;
}  
function sendEncData(data2enc, state) {
  var pwd = random().toString()//用于生成aes密钥的字串，待改进
  var textEnc = aesEnc.AES.encrypt(JSON.stringify(data2enc), pwd)
  var aeskey = textEnc.key.toString()
  var aesiv = textEnc.iv.toString()
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
  var aesKeyEnc = rsaEnc.cryptico.encrypt(aeskey + "|" + aesiv, wx.getStorageSync("server_public_key"));
  var textSent = textEnc.ciphertext.toString()
  var that = this
  var dataSent = {
    state: state,
    aeskeyEnc: aesKeyEnc.cipher,
    aesEncText: textSent
  }
  return dataSent
}

function aesDecrypt(secret){
  //test
  var s = {'log':[], 'seq':0}
  var st = JSON.stringify(s)
   var aesKey = wx.getStorageSync("aeskey2server")
  var ciphertext1 = aesEnc.AES.encrypt(st, aesKey);
  var bytes = aesEnc.AES.decrypt(ciphertext1.toString(), aesKey);
   var plaintext1 = bytes.toString(aesEnc.enc.Utf8);
   var ciphertext = aesEnc.AES.decrypt(secret,aesKey)
   var plaintext = ciphertext.toString(aesEnc.enc.Utf8);
   return JSON.parse(plaintext)
}

module.exports={
  random:random,
  sendEncData: sendEncData,
  aesDecrypt: aesDecrypt
}