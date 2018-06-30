class BigStateCard extends HTMLElement {
  set hass (hass) {
    if (!this.content) {
      const card = document.createElement('ha-card')
      card.header = ''
      this.content = document.createElement('div')
      this.content.style.padding = '0 16px 16px'
      card.appendChild(this.content)
      this.appendChild(card)
    }

    const entityId = this.config.entity
    const state = hass.states[entityId]
    const stateStr = state ? state.state : 'unavailable'

    this.content.innerHTML = `<h3>${stateStr}</h3>`
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize () {
    return 3
  }
}

customElements.define('big-state-card', BigStateCard)
