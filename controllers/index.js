const logger = require('../utils/logger').logger('controller-message')

var index = async (ctx, next) => {
    await ctx.render('index.html');
};

var handleMessage = async (ctx, next) => {
    const message = ctx.request.body
    logger.debug(JSON.stringify(message))
    ctx.response.type = "application/json";
    ctx.response.status = 200;
    const response = {
        "directive": {
        "directive_items": [
            {
                "content": "您的幸运数字是88888",
                "type": "1"
            }
        ]
        },
        "extend":{"NO_REC":"0"},
        "is_end":true,
        "sequence":message.sequence,
        "timestamp":Date.now(),
        "versionid": "1.0"
    };
    logger.debug(JSON.stringify(response))
    ctx.response.body = response
}

module.exports = {
    'GET /': index,
    'POST /': handleMessage
};