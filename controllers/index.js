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

function getAgentName(query) {
    const AGENT_MAP = {
        'my_course' : 'course-record',
        'lucky_number' : 'indentifyCode'
    }
    return AGENT_MAP[query.application_info.application_name]
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