const Koa = require('koa');
const serve = require('koa-static');
const koaBody = require('koa-body');
const views = require('koa-views');
const session = require('koa-session');
const config = require('./config');

const responseTime = require('./middlewares/response-time');
const controllerRouter = require('./middlewares/controller-router');
const logger = require('./utils/logger').logger('server');

///////////////////////////////////////////////////////////
const app = new Koa();
app.keys = ['KOA KICKOFF'];

///////////////////////////////////////////////////////////
app.use(session(app));
app.use(responseTime());
app.use(serve('./static'));
app.use(views(__dirname + '/views', { map: {html: 'nunjucks' }}));
app.use(koaBody());
app.use(controllerRouter(__dirname + '/controllers'));

///////////////////////////////////////////////////////////
app.listen(config.port, config.host);
logger.info(`Server is running on ${config.host}:${config.port}...`);