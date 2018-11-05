const postJson = require('./post-json');
const logger = require('./logger').logger('chatbot');

class Chatbot {
    constructor(agent, uri) {
        this.agent = agent;
        this.uri = uri;
    }
    
    async replyToText(userId, text) {
        let data = { query   : { query : text, confidence : 1.0 }, 
                     session : userId, 
                     agent   : this.agent };

        let response = await postJson(this.uri, data);
        return this.formatResponse(response);
    }

    async replyToEvent(userId, eventType, params) {
        let data = { event   : { name : eventType, content : params },
                     session : userId, 
                     agent   : this.agent};

        let response = await postJson(this.uri, data);
        return this.formatResponse(response);
    }

    formatResponse(response) {
        logger.debug(`chatbot reply ${JSON.stringify(response)}`);
        if (response.reply) {
            let result = this.concatReplies(response.reply);
            response.reply = result
        }
        return response;
    }

    concatReplies(replies) {
        var result = '';
        for(var i = 0; i < replies.length; i++) {
            result += replies[i];
        }
        return result;
    }
}

module.exports = Chatbot;