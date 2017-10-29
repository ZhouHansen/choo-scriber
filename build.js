var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var browserify = require('browserify')
var html = require('bel')
var colors = require('colors')
var tinyify = require('tinyify')
var dedent = require('dedent')
var exorcist = require('exorcist')
var minify = require('html-minifier').minify
var concat = require('concat-stream')

var b = browserify({debug: true})
var entry = 'index.js'
var basedir = path.dirname(entry)
var outdir = path.join(basedir, 'dist')
var mapfile  = path.join(outdir, 'bundle.js.map')
var concatStream = concat(gotBundle)

mkdirp(outdir, () => {
  writeBundle()
  writeHtml()
  writeManifest()
  writeServiceWorker()
})

function gotBundle (buf) {
  fs.writeFile(path.join(outdir, 'bundle.js'), buf, () => {
    console.log('create bundle.js'.green)
  })
}

function writeBundle () {
  b.add(entry)
   .transform('sheetify', { use: [ 'sheetify-inline', 'sheetify-cssnext' ] })
   .plugin('css-extract', { out: writeCss })
   .plugin('tinyify')
   .bundle()
   .pipe(exorcist(mapfile))
   .pipe(concatStream)
}

function writeCss (){
  return concat({ encoding: 'string' }, (str) => {
    fs.writeFile(path.join(outdir, 'bundle.css'), str, () => {
      console.log('create bundle.css'.green)
    })
  })
}

function writeManifest () {
  var filename = path.join(outdir, 'manifest.json')
  var file = dedent`
  {
    "name": "choo-scriber",
    "short_name": "choo-scriber",
    "description": "A very cute app",
    "start_url": "/",
    "display": "standalone",
    "background_color": "whitesmoke"
  }
  `

  fs.writeFile(filename, file, () => {
    console.log('create manifest.json'.green)
  })
}

function writeHtml () {
  var filename = path.join(outdir, 'index.html')
  var file = html`
    <!doctype html>
    <html lang="en" dir="ltr">
    <head>
      <title>choo-scriber</title>
      <link rel="manifest" href="manifest.json">
      <link rel="stylesheet" href="bundle.css">
      <meta charset="utf-8">
    </head>
    <body>
      <div></div>
      <script src="bundle.js"></script>
    </body>
    </html>
  `

  fs.writeFile(filename, minify(file, {collapseWhitespace: true}), () => {
    console.log('create index.html'.green)
  })
}

function writeServiceWorker () {
  fs.readFile('sw.js', (err, data) => {
    var filename = path.join(outdir, 'sw.js')

    fs.writeFile(filename, data, () => {
      console.log('create sw.js'.green)
    })
  })
}
