var merry = require('merry')
var send = require('send')

var app = merry({ env: { PORT: 8080 } })

app.use((req, res, ctx) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
})

app.route('GET', '/:static', (req, res, ctx) => {
  var path = `dist/${ctx.params.static.length ? ctx.params.static : 'index.html'}`
  send(req, path, {}).pipe(res)
})

app.listen(app.env.PORT)
