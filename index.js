var html = require('choo/html')
var choo = require('choo')
var store = require('./app/store.js')
var storeButton = require('./app/components/storeButton.js')
var scribeButton = require('./app/components/scribeButton.js')
var scribeCanvas = require('./app/components/scribeCanvas.js')
var css = require('sheetify')

window.$ = require('jquery')

const TITLE = 'choo-scriber'

css('bootstrap')
css('./app/main.css')

var app = choo()

app.use(store)
app.route('/', mainView)
app.route('/choo-scriber', mainView)
app.mount('body')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('https://zhouhansen.github.io/choo-scriber/sw.js').then(registration => {
      console.log('register service worker successfully')
    }).catch(err => {
      console.log(err)
    })
  })
}

function mainView (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return html`
    <body>
      <div class="container">
        ${storeButton.render(state, emit)}
        <div class="flex-box">
          ${scribeButton.render(state, emit)}
          ${scribeCanvas.render(state, emit)}
        </div>
        <a target="_blank" href="https://www.youtube.com/watch?v=ZVMYe-qiKlA">
          how to use
        </a>
      </div>
    </body>
  `
}
