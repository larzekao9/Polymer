import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class HolaPolymer extends PolymerElement {
  static get properties() {
    return {
      nombre: { type: String, value: 'Mundo' }
    };
  }

  static get template() {
    return html`
      <h2>¡Hola, [[nombre]]! Polymer funciona correctamente.</h2>
    `;
  }
}

customElements.define('hola-polymer', HolaPolymer);
