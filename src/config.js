import path from 'path'

export default function loadConfig() {

  let options = {}

  options.dev = true

  options.cwd = process.cwd()

  options.pagesDir = path.join(options.cwd, 'pages')

  return options

}
