var fs = require('fs')
var mkdirp = require('mkdirp')
var browserify = require('browserify')
var html = require('bel')
var colors = require('colors')
var minify = require('html-minifier').minify

var b = browserify()

mkdirp('./build', () => {
  console.log('create builds folder'.green)
  b.add('index.js')
   .transform('sheetify', { use: [ 'sheetify-inline', 'sheetify-cssnext' ] })
   .bundle((err, buf) => {
     fs.writeFile('./build/bundle.js', buf, () => {
       console.log('create bundle.js'.green)
     })
   })

  var indexHtml = html`
    <!doctype html>
    <html lang="en" dir="ltr">
    <head>
      <title>choo-scriber</title>
      <meta charset="utf-8">
    </head>
    <body>
      <div></div>
      <script src="bundle.js"></script>
    </body>
    </html>
  `

  fs.writeFile('./build/index.html', minify(indexHtml, {collapseWhitespace: true}), () => {
    console.log('create index.html'.green)
  })
})
