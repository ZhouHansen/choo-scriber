var html = require('choo/html')
var Nanocomponent = require('nanocomponent')
var buttons = require('../buttons.json').storeButtons
var choosriber = require('../choosriber.js')

class Component extends Nanocomponent {
  constructor () {
    super()
  }

  createElement (state, emit) {
    return html`
      <div>
        ${buttons.map(button => {
          return html`
            <div
              class=${button.class}
              onclick=${handleClick(button.id, state, emit)}
              disabled=${state.fetch || state.save}
              id=${button.id}>
                ${button.text}
            </div>
          `
        })}
      </div>
    `
  }

  update (state) {
    return true
  }
}

function handleClick (action, state, emit) {
  return () => {
    if (action === 'fetch') {
      emit('pulling')
      setTimeout(() => {
        emit('pulled')
      }, 0)
    } else if (action === 'save') {
      emit('pushing')
      setTimeout(() => {
        emit('pushed')
        choosriber.put(state)
      }, 0)
    }
  }
}

module.exports = new Component()
