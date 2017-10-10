var fs = require('fs')
var mkdirp = require('mkdirp')
var browserify = require('browserify')
var html = require('bel')

var b = browserify()

mkdirp('./build', ()=>{
  console.log('create builds folder')
  b.add('index.js')
  b.bundle((err, buf)=>{
    fs.writeFile('./build/bundle.js', buf, ()=>{
      console.log('create bundle.js')
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

    fs.writeFile('./build/index.html', indexHtml, ()=>{
      console.log('create index.html')
    })
  })
})
