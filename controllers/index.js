const logger = require('../utils/logger').logger('controller-message')
const ChatBot = require('../utils/chatbot')
const config = require('../config.json')

var index = async (ctx, next) => {
    await ctx.render('index.html');
};

function isIndicateQuit(response) {
    if (!response || !response.data) return false
    return response.data.filter((data) => {return data.type === 'quit-skill'}).length > 0
}

async function handleQuery(query) {
    logger.debug('receive query : ' + JSON.stringify(query))
    const chatbot = new ChatBot('indentifyCode', config['chatbot_url'])
    const userId = query.user.user_id

    let response = null

    if (query.session.is_new) {
        response = await chatbot.replyToEvent(userId, 'open-skill-indentifyCode')
    } else if (query.ended_reason === "USER_END") {
        response = await chatbot.replyToEvent(userId, 'quit-skill-indentifyCode')
    } else {
        response = await chatbot.replyToText(userId, query.input_text)
    }
    
    logger.debug('response : ' + JSON.stringify(response))
    return {
        "directive": {
            "directive_items": [
            {
                "content": response.reply,
                "type": "1"
            }]
            },
            "extend":{"NO_REC":"0"},
            "is_end": isIndicateQuit(response),
            "sequence": query.sequence,
            "timestamp": Date.now(),
            "versionid": "1.0"
    }
}

var handleMessage = async (ctx, next) => {
    try {
        const response = await handleQuery(ctx.request.body)
        ctx.response.type = "application/json";
        ctx.response.status = 200;
        ctx.response.body = response        
    } catch(err) {
        ctx.response.type = "application/json";
        ctx.response.status = 404;
        ctx.response.body = {reason : err}
    }
}

module.exports = {
    'GET /': index,
    'POST /': handleMessage
};