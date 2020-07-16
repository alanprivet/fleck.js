const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const json = require('koa-json');

const app = new Koa();
const router = new Router();

router.get('/', async (ctx, next) => {
  ctx.body = 'Hello, World!\n';
  await next();
});

app.use(logger());
app.use(json());

app.use(router.routes()).use(router.allowedMethods());

app.listen(8080);
