Adaper server for DingDong voice skill platform.

SN : SA03211182968443
KEY : KD4kyN1crLqOaRf8QpkfOTHhd2lscisWBZAiAhf4IbYKD4kyN1crLqOaRf8QpkfOTHhd2lscisWBZAiAhf4IbYKD4kyN1crLqOaRf8QpkfOTHhd2lscisWBZAiAhf4Ib


> 在用户申请开通应用时，叮咚开放平台会在上述配置的用户登录认证地址中，通过“state”参数返回用户userid。 
> state 参数格式为json：{"userid":"用户标识","operation":"oauth","timestamp":"时间戳，毫秒","appid":"应用的APPID"} 
> 叮咚开放平台对state参数的加密过程（采用ECB模式，128位秘钥） 
> 1.叮咚开放平台使用应用配置的AesKey秘钥进行state 参数的加密 state_mi = AES.encrypt(state_ming,AesKey) 
> 2.叮咚开放平台将加密后的数据进行Base64编码 state_base64 = Base64.encode(state_mi) 
> 3.叮咚开放平台将Base64编码后的数据进行URL编码 state = UrlEncoder.encode(state_base64,"UTF-8"); 
> 应用对state参数的解密过程 
> 1.应用将接收到的数据进行Url解码，state_base64 = UrlDecoder.decode(state,"UTF-8") 
> 2.应用将解码后到的数据进行Base64解码 state_mi = Base64.decode(state_base64) 
> 3.应用使用应用配置的AesKey秘钥进行数据的解密 state = AES.decrypt(state_mi,AesKey) 
> 注意：用户登录认证成功后，应用云端需要进行重定向到：linglong://open?openAuthResult=1。其中，openAuthResult为1标识成功，其他表示失败

如果配置该地址，则提供给用户，用来填写该应用所需要的一些用户配置信息，像得到、考拉FM、万年历这类的内容提供的应用是不需要配置用户信息的。如果应用提供了该地址，叮咚音箱APP与应用的交互方式是：用户在音箱app里启用该应用时，叮咚开放平台会通过get方式，在地址的URL后面通过“state”参数返回用户userid。state参数格式为json：{"userid":"用户标识","operation":"set","timestamp":"时间戳，毫秒","appid":"应用的APPID"} 用户设置成功后可选择展示成功页面或重定向到：linglong://back以使叮咚音箱APP自动跳转

非必填项，如果不配置回调地址，则用户的应用开通结果，叮咚开放平台将不回调给应用；配置后，在用户申请开通或关闭应用时，叮咚开放平台会把开通或关闭应用的结果，采用get方式，通过“state”参数回调给应用。state 参数格式为json：{"userid":"用户标识","operation":"open/close","timestamp":"时间戳，毫秒","appid":"应用的APPID"} 在body返回中应答：0 （成功）， 1（失败）