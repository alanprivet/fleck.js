const fs = require('fs')
const path = require('path')
const router1 = new Router({ prefix: '/f' })

functionsRoot = process.cwd() + '/functions'
fs.readdirSync(functionsRoot)
  .map((i) => {
    return [i.split('.')[0], require(path.join(functionsRoot, i))]
  })
  .forEach((i) => {
    router1.all(`/${i[0]}`, i[1])
  })
