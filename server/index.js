var merry = require('merry')
var send = require('send')

var app = merry({ env: { PORT: 8080 } })

app.route('GET', '/:static', (req, res, ctx) => {
  var path = `dist/${ctx.params.static.length ? ctx.params.static : 'index.html'}`
  send(req, path, {}).pipe(res)
})

app.listen(app.env.PORT)
