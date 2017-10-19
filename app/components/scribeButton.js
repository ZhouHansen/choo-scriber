var html = require('choo/html')
var css = require('sheetify')
var Nanocomponent = require('nanocomponent')
var buttons = require('../buttons.json').scribeButtons

css('../styles/scribeButton.css')

class Component extends Nanocomponent {
  constructor () {
    super()
  }

  createElement (state, emit) {
    return html`
      <div class="draw">
        ${buttons.map(button => {
          return html`
            <button
              type="button"
              class=${button.class}
              id=${button.id}
              onclick=${handleClick(emit)}
              onblur=${handleBlur(state)}>
                ${button.text}
            </button>
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

function handleBlur (state) {
  return e => {
    setTimeout(() => {
      if (e.target.id === state.drawType) {
        e.target.focus()
      }
    }, 120)
  }
}

module.exports = new Component()
