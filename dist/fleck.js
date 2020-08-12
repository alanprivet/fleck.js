'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

function _interopNamespace(e) {
  if (e && e.__esModule) { return e; } else {
    var n = {};
    if (e) {
      Object.keys(e).forEach(function (k) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      });
    }
    n['default'] = e;
    return n;
  }
}

require('fs-extra');
const Koa = _interopDefault(require('koa'));
const json = _interopDefault(require('koa-json'));
const logger = _interopDefault(require('koa-logger'));
const mount = _interopDefault(require('koa-mount'));
const path = _interopDefault(require('path'));
const serve = _interopDefault(require('koa-static'));
const ip = _interopDefault(require('ip'));
const fs = _interopDefault(require('fs'));
const klaw = _interopDefault(require('klaw'));
const hbs = _interopDefault(require('koa-hbs'));
const Router = _interopDefault(require('koa-router'));
const through2 = _interopDefault(require('through2'));

function loadConfig() {

  let options = {};

  options.dev = true;

  options.cwd = process.cwd();

  options.publicDir = path.join(options.cwd, 'static');
  options.pagesDir = path.join(options.cwd, 'pages');

  return options

}

const config = loadConfig();

const pages = new Koa();
const router = new Router();

pages.use(hbs.middleware({
  viewPath: config.pagesDir,
  defaultLayout: 'default',
  disableCache: config.dev
}));

if (fs.existsSync(path.join(config.cwd, 'layouts'))) {
  hbs.layoutsPath = path.join(config.cwd, 'layouts');
}

if (fs.existsSync(path.join(config.cwd, 'partials'))) {
  hbs.partialsPath = path.join(config.cwd, 'partials');
}

const excludeDirFilter = through2.obj(function (item, e, next) {
  if (!item.stats.isDirectory()) this.push(item);
  next();
});

const hbsOnlyFilter = through2.obj(function (item, e, next) {
  if (item.path.endsWith('.hbs')) this.push(item);
  next();
});

klaw(config.pagesDir)
  .pipe(excludeDirFilter)
  .pipe(hbsOnlyFilter)
  .on('data', async (i) => {
    const _path = i.path.split(config.pagesDir)[1].split('.hbs')[0].slice(1);
    const _route = _path.endsWith('index') ? path.posix.join('/', _path, '..') : path.posix.join('/', _path);

    await Promise.resolve().then(function () { return _interopNamespace(require(path.resolve(config.pagesDir, `${_path}.js`))); })
      .then((_module) => {
        router.get(_route, async (ctx, next) => { _module.default(ctx); await next(); });
      })
      .catch((error) => {
        if (error.code === 'MODULE_NOT_FOUND') ;
        else {
          console.log(error);
        }
      });
    
    router.get(_route, async (ctx, next) => { await ctx.render(_path); });
  });

pages.use(router.routes()).use(router.allowedMethods());

const app = new Koa();

app.use(logger());
app.use(json());

app.use(mount(pages));

/**
 * Serve files from public directory
 */
app.use(serve(config.publicDir));
app.use(serve(path.join(config.cwd, 'assets')));

app.listen(8080, 0, function () {
  console.log(`http://${ip.address()}:${this.address().port}`);
});
