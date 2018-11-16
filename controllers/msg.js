const logger = require('../utils/logger').logger('controller-msg')
const ChatBot = require('../utils/chatbot')
const agent = require('../utils/agent')
const config = require('../config.json')

function isIndicateQuit(agent, response) {
    if (agent === 'indentifyCode') return true
    if (response.reply.indexOf('哒尔文') != -1) return true
    if (!response || !response.data) return false
    return response.data.filter((data) => {return data.type === 'quit-skill'}).length > 0
}

function getAgentName(query) {
    return agent.getAgentName(query.application_info.application_name)
}

function getStartSkillEvent(agent) {
    if (agent === 'course-record') {
        return 'open-app'
    }
    return 'open-skill-' + agent
}

function getQuitSkillEvent(agent) {
    if (agent === 'course-record') {
        return 'close-app'
    }
    return 'quit-skill-' + agent
}

function getDirectives(response) {
    const directives = []
    if (response.reply) {
        directives.push({"content": response.reply, "type": "1"})
    }
    if (!response.data) return directives
    for (let data of response.data) {
        if (data.type && data.type === 'play-audio' && data['audio-url']) {
            directives.push({"content": data['audio-url'], "type": "2"})
        }
        if (data.type && data.type === 'text' && data['reply']) {
            directives.push({"content": data['reply'], "type": "1"})
        }
    }
    return directives
}

async function handleQuery(query) {
    logger.debug('receive query : ' + JSON.stringify(query))
    const agent = getAgentName(query)
    const userId = query.user.user_id
    const userContext = {source : 'dingdong', support_display : false}

    const chatbot = new ChatBot(agent, config['chatbot_url'])

    let response = null

    if (query.session.is_new) {
        response = await chatbot.replyToEvent(userId, getStartSkillEvent(agent), userContext)
    } else if (query.ended_reason === "USER_END") {
        response = await chatbot.replyToEvent(userId, getQuitSkillEvent(agent), userContext)
    } else {
        response = await chatbot.replyToText(userId, query.input_text, userContext)
    }
    
    logger.debug('response : ' + JSON.stringify(response))
    const result = {
        "directive": {
            "directive_items": getDirectives(response)
            },
            "extend":{"NO_REC":"0"},
            "is_end": isIndicateQuit(agent, response),
            "sequence": query.sequence,
            "timestamp": Date.now(),
            "versionid": "1.0"
    }
    logger.debug('result : ' + JSON.stringify(result))
    return result
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
    'POST /msg': handleMessage
};
