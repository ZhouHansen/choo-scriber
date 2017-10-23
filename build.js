var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var browserify = require('browserify')
var html = require('bel')
var colors = require('colors')
var minify = require('html-minifier').minify

var b = browserify()
var entry = 'index.js'
var basedir = path.dirname(entry)
var outdir = path.join(basedir, 'dist')

mkdirp(outdir, () => {
  b.add(entry)
   .transform('sheetify', { use: [ 'sheetify-inline', 'sheetify-cssnext' ] })
   .plugin('css-extract', { out: path.join(outdir, 'bundle.css') })

  console.log('create bundle.css'.green)

  b.bundle((err, buf) => {
    fs.writeFile(path.join(outdir, 'bundle.js'), buf, () => {
      console.log('create bundle.js'.green)
    })
  })

  var indexHtml = html`
    <!doctype html>
    <html lang="en" dir="ltr">
    <head>
      <title>choo-scriber</title>
      <link rel="stylesheet" href="bundle.css">
      <meta charset="utf-8">
    </head>
    <body>
      <div></div>
      <script src="bundle.js"></script>
    </body>
    </html>
  `

  fs.writeFile(path.join(outdir, 'index.html'), minify(indexHtml, {collapseWhitespace: true}), () => {
    console.log('create index.html'.green)
  })
})
