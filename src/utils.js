import fs from 'fs'
import path from 'path'
import klaw from 'klaw'
import through2 from 'through2'

const excludeDirFilter = through2.obj(function (item, enc, next) {
  if (!item.stats.isDirectory()) this.push(item)
  next()
})

const excludeJsFilter = through2.obj(function (item, enc, next) {
  if (!item.path.endsWith('.js')) this.push(item)
  next()
})

const dir = path.resolve('../primejuniorschool/pages')
klaw(dir)
  .pipe(excludeDirFilter)
  .pipe(excludeJsFilter)
  .on('data', async (i) => {
    const _path = i.path.split(dir)[1].split('.hbs')[0].slice(1)
    const _route = _path.endsWith('index') ? path.posix.join('/', _path, '..') : path.posix.join('/', _path)

    let _beforeRender = await import(path.resolve(dir, `${_path}.js`))
      .catch(console.error)

    console.log(_beforeRender, _path, _route)
  })

async function getFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = entries
    .filter(file => !file.isDirectory())
    .map(file => ({ ...file, path: path + file.name }));

  const folders = entries.filter(folder => folder.isDirectory());

  for (const folder of folders)
    files.push(...await getFiles(`${path}${folder.name}/`));

  return files;
}

export default getFiles
