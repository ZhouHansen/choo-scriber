var html = require('choo/html')
var choo = require('choo')
var store = require('./app/store.js')
var storeButton = require('./app/components/storeButton.js')
var scribeButton = require('./app/components/scribeButton.js')
var scribeCanvas = require('./app/components/scribeCanvas.js')
var css = require('sheetify')

window.$ = require('jquery')

const prefix = css`
  .flex-box{
  	display: flex;
  }

  .container {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 20px;
  }
`
css('bootstrap')

var app = choo()

app.use(store)
app.route('/', mainView)
app.route('/choo-scriber', mainView)
app.mount('body')

function mainView (state, emit) {
  return html`
    <body class=${prefix}>
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