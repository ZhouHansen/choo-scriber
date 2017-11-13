var html = require('choo/html')
var Nanocomponent = require('nanocomponent')
var buttons = require('../buttons.json').scribeButtons

class Component extends Nanocomponent {
  constructor () {
    super()
  }

  createElement (state, emit) {
    return html`
      <div class="dib mt3">
        ${buttons.map(button => {
          return html`
            <div
              class=${button.class}
              id=${button.id}
              onclick=${handleClick(emit)}>
              ${button.text}
            </div>
          `
        })}
      </div>
    `
  }

  update () {
    return false
  }
}

function handleClick (emit) {
  return e => {
    emit('changeDraw', e.target.id)
  }
}

module.exports = new Component()
