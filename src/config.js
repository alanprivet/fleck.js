import path from 'path'

function loadConfig() {

  let options = {}

  options.dev = true

  options.cwd = process.cwd()

  options.publicDir = path.join(options.cwd, 'static')
  options.pagesDir = path.join(options.cwd, 'pages')

  return options

}

export default loadConfig()
