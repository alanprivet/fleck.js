import fse from 'fs-extra';
import Koa from 'koa';
import json from 'koa-json';
import logger from 'koa-logger';
import mount from 'koa-mount';
import path from 'path';
import serve from 'koa-static';
import ip from 'ip';
import config from './config';
import pages from './pages';

const app = new Koa();

app.use(logger());
app.use(json());

app.use(mount(pages))

/**
 * Serve files from public directory
 */
app.use(serve(config.publicDir))
app.use(serve(path.join(config.cwd, 'assets')))

app.listen(8080, 0, function () {
  console.log(`http://${ip.address()}:${this.address().port}`)
});
