小程序数据存储格式记录：

1. 好友信息存储格式：
friendList:
{
    {
        avatarUrl:<好友头像的Url>,
        province:<好友所在的省份>,
        city:<好友所在城市>,
        country:<好友所在国家>,
        gender:<好友性别>,
        name:<加好友时协商的昵称,一般是微信名>(string),
        friendID:<好友的唯一标识>(string),
        message:[<obj>]
        /*message{
            text:<data sent by friend>(string),
            time:<the time sent>(string)
        }
        */
        count：<记录未读消息条数>(int)
    },
    ...
}

2. 服务器公钥
{
  'server_public_key':RSA2048 pubkey（服务器周期性更新）
}

3. 会话代号（3rd key）
{
  'trd_session_key'：用户下线一段时间后失效
}

4. 对称密钥（小程序生成）
{
  "aeskey2server"：用于和服务器通信的密钥（每次一换）
}
5.消息序列号（用于每次会话验证服务器身份，防止重放攻击,每次接受消息之后+1）
{
  "seq":seq
}