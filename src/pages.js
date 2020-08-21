import klaw from 'klaw'
import express from 'express'
import path from 'path'
import hbs from 'express-hbs'
import through2 from 'through2'
import config from './config'

const pages = new express()

pages.engine('hbs', hbs.express4({
  defaultLayout: path.join(config.cwd, 'layouts/default'),
  layoutsDir: path.join(config.cwd, 'layouts'),
  partialsDir: path.join(config.cwd, 'partials'),
}))

pages.set('view engine', 'hbs')
pages.set('views', path.join(config.cwd, 'pages'))

const excludeDirFilter = through2.obj(function (item, e, next) {
  if (!item.stats.isDirectory()) this.push(item)
  next()
})

const hbsOnlyFilter = through2.obj(function (item, e, next) {
  if (item.path.endsWith('.hbs')) this.push(item)
  next()
})

klaw(config.pagesDir)
  .pipe(excludeDirFilter)
  .pipe(hbsOnlyFilter)
  .on('data', async (i) => {
    const _path = i.path.split(config.pagesDir)[1].split('.hbs')[0].slice(1)
    const _route = _path.endsWith('index') ? path.posix.join('/', _path, '..') : path.posix.join('/', _path)

    await import(path.resolve(config.pagesDir, `${_path}.js`))
      .then((_module) => {
        pages.get(_route, _module.default)
      })
      .catch((error) => {
        if (error.code === 'MODULE_NOT_FOUND') {}
        else {
          console.log(error)
        }
      })

    console.log(_route)
    
    pages.get(_route, async (req, res, next) => { res.render(_path, res.locals) })
  })

export default pages