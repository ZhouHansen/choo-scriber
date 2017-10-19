var html = require('choo/html')
var css = require('sheetify')
var Nanocomponent = require('nanocomponent')
var buttons = require('../buttons.json').storeButtons

css('../styles/storeButton.css')
css('spinkit/css/spinkit.css')

class Component extends Nanocomponent {
  constructor () {
    super()
  }

  createElement (state, emit) {
    return html`
      <div>
        ${buttons.map(button => {
          return html`
            <button
              type="button"
              class=${button.class}
              onclick=${handleClick(button.id, state, emit)}
              disabled=${state.fetch || state.save}
              id=${button.id}>
                ${button.text}
                ${(() => {
                  if (state[button.id]) {
                    return html`
                      <div class="sk-three-bounce">
                        <div class="sk-child sk-bounce1"></div>
                        <div class="sk-child sk-bounce2"></div>
                        <div class="sk-child sk-bounce3"></div>
                      </div>
                    `
                  } else {
                    return ''
                  }
                })()}
            </button>
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
      }, 500)
    } else if (action === 'save') {
      emit('pushing')
      setTimeout(() => {
        emit('pushed')
        localStorage.setItem('chooData', JSON.stringify(state))
      }, 500)
    }
  }
}

module.exports = new Component()
