var html = require('choo/html')
var choo = require('choo')
var store = require('./app/store.js')
var storeButton = require('./app/components/storeButton.js')
var scribeButton = require('./app/components/scribeButton.js')
var scribeCanvas = require('./app/components/scribeCanvas.js')
var css = require('sheetify')

window.$ = require('jquery')
window.mitt = require('./app/mitt.js')

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
app.mount('body')

function mainView(state, emit){
  return html`
    <body class=${prefix}>
      <div class="container">
        ${storeButton(state, emit)}
        <div class="flex-box">
          ${scribeButton(state, emit)}
          ${scribeCanvas(state, emit)}
        </div>
      </div>
    </body>
  `
}
