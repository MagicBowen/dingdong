const logger = require('../utils/logger').logger('controller-auth')
const crypto = require('crypto')
const postjson = require('../utils/post-json')
const agent = require('../utils/agent')
const config = require('../config.json')

var decrypt = (key, data) => {
    let iv = ""
    var md5 = crypto.createHash('md5')
    md5.update(key)
    var secret = md5.digest()
    let crypted = new Buffer(data, 'base64').toString('hex')
    let decipher = crypto.createDecipheriv('aes-128-ecb', secret, iv)
    let decoded = decipher.update(crypted, 'hex', 'utf8')
    decoded += decipher.final('utf-8')
    return JSON.parse(decoded)
}

var authenticate = async (ctx, next) => {
    try {
        // let agentName = 'course-record'
        // if (ctx.query.skill) {
        //     agentName = agent.getAgentName(ctx.query.skill)
        // }
        // const request = decrypt(config.aes_key, ctx.query.state)
        // logger.debug('receive auth request : ' + JSON.stringify(request))
        // const requestForCode = {userId : request.userid, platform: "dingdong", skill: agentName}
        // const result = await postjson(config.bing_code_url, requestForCode)
        // await ctx.render('auth.html', {code : result.code})
        await ctx.render('auth.html', {code : 10000})
    } catch(err) {
        ctx.response.type = "application/json"
        ctx.response.status = 404
        ctx.response.body = {reason : JSON.stringify(err)}
    }
}

module.exports = {
    'GET /auth': authenticate
}

// const key = 'KD4kyN1crLqOaRf8QpkfOTHhd2lscisWBZAiAhf4IbYKD4kyN1crLqOaRf8QpkfOTHhd2lscisWBZAiAhf4IbYKD4kyN1crLqOaRf8QpkfOTHhd2lscisWBZAiAhf4Ib'
// const state = 'mglhxOo7eJYKyrEWkJ7bTXhlnt0mtkECjSPVGeWQb1ulggkHfF59eOT3/dwa7MZ5d+W83xyKrGS8eL4yfkHSQLrN7hAIipxv1l54sR/rrYC42pQJ0tQrSddhtZivVRL5Bz2yz7Kepy849Fi4lmC5MkjoGS6ylJQzqv9V3M8cm/WVa/4mWT1l6MGCfMQlhdhZC2cSOqtZFwTnc1Zqz40skgDprH26bnbDoafs9NmHl1s='
// console.log(decrypt(key, state))
