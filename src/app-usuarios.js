import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/iron-ajax/iron-ajax.js';
import './tarjeta-usuario.js';

class AppUsuarios extends PolymerElement {
  static get properties() {
    return {
      usuarios: { type: Array, value: () => [] },
      busqueda: { type: String, value: '' }
    };
  }

  static get template() {
    return html`
      <style>
        :host { display: block; max-width: 560px; margin: 0 auto; }
        h1 { margin: 0 0 16px; color: #1b1f3b; font-size: 26px; }
        input {
          width: 100%; box-sizing: border-box; padding: 10px 12px;
          border: 1px solid #c3c9dd; border-radius: 8px; font-size: 16px;
        }
        .resumen { color: #5f6577; margin: 12px 0 16px; }
      </style>

      <!-- Consume la API REST: la respuesta llega a "usuarios" por binding de dos vías -->
      <iron-ajax auto
                 url="https://jsonplaceholder.typicode.com/users"
                 handle-as="json"
                 last-response="{{usuarios}}"></iron-ajax>

      <h1>Directorio de usuarios</h1>
      <input type="search" placeholder="Buscar por nombre..." value="{{busqueda::input}}">
      <div class="resumen">
        Mostrando datos de [[usuarios.length]] usuarios · Favoritos: [[_contarFavoritos(usuarios.*)]]
      </div>

      <template is="dom-repeat" items="{{usuarios}}" as="usuario" filter="[[_crearFiltro(busqueda)]]">
        <tarjeta-usuario
          nombre="[[usuario.name]]"
          correo="[[usuario.email]]"
          empresa="[[usuario.company.name]]"
          favorito="{{usuario.favorito}}"></tarjeta-usuario>
      </template>
    `;
  }

  // Devuelve una función de filtro nueva cada vez que cambia el texto de búsqueda
  _crearFiltro(texto) {
    if (!texto) {
      return null; // sin filtro
    }
    const buscado = texto.toLowerCase();
    return (usuario) => usuario.name.toLowerCase().includes(buscado);
  }

  // Binding computado con comodín: se re-evalúa ante cualquier cambio en "usuarios"
  _contarFavoritos(cambio) {
    const lista = (cambio && cambio.base) || [];
    return lista.filter((usuario) => usuario.favorito).length;
  }
}

customElements.define('app-usuarios', AppUsuarios);
