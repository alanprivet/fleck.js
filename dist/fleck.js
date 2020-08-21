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

const express = _interopDefault(require('express'));
const morgan = _interopDefault(require('morgan'));
const path = _interopDefault(require('path'));
const ip = _interopDefault(require('ip'));
const klaw = _interopDefault(require('klaw'));
const hbs = _interopDefault(require('express-hbs'));
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

const pages = new express();

pages.engine('hbs', hbs.express4({
  defaultLayout: path.join(config.cwd, 'layouts/default'),
  layoutsDir: path.join(config.cwd, 'layouts'),
  partialsDir: path.join(config.cwd, 'partials'),
}));

pages.set('view engine', 'hbs');
pages.set('views', path.join(config.cwd, 'pages'));

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
        pages.get(_route, _module.default);
      })
      .catch((error) => {
        if (error.code === 'MODULE_NOT_FOUND') ;
        else {
          console.log(error);
        }
      });

    console.log(_route);
    
    pages.get(_route, async (req, res, next) => { res.render(_path, res.locals); });
  });

const app = new express();
app.use(morgan());

app.use('/', pages);

/**
 * Serve files from public directory
 */
app.use(express.static(config.publicDir));
app.use(express.static(path.join(config.cwd, 'assets')));

app.listen(8080, 0, function () {
  console.log(`http://${ip.address()}:${this.address().port}`);
});
