var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var browserify = require('browserify')
var html = require('bel')
var colors = require('colors')
var purify = require('purify-css')
var Clean = require('clean-css')
var dedent = require('dedent')
var minify = require('html-minifier').minify
var concat = require('concat-stream')
var documentify = require('documentify')
var hyperstream = require('hyperstream')
var pump = require('pump')
var critical = require('inline-critical-css')
var favicons = require('favicons')
var graph = require('buffer-graph')()

var entry = 'index.js'
var basedir = path.dirname(entry)
var outdir = path.join(basedir, 'dist')
var clean = new Clean(createCleanCssOptions())

graph.on('change', (nodeName, edgeName, state) => {
  var eventName = nodeName + ':' + edgeName
    , file
    , data
    , log

  if (eventName === 'scripts:bundle') {
    file = path.join(outdir, 'bundle.js')
    data = state.scripts.bundle.buffer
    log = ' ✨  create bundle.js'
  } else if (eventName === 'documents:bundle') {
    file = path.join(outdir, 'index.html')
    data = state.documents.bundle.buffer
    log = ' ✨  create index.html'
  } else if (eventName === 'manifest:bundle') {
    file = path.join(outdir, 'manifest.json')
    data = state.manifest.bundle.buffer
    log = ' ✨  create manifest.json'
  } else if (eventName === 'serviceWorker:bundle') {
    file = path.join(outdir, 'sw.js')
    data = state.serviceWorker.bundle.buffer
    log = ' ✨  create sw.js'
  } else if (eventName === 'styles:bundle') {
    file = path.join(outdir, 'bundle.css')
    data = state.styles.bundle.buffer
    log = ' ✨  create bundle.css'
  } else if (eventName === 'favicon:bundle') {
    file = path.join(outdir, 'favicon.ico')
    data = state.favicon.bundle.buffer
    log = ' ✨  create favicon.ico'
  }

  if (file) {
    writeFile(file, data, log)
  }
})

graph.node('scripts', (state, createEdge) => {
  var b = browserify({debug: true})
  var mapName = 'bundle.js.map'
  var mapFile  = path.join(outdir, mapName)

  b.add(entry)
   .transform('sheetify', { use: [ 'sheetify-inline', 'sheetify-cssnext' ] })
   .plugin('css-extract', { out: bundleStyles })

  bundleScripts()

  function bundleStyles () {
    return concat({ encoding: 'buffer' }, (buf) => {
      createEdge('style', buf)
    })
  }

  function bundleScripts () {
    b.bundle((err, bundle) => {
      createEdge('bundle', bundle)
    })
  }
})

graph.node('favicon', (state, createEdge) => {
  var fileName = path.join(basedir, 'app/assets/icon.png')

  favicons(fileName, createFavIconOptions(), (err, res) => {
    var icon = res.images.find((image) => {
      return image.name === 'favicon.ico'
    })

    createEdge('bundle', icon.contents)
  })
})

graph.node('documents', [ 'scripts:bundle', 'manifest:bundle', 'serviceWorker:bundle', 'styles:bundle', 'favicon:bundle' ], (state, createEdge) => {
  var body = '<div></div>'
  var language = 'en'
  var html = head(body, language)
  var d = documentify(entry, html)
  d.transform(viewportTransform)
  d.transform(polyfillTransform)
  d.transform(scriptTransform)
  d.transform(styleTransform)
  d.transform(preloadTransform)
  d.transform(manifestTransform)
  d.transform(descriptionTransform, { description: "A very cute app" })
  d.transform(titleTransform, { title: 'choo-scriber' })
  d.transform(criticalTransform, { css: state.styles.bundle.buffer })
  d.transform(faviconTransform, { icon: state.favicon.bundle.buffer})
  var source = d.bundle()

  pump(source, concat({ encoding: 'buffer' }, sink))

  function sink (buf) {
    createEdge('bundle', buf)
  }

  function head (body, lang) {
    var dir = 'ltr'
    return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head></head>${body}</html>`
  }

  function faviconTransform (opts) {
    var header = `
      <link rel="icon" type="image/x-icon" href="favicon.ico">
    `.replace(/\n +/g, '')

    return addToHead(header)
  }

  function criticalTransform (opts) {
    return critical(String(opts.css))
  }

  function titleTransform (opts) {
    var header = `
      <title>${opts.title}</title>
    `.replace(/\n +/g, '')
    return addToHead(header)
  }

  function descriptionTransform (opts) {
    var header = `
      <meta name="description" content="${opts.description}">
    `.replace(/\n +/g, '')
    return addToHead(header)
  }

  function manifestTransform () {
    var header = `
      <link rel="manifest" href="/manifest.json">
    `.replace(/\n +/g, '')
    return addToHead(header)
  }

  function preloadTransform () {
    var content = ';(function(a){"use strict";var b=function(b,c,d){function e(a){return h.body?a():void setTimeout(function(){e(a)})}function f(){i.addEventListener&&i.removeEventListener("load",f),i.media=d||"all"}var g,h=a.document,i=h.createElement("link");if(c)g=c;else{var j=(h.body||h.getElementsByTagName("head")[0]).childNodes;g=j[j.length-1]}var k=h.styleSheets;i.rel="stylesheet",i.href=b,i.media="only x",e(function(){g.parentNode.insertBefore(i,c?g:g.nextSibling)});var l=function(a){for(var b=i.href,c=k.length;c--;)if(k[c].href===b)return a();setTimeout(function(){l(a)})};return i.addEventListener&&i.addEventListener("load",f),i.onloadcssdefined=l,l(f),i};"undefined"!=typeof exports?exports.loadCSS=b:a.loadCSS=b})("undefined"!=typeof global?global:this);'
    content += ';(function(a){if(a.loadCSS){var b=loadCSS.relpreload={};if(b.support=function(){try{return a.document.createElement("link").relList.supports("preload")}catch(b){return!1}},b.poly=function(){for(var b=a.document.getElementsByTagName("link"),c=0;c<b.length;c++){var d=b[c];"preload"===d.rel&&"style"===d.getAttribute("as")&&(a.loadCSS(d.href,d,d.getAttribute("media")),d.rel=null)}},!b.support()){b.poly();var c=a.setInterval(b.poly,300);a.addEventListener&&a.addEventListener("load",function(){b.poly(),a.clearInterval(c)}),a.attachEvent&&a.attachEvent("onload",function(){a.clearInterval(c)})}}})(this);'

    var header = `<script nomodule>${content}</script>`
    return addToHead(header)
  }

  function scriptTransform () {
    var header = `<script src="bundle.js" defer></script>`
    return addToHead(header)
  }

  function styleTransform (opts) {
    var header = `<link rel="preload" as="style" href="bundle.css" onload="this.rel='stylesheet'">`
    return addToHead(header)
  }

  function viewportTransform () {
    var header = `
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    `.replace(/\n +/g, '')
    return addToHead(header)
  }

  function polyfillTransform () {
    var link = 'https://cdn.polyfill.io/v2/polyfill.min.js'
    var header = `<script src="${link}" defer></script>`
    return addToHead(header)
  }

  function addToHead (str) {
    return hyperstream({
      head: {
        _appendHtml: str
      }
    })
  }
})

graph.node('manifest', (state, createEdge) => {
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

  createEdge('bundle', Buffer.from(file))
})

graph.node('serviceWorker', (state, createEdge) => {
  fs.readFile('sw.js', (err, data) => {
    createEdge('bundle', data)
  })
})

graph.node('styles', [ 'scripts:style', 'scripts:bundle' ], (state, createEdge) => {
  var script = String(state.scripts.bundle.buffer)
    , style = String(state.scripts.style.buffer)
    , bundle = purify(script, style, { minify: true })
  bundle = clean.minify(bundle).styles
  createEdge('bundle', Buffer.from(bundle))
})

mkdirp(outdir, () => {
  graph.start()
})

function writeFile (file, data, log) {
  fs.writeFile(file, data, () => {
    console.log(log.green)
  })
}

function createCleanCssOptions () {
  return {
    level: {
      1: {
        specialComments: 0
      }
    }
  }
}

function createFavIconOptions () {
  return {
    icons: {
      android: false,
      appleIcon: false,
      appleStartup: false,
      favicons: true,
      firefox: false,
      windows: false,
      yandex: false
    }
  }
}
