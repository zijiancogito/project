var rsaEnc = require("../rsa/cryptico.js")
var aesEnc = require("../crypto/crypto-js.js")
function random() {
  var range = 1000000000
  var time = new Date().getTime()
  var seed = (time * 9301 + 49297) % 233280
  var rand = Math.ceil(seed / (233280.0) * range)
  return rand
}

function sendEncData(data2enc, state) {
  var pwd = random().toString()//用于生成aes密钥的字串，待改进
  var textEnc = aesEnc.AES.encrypt(JSON.stringify(data2enc), pwd)
  console.log("aes iv = " + textEnc.iv)
  console.log("aes key = " + textEnc.key)
  var aeskey = textEnc.key.toString()
  var aesiv = textEnc.iv.toString()
  console.log(aeskey)
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

function aesDecrypt(secret) {
  var aseKey = wx.getStorageSync("aeskey2server")
  var res = aesEnc.AES.decrypt(secret, aesKey)
  return JSON.parse(res)
}

module.exports = {
  random: random,
  sendEncData: sendEncData,
  aesDecrypt: aesDecrypt
}