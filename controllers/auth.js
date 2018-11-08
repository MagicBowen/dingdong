const logger = require('../utils/logger').logger('controller-auth')
const config = require('../config.json')

var authenticate = async (ctx, next) => {
    try {
        logger.debug(ctx.query.state)
        await ctx.render('index.html')
    } catch(err) {
        ctx.response.type = "application/json"
        ctx.response.status = 404
        ctx.response.body = {reason : err}
    }
}

module.exports = {
    'GET /auth': authenticate
};