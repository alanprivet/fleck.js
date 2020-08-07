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

const Koa = _interopDefault(require('koa'));
const fs = _interopDefault(require('fs'));
const klaw = _interopDefault(require('klaw'));
const path = _interopDefault(require('path'));
const hbs = _interopDefault(require('koa-hbs'));
const Router = _interopDefault(require('koa-router'));
const through2 = _interopDefault(require('through2'));
const logger = _interopDefault(require('koa-logger'));
const json = _interopDefault(require('koa-json'));
const send = _interopDefault(require('koa-send'));
const mount = _interopDefault(require('koa-mount'));

function loadConfig() {

  let options = {};

  options.dev = true;

  options.cwd = process.cwd();

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

const excludeDirFilter = through2.obj(function (item, enc, next) {
  if (!item.stats.isDirectory()) this.push(item);
  next();
});

const excludeJsFilter = through2.obj(function (item, enc, next) {
  if (!item.path.endsWith('.js')) this.push(item);
  next();
});

klaw(config.pagesDir)
  .pipe(excludeDirFilter)
  .pipe(excludeJsFilter)
  .on('data', async (i) => {
    const _path = i.path.split(config.pagesDir)[1].split('.hbs')[0].slice(1);
    const _route = _path.endsWith('index') ? path.posix.join('/', _path, '..') : path.posix.join('/', _path);

    await Promise.resolve().then(function () { return _interopNamespace(require(path.resolve(config.pagesDir, `${_path}.js`))); })
      .then((_module) => {
        router.get(_route, async (ctx, next) => { _module.default(ctx); await next(); });
      })
      .catch((error) => {});
    
    router.get(_route, async (ctx, next) => { await ctx.render(_path); });
  });

// function generatePagesRoutingConfiguration ({ dir = '', pagesDir = config.pagesDir }) {

//   const files = fs.readdirSync(path.join(pagesDir, dir), { withFileTypes: true })

//   files.forEach(async (dirEntry) => {
//     let route, middleware, templatePath;
//     const template = dirEntry.name.split('.hbs')[0]
//     const pathname = (template === 'index') ? '' : `${template}`

//     if (dirEntry.isFile() && dirEntry.name.endsWith('.hbs')) {

//       route = dir ? path.join('/', dir, pathname) : '/';

//       if (fs.existsSync(path.join(pagesDir, dir, `${template}.js`))) {
//         middleware = (await import(path.join(pagesDir, dir, template))).default
//       }

//       templatePath = dir ? `${dir}/${template}` : template;

//       console.log(middleware, route, templatePath)
//       router.get(
//         route,
//         async (ctx, next) => { middleware(ctx); await next() },
//         async (ctx, next) => { await ctx.render(templatePath) }
//       )

//     } else if (dirEntry.isDirectory()) {
//       generatePagesRoutingConfiguration({
//         dir: dir ? `${dir}/${dirEntry.name}` : dirEntry.name,
//       })
//     }
//   })
// }

// generatePagesRoutingConfiguration({})

pages.use(router.routes()).use(router.allowedMethods());

const app = new Koa();

app.use(logger());
app.use(json());

app.use(mount(pages));

app.use(async (ctx) => {
  await send(ctx, ctx.path, { root: process.cwd() + '/public' });
});

app.listen(8080);
