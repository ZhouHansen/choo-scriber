var fs = require('fs')
var mkdirp = require('mkdirp')
var browserify = require('browserify')
var createHTML = require('create-html')

var b = browserify()

mkdirp('./build', ()=>{
  console.log('create builds folder')
  b.add('index.js')
  b.bundle((err, buf)=>{
    fs.writeFile('./build/bundle.js', buf, ()=>{
      console.log('create bundle.js')
    })

    var html = createHTML({
      title:  "choo-scriber",
      script: "bundle.js",
      body: "<div></div>",
    })

    fs.writeFile('./build/index.html', html, ()=>{
      console.log('create index.html')
    })
  })
})
