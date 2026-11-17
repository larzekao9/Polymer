import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';

class TarjetaUsuario extends PolymerElement {
  static get properties() {
    return {
      nombre:  { type: String, value: '' },
      correo:  { type: String, value: '' },
      empresa: { type: String, value: '' },
      // notify: true -> dispara el evento "favorito-changed" (binding de dos vías)
      favorito: { type: Boolean, value: false, notify: true, reflectToAttribute: true },
      // propiedad computada: se recalcula cuando cambia "nombre"
      iniciales: { type: String, computed: '_calcularIniciales(nombre)' }
    };
  }

  static get template() {
    return html`
      <style>
        :host { display: block; margin-bottom: 12px; }
        .tarjeta {
          display: flex; align-items: center; gap: 14px;
          background: #ffffff; border-radius: 10px; padding: 14px 16px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
        }
        :host([favorito]) .tarjeta { border-left: 6px solid #f5b301; }
        .avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: #3d5afe; color: #ffffff; font-weight: bold; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .datos { flex: 1; }
        .nombre { font-weight: bold; color: #1b1f3b; }
        .detalle { color: #5f6577; font-size: 14px; }
        button { border: none; background: none; font-size: 26px; cursor: pointer; color: #f5b301; }
      </style>

      <div class="tarjeta">
        <div class="avatar">[[iniciales]]</div>
        <div class="datos">
          <div class="nombre">[[nombre]]</div>
          <div class="detalle">[[correo]]</div>
          <template is="dom-if" if="[[empresa]]">
            <div class="detalle">Empresa: [[empresa]]</div>
          </template>
        </div>
        <button on-click="_alternarFavorito" title="Marcar como favorito">[[_icono(favorito)]]</button>
      </div>
    `;
  }

  _calcularIniciales(nombre) {
    return nombre.split(' ').filter(Boolean).slice(0, 2)
      .map((palabra) => palabra[0].toUpperCase()).join('');
  }

  _icono(favorito) {
    return favorito ? '★' : '☆';
  }

  _alternarFavorito() {
    this.favorito = !this.favorito;
  }
}

customElements.define('tarjeta-usuario', TarjetaUsuario);
