var html = require('choo/html')
var css = require('sheetify')
var buttons = require("../buttons.json").storeButtons

css('../styles/storeButton.css')
css('spinkit/css/spinkit.css')

function onclick(action, state, emit){
  return ()=>{
    if (action === 'fetch'){
      emit('pulling')
      setTimeout(()=>{
        emit('pulled')
      }, 500)
    } else if (action === 'save'){
      emit('pushing')
      setTimeout(()=>{
        emit('pushed')
        localStorage.setItem("chooData", JSON.stringify(state))
      }, 500)
    }
  }
}

function buttonGenerate(state, emit){
  return button=>{
    return html`
      <button
        type="button"
        class=${button.class}
        onclick=${onclick(button.id, state, emit)}
        disabled=${state.fetch||state.save}
        id=${button.id}>
          ${button.text}
          ${(()=>{
            if (state[button.id]){
              return  html `
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
  }
}

module.exports = (state, emit)=>{
  return html`${buttons.map(buttonGenerate(state, emit))}`
}
