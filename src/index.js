import Koa from 'koa';
import pages from './pages'
import logger from 'koa-logger'
import json from 'koa-json'
import send from 'koa-send'
import mount from 'koa-mount'

const app = new Koa();

app.use(logger());
app.use(json());

app.use(mount(pages))

app.use(async (ctx) => {
  await send(ctx, ctx.path, { root: process.cwd() + '/public' });
})

app.listen(8080);
