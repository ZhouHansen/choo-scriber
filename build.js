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
  } else if (eventName === 'html:bundle') {
    file = path.join(outdir, 'index.html')
    data = state.html.bundle.buffer
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

graph.node('html', (state, createEdge) => {
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

  createEdge('bundle', Buffer.from(String(file)))
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
