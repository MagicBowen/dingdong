const logger = require('../utils/logger').logger('controller-msg')
const ChatBot = require('darwin-sdk').Chatbot
const Query = require('darwin-sdk').Query
const OpenSkillEvent = require('darwin-sdk').OpenSkillEvent
const QuitSkillEvent = require('darwin-sdk').QuitSkillEvent
const Response = require('darwin-sdk').Response
const agent = require('../utils/agent')
const config = require('../config.json')

function getAgentName(query) {
    return agent.getAgentName(query.application_info.application_name)
}

function getDirectives(chatbotReply) {
    const directives = []
    if (chatbotReply.getReply()) {
        directives.push({"content": chatbotReply.getReply(), "type": "1"})
    }
    if (!chatbotReply.getInstructs()) return directives
    for (let instruct of chatbotReply.getInstructs()) {
        if (instruct.type && instruct.type === 'play-audio' && instruct['url']) {
            directives.push({"content": instruct['url'], "type": "2"})
        }
        if (instruct.type && instruct.type === 'text' && instruct['reply']) {
            directives.push({"content": instruct['reply'], "type": "1"})
        }
    }
    return directives
}

async function getChatbotReply(query) {
    const agent = getAgentName(query)
    const userId = query.user.user_id

    const chatbot = new ChatBot(config.chatbot_url, agent, config.source)

    let chatbotReply = null
    if (query.session.is_new) {
        chatbotReply = await chatbot.dispose(new OpenSkillEvent(userId))
    } else if (query.ended_reason === "USER_END") {
        chatbotReply = await chatbot.dispose(new QuitSkillEvent(userId))
    } else {
        chatbotReply = await chatbot.dispose(new Query(userId, query.input_text))
    }
    
    return {
        "directive": {
            "directive_items": getDirectives(chatbotReply)
        },
        "extend":{"NO_REC":"0"},
        "is_end": chatbotReply.hasInstructOfQuit(),
        "sequence": query.sequence,
        "timestamp": Date.now(),
        "versionid": "1.0"
    }
}

async function handleQuery(query) {
    logger.debug('receive query : ' + JSON.stringify(query))
    const agent = getAgentName(query)
    if (!agent) {
        logger.error("ERROR: not found agent")
        return {
            "directive": {
                "directive_items": [
                    {
                        "content": "抱歉，没有找到该技能", "type": "1"
                    }
                ]
            },            
            "extend":{"NO_REC":"0"},
            "is_end": true,
            "sequence": query.sequence,
            "timestamp": Date.now(),
            "versionid": "1.0"            
        }
    }
    return await getChatbotReply(query)
}

var handleMessage = async (ctx, next) => {
    try {
        logger.debug(`receive: ${JSON.stringify(ctx.request.body)}`)
        const response = await handleQuery(ctx.request.body)
        logger.debug(`reply: ${JSON.stringify(response)}`)

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
